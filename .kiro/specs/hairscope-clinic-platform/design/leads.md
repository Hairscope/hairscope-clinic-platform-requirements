# Leads - Design

> **Version:** 1.0.0 | **Status:** Draft | **Branch:** designs
> **Requirements:** `requirements/modules/leads.md`

---

## 1. Overview

The Leads module is a CRM for capturing, nurturing, and converting prospective patients. Leads enter via three sources: manual entry, webhook ingestion, and the Selfie Analysis web component. Assignment is controlled by the org-level `leadAssignmentMode` setting.

**Key design decisions:**
- `leadAssignmentMode` (AUTO_ASSIGN / MANUAL_ASSIGN) is org-level, affects all non-clinic-staff sources
- Clinic Staff manual leads always go to their own clinic regardless of mode
- `Lead_Distribution_Algorithm` is a pluggable engine (currently Round-Robin)
- Unassigned leads (`clinicId = null`) visible to Org_Admin only
- Lead_Actions are referenced (not copied) on patient conversion
- Org API key authenticates web components and webhooks (not clinic-specific)

---

## 2. Data Models

### 2.1 Lead

```javascript
const LeadSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  clinicId: { type: String, default: null, ref: 'Clinic' }, // null = unassigned
  assignedTo: { type: String, default: null, ref: 'Staff' }, // responsibility field
  createdBy: { type: String, default: null, ref: 'Staff' }, // attribution (null for webhook/selfie)

  // Profile
  name: { type: String, required: true, trim: true },
  email: { type: String, default: '', lowercase: true, trim: true },
  phone: { type: String, default: '' },
  age: { type: Number, default: null },
  gender: { type: String, default: '' },

  // Status & priority
  status: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'],
    default: 'NEW'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  tags: [{ type: String }],

  // Source tracking
  leadSource: {
    type: String,
    enum: ['MANUAL', 'WEBHOOK', 'SELFIE_ANALYSIS'],
    required: true
  },
  sourceDetail: { type: String, default: '' }, // page URL or campaign ID
  webhookSourceId: { type: String, default: null, ref: 'WebhookSource' },

  // Selfie analysis data (if source = SELFIE_ANALYSIS)
  selfieAnalysisReportUrl: { type: String, default: null },
  selfieAnalysisData: { type: Schema.Types.Mixed, default: null },

  // Suggested clinic (MANUAL_ASSIGN mode - pending Org Admin confirmation)
  suggestedClinicId: { type: String, default: null, ref: 'Clinic' },

  // Conversion
  convertedPatientId: { type: String, default: null, ref: 'Patient' },
  convertedAt: { type: Date, default: null },
  convertedBy: { type: String, default: null, ref: 'Staff' }
}, { timestamps: true });

LeadSchema.index({ organizationId: 1, clinicId: 1, status: 1 });
LeadSchema.index({ organizationId: 1, clinicId: 1, assignedTo: 1 });
LeadSchema.index({ organizationId: 1, clinicId: 1 }); // for unassigned leads query
LeadSchema.index({ status: 1, clinicId: 1 });
```

### 2.2 Lead Action

```javascript
const LeadActionSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  leadId: { type: String, required: true, ref: 'Lead' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  performedBy: { type: String, required: true, ref: 'Staff' },

  actionType: {
    type: String,
    enum: ['WHATSAPP', 'EMAIL', 'FACEBOOK_MESSAGE', 'PHONE_CALL', 'IN_PERSON_MEETING', 'OTHER'],
    required: true
  },
  content: { type: String, default: '' },
  statusChangeTo: { type: String, default: null } // optional status change logged with action
}, { timestamps: true });

LeadActionSchema.index({ leadId: 1, createdAt: -1 }); // newest first
```

### 2.3 Webhook Source

```javascript
const FieldMappingSchema = new Schema({
  sourceField: { type: String, required: true },
  targetField: { type: String, required: true }, // Lead field name
  required: { type: Boolean, default: false }
}, { _id: false });

const WebhookSourceSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  name: { type: String, required: true, trim: true },
  endpointPath: { type: String, required: true, unique: true }, // /webhooks/leads/{sourceId}
  apiKeyHash: { type: String, required: true }, // hashed org API key
  fieldMappings: [FieldMappingSchema],
  version: { type: String, default: '1.0' }, // field mapping version
  createdBy: { type: String, required: true, ref: 'Staff' }
}, { timestamps: true });

WebhookSourceSchema.index({ organizationId: 1 });
```

### 2.4 Lead Distribution State (Round-Robin tracking)

```javascript
const LeadDistributionStateSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic', unique: true },
  lastAssignedStaffId: { type: String, default: null, ref: 'Staff' },
  rotationOrder: [{ type: String, ref: 'Staff' }], // ordered list of eligible staff
  updatedAt: { type: Date, default: Date.now }
});

LeadDistributionStateSchema.index({ clinicId: 1 }, { unique: true });
```

---

## 3. Key Flows

### 3.1 Lead Assignment Flow

```javascript
async function assignLeadToClinic(leadId, clinicId, ctx) {
  // Get next staff via Lead_Distribution_Algorithm (Round-Robin)
  const assignedStaffId = await leadDistributionAlgorithm.getNextStaff(clinicId);

  await mongoose.startSession().then(async (dbSession) => {
    await dbSession.withTransaction(async () => {
      await Lead.findByIdAndUpdate(leadId,
        { clinicId, assignedTo: assignedStaffId },
        { session: dbSession }
      );
      await AuditLog.create([{ action: 'LEAD_UPDATED', resourceId: leadId, ... }],
        { session: dbSession }
      );
      await OutboxEvent.create([{
        eventType: 'LeadCreated',
        aggregateType: 'LEAD',
        aggregateId: leadId,
        payload: { leadId, clinicId, assignedTo: assignedStaffId }
      }], { session: dbSession });
    });
  });
}

// Lead_Distribution_Algorithm (pluggable - currently Round-Robin)
const leadDistributionAlgorithm = {
  async getNextStaff(clinicId) {
    const eligibleStaff = await Staff.find({
      clinicId,
      status: 'ACTIVE',
      roleIds: { $in: await getRolesWithLeadAccess(clinicId) }
    });

    if (eligibleStaff.length === 0) {
      // Fallback: assign to Clinic_Admin
      const clinicAdmin = await Staff.findOne({
        clinicId,
        status: 'ACTIVE',
        roleIds: { $in: await getClinicAdminRoleIds(clinicId) }
      });
      return clinicAdmin._id;
    }

    // Round-Robin: find next in rotation
    const state = await LeadDistributionState.findOneAndUpdate(
      { clinicId },
      { $set: { updatedAt: new Date() } },
      { upsert: true, new: true }
    );

    const lastIndex = eligibleStaff.findIndex(s => s._id === state.lastAssignedStaffId);
    const nextIndex = (lastIndex + 1) % eligibleStaff.length;
    const nextStaff = eligibleStaff[nextIndex];

    await LeadDistributionState.findOneAndUpdate(
      { clinicId },
      { lastAssignedStaffId: nextStaff._id }
    );

    return nextStaff._id;
  }
};
```

### 3.2 Lead Conversion Flow

```javascript
async function convertLeadToPatient(leadId, ctx) {
  const lead = await Lead.findById(leadId);

  // Check for duplicate patient in same clinic
  const existingPatient = await Patient.findOne({
    clinicId: lead.clinicId,
    $or: [{ email: lead.email }, { phone: lead.phone }]
  });
  if (existingPatient) throw new Error('CONVERSION_DUPLICATE_EMAIL');

  const globalPatientId = await assignGlobalPatientId(lead.email, lead.phone);

  await mongoose.startSession().then(async (dbSession) => {
    await dbSession.withTransaction(async () => {
      // Create patient from lead data
      const patient = await Patient.create([{
        organizationId: lead.organizationId,
        clinicId: lead.clinicId,
        globalPatientId,
        createdBy: ctx.user.staffId,
        firstName: lead.name.split(' ')[0],
        lastName: lead.name.split(' ').slice(1).join(' '),
        email: lead.email,
        phone: lead.phone,
        age: lead.age,
        genderAssignedAtBirth: lead.gender
      }], { session: dbSession });

      // Update lead status and link to patient
      await Lead.findByIdAndUpdate(leadId, {
        status: 'CONVERTED',
        convertedPatientId: patient[0]._id,
        convertedAt: new Date(),
        convertedBy: ctx.user.staffId
      }, { session: dbSession });

      // Lead_Actions remain on Lead record - accessible via convertedPatientId link
      // No data is copied or moved

      await AuditLog.create([{ action: 'LEAD_CONVERTED', resourceId: leadId, ... }],
        { session: dbSession }
      );
      await OutboxEvent.create([{
        eventType: 'LeadConverted',
        aggregateType: 'LEAD',
        aggregateId: leadId,
        payload: { leadId, patientId: patient[0]._id, clinicId: lead.clinicId }
      }], { session: dbSession });
    });
  });
}
```

---

## 4. GraphQL Schema

### 4.1 Types

```graphql
type Lead {
  id: UUID!
  organizationId: UUID!
  clinicId: UUID           # null = unassigned (Org Admin only)
  assignedTo: UUID         # Staff ID
  name: String!
  email: String
  phone: String
  age: Int
  gender: String
  status: LeadStatus!
  priority: LeadPriority!
  tags: [String!]!
  leadSource: LeadSource!
  sourceDetail: String
  selfieAnalysisReportUrl: URL
  actions(first: Int, after: String): LeadActionConnection!
  convertedPatientId: UUID
  convertedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type LeadConnection {
  edges: [LeadEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type LeadEdge {
  cursor: String!
  node: Lead!
}

type LeadAction {
  id: UUID!
  leadId: UUID!
  actionType: LeadActionType!
  content: String
  statusChangeTo: LeadStatus
  performedBy: UUID!
  createdAt: DateTime!
}

type LeadActionConnection {
  edges: [LeadActionEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type LeadActionEdge {
  cursor: String!
  node: LeadAction!
}

type WebhookSource {
  id: UUID!
  organizationId: UUID!
  name: String!
  endpointPath: String!
  fieldMappings: [FieldMapping!]!
  version: String!
  createdAt: DateTime!
}

type FieldMapping {
  sourceField: String!
  targetField: String!
  required: Boolean!
}
```

### 4.2 Queries

```graphql
type Query {
  leads(
    clinicId: UUID
    status: LeadStatus
    assignedTo: UUID
    search: String
    includeUnassigned: Boolean  # Org Admin only
    first: Int
    after: String
  ): LeadConnection!

  lead(id: UUID!): Lead

  webhookSources: [WebhookSource!]!
}
```

### 4.3 Mutations

```graphql
type Mutation {
  # Lead CRUD
  createLead(input: CreateLeadInput!): Lead!
  updateLead(id: UUID!, input: UpdateLeadInput!): Lead!

  # Status management
  updateLeadStatus(id: UUID!, status: LeadStatus!, confirmed: Boolean): Lead!
  # Admin override - Clinic_Admin and Org_Admin can set any status including reverting CONVERTED
  adminOverrideLeadStatus(id: UUID!, status: LeadStatus!): Lead!

  # Assignment
  assignLeadToClinic(leadId: UUID!, clinicId: UUID!): Lead!  # Org Admin only
  reassignLead(leadId: UUID!, staffId: UUID!): Lead!          # Clinic Admin only, NEW or LOST

  # Actions
  addLeadAction(leadId: UUID!, input: LeadActionInput!): LeadAction!

  # Conversion
  convertLeadToPatient(leadId: UUID!): Patient!

  # Webhook configuration (Org Admin only)
  createWebhookSource(input: WebhookSourceInput!): WebhookSource!
  updateWebhookSource(id: UUID!, input: WebhookSourceInput!): WebhookSource!
  deleteWebhookSource(id: UUID!): Boolean!

  # Lead assignment mode (Org Admin only)
  updateLeadAssignmentMode(mode: LeadAssignmentMode!): Organization!
}
```

---

## 5. Webhook Ingestion Endpoint

```
POST /webhooks/leads/{sourceId}
Headers: X-API-Key: <organization-api-key>
Content-Type: application/json
```

```javascript
async function handleWebhookIngestion(req, res) {
  const { sourceId } = req.params;
  const apiKey = req.headers['x-api-key'];

  // Validate API key against organization
  const webhookSource = await WebhookSource.findById(sourceId);
  if (!webhookSource || !verifyApiKey(apiKey, webhookSource.apiKeyHash)) {
    return res.status(401).json({ code: 'WEBHOOK_INVALID_API_KEY' });
  }

  // Map payload fields
  const payload = req.body;
  const leadData = {};
  for (const mapping of webhookSource.fieldMappings) {
    if (mapping.required && !payload[mapping.sourceField]) {
      return res.status(422).json({ code: 'WEBHOOK_MAPPING_ERROR' });
    }
    if (payload[mapping.sourceField]) {
      leadData[mapping.targetField] = payload[mapping.sourceField];
    }
  }

  // Create lead (never reject due to staff availability)
  const lead = await createLeadFromWebhook(leadData, webhookSource);
  return res.status(201).json({ leadId: lead._id, status: 'CREATED' });
}
```

---

## 6. Access Control

| Operation | Allowed |
|-----------|---------|
| `leads` query | All clinic staff with `leads.view`; Org Admin sees all + unassigned |
| `createLead` | Staff with `leads.create` |
| `updateLead`, `addLeadAction` | Staff with `leads.edit` |
| `updateLeadStatus` | Staff with `leads.edit` (cannot set CONVERTED) |
| `adminOverrideLeadStatus` | Clinic_Admin, Org_Admin only |
| `assignLeadToClinic` | Org_Admin only |
| `reassignLead` | Clinic_Admin only; only NEW or LOST status |
| `convertLeadToPatient` | Staff with `leads.edit` + `patients.create` |
| `createWebhookSource`, `updateWebhookSource`, `deleteWebhookSource` | Org_Admin only |
| `updateLeadAssignmentMode` | Org_Admin only |
