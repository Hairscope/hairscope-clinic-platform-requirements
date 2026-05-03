# Organization Management - Design

> **Version:** 1.0.0 | **Status:** Draft | **Branch:** designs
> **Requirements:** `requirements/core/organization.md`, `requirements/core/identity-access.md`

---

## 1. Overview

The Organization Management module handles the multi-tenant hierarchy (Organization -> Clinics -> Staff), self-registration, clinic profile management, inter-clinic staff transfers, staff availability, dashboards, and report templates.

This design covers:
- MongoDB schemas for Organization, Clinic, Staff (extended), Role, Invite
- GraphQL operations for all ORG requirements
- Self-registration flow
- Inter-clinic transfer flow
- Staff availability storage and access control
- Report template management
- Dashboard data scoping

---

## 2. Data Models

### 2.1 Organization

```javascript
const OrganizationSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdBy: { type: String, required: true, ref: 'Staff' },

  // Lead assignment mode (ORG-level setting)
  leadAssignmentMode: {
    type: String,
    enum: ['AUTO_ASSIGN', 'MANUAL_ASSIGN'],
    default: 'AUTO_ASSIGN'
  },

  // Subscription (managed externally)
  subscriptionPlanId: { type: String, default: null },
  subscriptionStatus: { type: String, default: null },
  cancellationDate: { type: Date, default: null },
  deletionScheduledAt: { type: Date, default: null },

  // API key for web components (Selfie Analysis, Appointment Booking)
  apiKey: { type: String, default: null }, // hashed
  apiKeyCreatedAt: { type: Date, default: null }
}, { timestamps: true });

OrganizationSchema.index({ status: 1 });
```

### 2.2 Clinic

```javascript
const WorkingHoursDaySchema = new Schema({
  open: { type: Boolean, default: false },
  startTime: { type: String, default: '09:00' }, // HH:MM in clinic timezone
  endTime: { type: String, default: '18:00' }
}, { _id: false });

const WorkingHoursSchema = new Schema({
  monday:    WorkingHoursDaySchema,
  tuesday:   WorkingHoursDaySchema,
  wednesday: WorkingHoursDaySchema,
  thursday:  WorkingHoursDaySchema,
  friday:    WorkingHoursDaySchema,
  saturday:  WorkingHoursDaySchema,
  sunday:    WorkingHoursDaySchema
}, { _id: false });

const ClinicSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization', index: true },
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdBy: { type: String, required: true, ref: 'Staff' },
  lastUpdatedBy: { type: String, ref: 'Staff' },

  // Contact & Address
  website: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: {
    line1: { type: String, default: '' },
    line2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' }
  },

  // Branding
  logoUrl: { type: String, default: '' },
  reportHeader: { type: String, default: '' }, // clinic-level customization within org template

  // Scheduling
  timezone: { type: String, default: '' }, // IANA timezone - required before appointments
  workingHours: WorkingHoursSchema,

  // Clinical
  servicesOffered: [{ type: String }],
  termsAndConditions: { type: String, default: '' },

  // Invoice sequence (atomic increment for sequential invoice numbers)
  invoiceSequence: { type: Number, default: 0 }
}, { timestamps: true });

ClinicSchema.index({ organizationId: 1, status: 1 });
ClinicSchema.index({ organizationId: 1 });
```

### 2.3 Staff (Organization fields)

```javascript
// Staff schema is defined in core.md
// Organization-specific fields added here for reference:
const StaffOrgFields = {
  organizationId: { type: String, required: true, ref: 'Organization' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  roleIds: [{ type: String, ref: 'Role' }],
  invitedBy: { type: String, ref: 'Staff' },

  // Staff availability (for Smart Scheduling - never exposed to patients)
  availability: {
    monday:    { available: Boolean, startTime: String, endTime: String },
    tuesday:   { available: Boolean, startTime: String, endTime: String },
    wednesday: { available: Boolean, startTime: String, endTime: String },
    thursday:  { available: Boolean, startTime: String, endTime: String },
    friday:    { available: Boolean, startTime: String, endTime: String },
    saturday:  { available: Boolean, startTime: String, endTime: String },
    sunday:    { available: Boolean, startTime: String, endTime: String }
  }
  // availability transfers with staff on inter-clinic move
  // staff can edit it at the new clinic
};
```

### 2.4 Role

```javascript
const PermissionSchema = new Schema({
  module: {
    type: String,
    enum: ['patients', 'leads', 'appointments', 'products',
           'billing', 'organization', 'audit_log', 'dashboard'],
    required: true
  },
  actions: [{ type: String, enum: ['view', 'create', 'edit', 'delete'] }]
}, { _id: false });

const RoleSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic', index: true },
  organizationId: { type: String, required: true, ref: 'Organization' },
  name: { type: String, required: true, trim: true },
  isSystem: { type: Boolean, default: false },   // true: Organization_Admin, Clinic_Admin
  isEditable: { type: Boolean, default: true },  // false: Organization_Admin only
  isDeletable: { type: Boolean, default: true }, // false: Organization_Admin, Clinic_Admin
  permissions: [PermissionSchema],
  createdBy: { type: String, ref: 'Staff' }
}, { timestamps: true });

RoleSchema.index({ clinicId: 1 });
RoleSchema.index({ organizationId: 1, isSystem: 1 });
```

### 2.5 Report Template

```javascript
const ReportSectionSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  enabled: { type: Boolean, default: true },
  order: { type: Number, required: true }
}, { _id: false });

const ReportTemplateSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  type: {
    type: String,
    enum: ['SELFIE_ANALYSIS_REPORT', 'HAIR_ANALYSIS_REPORT'],
    required: true
  },
  isDefault: { type: Boolean, default: false },
  sections: [ReportSectionSchema],
  layout: { type: Schema.Types.Mixed, default: {} },
  createdBy: { type: String, ref: 'Staff' },
  updatedBy: { type: String, ref: 'Staff' }
}, { timestamps: true });

// One active template per type per organization
ReportTemplateSchema.index({ organizationId: 1, type: 1 }, { unique: true });
```

---

## 3. Default Roles Seeding

When a new Organization + Clinic is created (self-registration), the platform seeds default roles:

```javascript
const DEFAULT_ROLES = [
  {
    name: 'Organization_Admin',
    isSystem: true,
    isEditable: false,
    isDeletable: false,
    permissions: [
      { module: 'organization', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'audit_log', actions: ['view'] },
      { module: 'dashboard', actions: ['view'] }
      // NO clinical modules
    ]
  },
  {
    name: 'Clinic_Admin',
    isSystem: true,
    isEditable: true,
    isDeletable: false,
    permissions: [
      { module: 'patients', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'leads', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'appointments', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'products', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'billing', actions: ['view', 'create', 'edit', 'delete'] },
      { module: 'organization', actions: ['view', 'edit'] },
      { module: 'audit_log', actions: ['view'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  },
  { name: 'Doctor', isSystem: false, isEditable: true, isDeletable: true,
    permissions: [
      { module: 'patients', actions: ['view', 'create', 'edit'] },
      { module: 'appointments', actions: ['view', 'create', 'edit'] },
      { module: 'products', actions: ['view'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  },
  { name: 'Receptionist', isSystem: false, isEditable: true, isDeletable: true,
    permissions: [
      { module: 'patients', actions: ['view', 'create'] },
      { module: 'leads', actions: ['view', 'create', 'edit'] },
      { module: 'appointments', actions: ['view', 'create', 'edit'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  },
  { name: 'Nurse', isSystem: false, isEditable: true, isDeletable: true,
    permissions: [
      { module: 'patients', actions: ['view', 'edit'] },
      { module: 'appointments', actions: ['view'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  },
  { name: 'Sales', isSystem: false, isEditable: true, isDeletable: true,
    permissions: [
      { module: 'leads', actions: ['view', 'create', 'edit'] },
      { module: 'appointments', actions: ['view', 'create'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  },
  { name: 'Marketing', isSystem: false, isEditable: true, isDeletable: true,
    permissions: [
      { module: 'leads', actions: ['view'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  },
  { name: 'Frontdesk', isSystem: false, isEditable: true, isDeletable: true,
    permissions: [
      { module: 'patients', actions: ['view'] },
      { module: 'leads', actions: ['view', 'create'] },
      { module: 'appointments', actions: ['view', 'create', 'edit'] },
      { module: 'dashboard', actions: ['view'] }
    ]
  }
];
```

---

## 4. Key Flows

### 4.1 Self-Registration Flow

```
Client: mutation register(orgName, clinicName, clinicAddress, email, password)
  |
  Server:
  1. Validate inputs (all 3 required fields present)
  2. Check email not already registered (Staff collection)
  3. Start MongoDB session (atomic transaction):
     a. Create Organization { name: orgName, createdBy: TBD }
     b. Create Clinic { organizationId, name: clinicName, address: clinicAddress }
     c. Seed default Roles for this clinic (8 roles)
     d. Create Staff {
          organizationId, clinicId,
          email, passwordHash: bcrypt(password),
          status: ACTIVE,
          roleIds: [orgAdminRoleId, clinicAdminRoleId]
        }
     e. Update Organization.createdBy = staff._id
     f. Seed default ReportTemplates (SELFIE_ANALYSIS_REPORT, HAIR_ANALYSIS_REPORT)
  4. Commit transaction
  5. Write audit log: ORGANIZATION_CREATED, CLINIC_CREATED, STAFF_CREATED
  6. Issue JWT + refresh token
  7. Return { accessToken, staff, organization, clinic }
```

### 4.2 Inter-Clinic Transfer Flow

```
Client: mutation transferStaff(staffId, destinationClinicId, reassignments[])
  |
  Server (Organization_Admin only):
  1. Validate actor is Organization_Admin
  2. Validate source and destination clinics are in same Organization
  3. Check staff is not last active Clinic_Admin in source clinic
     -> If yes: throw LAST_CLINIC_ADMIN
  4. If reassignments provided: validate all recipients are Active + same source clinic
  5. Start MongoDB session (atomic transaction):
     a. If reassignments: update assignedTo fields on Sessions, Leads, Appointments
     b. Update Staff.clinicId = destinationClinicId
     c. Staff.availability is KEPT (transfers with staff member)
     d. Staff.roleIds: keep existing roles if same roles exist in destination clinic
        otherwise assign Clinic_Admin role at destination
  6. Commit transaction
  7. Invalidate staff JWT (force re-login at new clinic)
  8. Send email notification to staff member
  9. Write audit log: STAFF_TRANSFERRED
```

### 4.3 Clinic Deactivation Flow

```
Client: mutation deactivateClinic(clinicId)
  |
  Server (Organization_Admin only):
  1. Validate actor is Organization_Admin
  2. Check this is not the last active Clinic in the Organization
     -> If yes: throw LAST_ACTIVE_CLINIC
  3. Start MongoDB session:
     a. Update Clinic.status = INACTIVE
     b. Find all ACTIVE Staff in this clinic
     c. Invalidate all their JWTs (clear refreshTokenHash, activeSessionIds)
     d. Do NOT change Staff.status (staff remain Active, just can't auth)
  4. Commit transaction
  5. Write audit log: CLINIC_DEACTIVATED
  6. Return updated Clinic
```

---

## 5. GraphQL Schema

### 5.1 Types

```graphql
type Organization {
  id: UUID!
  name: String!
  status: String!
  leadAssignmentMode: String!
  clinics: [Clinic!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Clinic {
  id: UUID!
  organizationId: UUID!
  name: String!
  status: String!
  website: String
  email: String
  phone: String
  address: Address
  logoUrl: String
  reportHeader: String
  timezone: String
  workingHours: WorkingHours
  servicesOffered: [String!]!
  termsAndConditions: String
  staffCount: Int
  createdAt: DateTime!
  updatedAt: DateTime!
}

type WorkingHours {
  monday: DaySchedule!
  tuesday: DaySchedule!
  wednesday: DaySchedule!
  thursday: DaySchedule!
  friday: DaySchedule!
  saturday: DaySchedule!
  sunday: DaySchedule!
}

type DaySchedule {
  open: Boolean!
  startTime: String
  endTime: String
}

type Role {
  id: UUID!
  clinicId: UUID!
  name: String!
  isSystem: Boolean!
  isEditable: Boolean!
  isDeletable: Boolean!
  permissions: [Permission!]!
  staffCount: Int
}

type Permission {
  module: String!
  actions: [String!]!
}

type ReportTemplate {
  id: UUID!
  organizationId: UUID!
  type: String!
  isDefault: Boolean!
  sections: [ReportSection!]!
  updatedAt: DateTime!
}

type ReportSection {
  id: String!
  label: String!
  enabled: Boolean!
  order: Int!
}

type StaffAvailability {
  monday: DayAvailability
  tuesday: DayAvailability
  wednesday: DayAvailability
  thursday: DayAvailability
  friday: DayAvailability
  saturday: DayAvailability
  sunday: DayAvailability
}

type DayAvailability {
  available: Boolean!
  startTime: String
  endTime: String
}

type TransferPreview {
  staffId: UUID!
  staffName: String!
  sourceClinic: Clinic!
  destinationClinic: Clinic!
  reassignableRecords: [ReassignableRecordGroup!]!
}

type ReassignableRecordGroup {
  recordType: String!
  count: Int!
}
```

### 5.2 Queries

```graphql
type Query {
  # Organization
  myOrganization: Organization!
  organizationClinics(status: String): [Clinic!]!
  clinic(id: UUID!): Clinic!

  # Staff
  staffList(
    clinicId: UUID
    status: String
    roleId: UUID
    first: Int
    after: String
  ): StaffConnection!
  staffMember(id: UUID!): Staff!
  staffTransferPreview(staffId: UUID!, destinationClinicId: UUID!): TransferPreview!

  # Roles
  clinicRoles(clinicId: UUID!): [Role!]!
  role(id: UUID!): Role!

  # Report Templates
  reportTemplates: [ReportTemplate!]!
  reportTemplate(type: String!): ReportTemplate!

  # Dashboard
  dashboardStats(clinicId: UUID): DashboardStats!
}
```

### 5.3 Mutations

```graphql
type Mutation {
  # Self-registration
  register(input: RegisterInput!): AuthPayload!

  # Organization
  updateOrganization(input: UpdateOrganizationInput!): Organization!
  updateLeadAssignmentMode(mode: String!): Organization!
  generateApiKey: ApiKeyPayload!
  revokeApiKey: Boolean!

  # Clinic
  createClinic(input: CreateClinicInput!): Clinic!
  updateClinic(id: UUID!, input: UpdateClinicInput!): Clinic!
  deactivateClinic(id: UUID!): Clinic!
  reactivateClinic(id: UUID!): Clinic!

  # Staff
  sendInvite(input: SendInviteInput!): Invite!
  acceptInvite(token: String!, password: String!): AuthPayload!
  resendInvite(staffId: UUID!): Invite!
  cancelInvite(staffId: UUID!): Boolean!
  updateStaff(id: UUID!, input: UpdateStaffInput!): Staff!
  deactivateStaff(id: UUID!): Staff!
  reactivateStaff(id: UUID!): Staff!
  deleteStaff(id: UUID!, reassignments: [ReassignmentInput!]!): Boolean!
  transferStaff(
    staffId: UUID!
    destinationClinicId: UUID!
    reassignments: [ReassignmentInput!]
  ): Staff!

  # Roles
  createRole(clinicId: UUID!, input: RoleInput!): Role!
  updateRole(id: UUID!, input: RoleInput!): Role!
  deleteRole(id: UUID!): Boolean!
  assignRoles(staffId: UUID!, roleIds: [UUID!]!): Staff!

  # Staff Availability
  updateMyAvailability(availability: AvailabilityInput!): Staff!
  updateStaffAvailability(staffId: UUID!, availability: AvailabilityInput!): Staff!

  # Report Templates
  updateReportTemplate(type: String!, input: ReportTemplateInput!): ReportTemplate!
}
```

### 5.4 Input Types

```graphql
input RegisterInput {
  organizationName: String!
  clinicName: String!
  clinicAddress: AddressInput!
  email: String!
  password: String!
}

input CreateClinicInput {
  name: String!
  address: AddressInput!
  timezone: String
}

input UpdateClinicInput {
  name: String
  website: String
  address: AddressInput
  email: String
  phone: String
  timezone: String
  workingHours: WorkingHoursInput
  termsAndConditions: String
  reportHeader: String
  servicesOffered: [String!]
}

input WorkingHoursInput {
  monday: DayScheduleInput
  tuesday: DayScheduleInput
  wednesday: DayScheduleInput
  thursday: DayScheduleInput
  friday: DayScheduleInput
  saturday: DayScheduleInput
  sunday: DayScheduleInput
}

input DayScheduleInput {
  open: Boolean!
  startTime: String
  endTime: String
}

input SendInviteInput {
  email: String!
  roleIds: [UUID!]!
  clinicId: UUID  # required if actor is Organization_Admin
}

input RoleInput {
  name: String!
  permissions: [PermissionInput!]!
}

input PermissionInput {
  module: String!
  actions: [String!]!
}

input ReassignmentInput {
  recordType: String!  # SESSION | LEAD | APPOINTMENT
  recipientStaffId: UUID!
}

input AvailabilityInput {
  monday: DayAvailabilityInput
  tuesday: DayAvailabilityInput
  wednesday: DayAvailabilityInput
  thursday: DayAvailabilityInput
  friday: DayAvailabilityInput
  saturday: DayAvailabilityInput
  sunday: DayAvailabilityInput
}

input DayAvailabilityInput {
  available: Boolean!
  startTime: String
  endTime: String
}

input ReportTemplateInput {
  sections: [ReportSectionInput!]!
  layout: JSON
}

input ReportSectionInput {
  id: String!
  label: String!
  enabled: Boolean!
  order: Int!
}
```

---

## 6. Dashboard Data Scoping

The dashboard query respects the caller's scope:

```javascript
async function dashboardStats(_, { clinicId }, ctx) {
  const { user } = ctx;

  // Organization_Admin: can query any clinic or all clinics
  if (user.scope === 'org') {
    if (clinicId) {
      // Validate clinic belongs to org
      return getClinicStats(clinicId);
    }
    // Aggregate across all clinics in org
    return getOrgStats(user.organizationId);
  }

  // Clinic-level staff: always scoped to their own clinic
  // clinicId param is ignored even if provided
  return getClinicStats(user.clinicId);
}
```

---

## 7. Access Control Rules

| Operation | Allowed Roles | Notes |
|-----------|--------------|-------|
| `register` | Public | Creates org + clinic + staff atomically |
| `createClinic` | Organization_Admin | Only within own org |
| `updateClinic` | Organization_Admin, Clinic_Admin | Clinic_Admin: own clinic only |
| `deactivateClinic` | Organization_Admin | Cannot deactivate last active clinic |
| `sendInvite` | Organization_Admin, Clinic_Admin | Org_Admin must specify clinicId |
| `transferStaff` | Organization_Admin | Same org only |
| `deleteStaff` | Organization_Admin, Clinic_Admin | Requires reassignment |
| `createRole` | Clinic_Admin | Own clinic only |
| `updateRole` | Clinic_Admin | Cannot edit Organization_Admin role |
| `deleteRole` | Clinic_Admin | Cannot delete system roles |
| `updateReportTemplate` | Organization_Admin | Org-level, applies to all clinics |
| `updateStaffAvailability` | Clinic_Admin, Staff (own) | Staff can update own availability |
| `dashboardStats` | All authenticated | Scoped by role automatically |

---

## 8. Invariant Enforcement

| Invariant | Enforcement Point |
|-----------|-----------------|
| GI-4: Min 1 active Org Admin | `deactivateStaff`, `deleteStaff` resolvers |
| GI-5: Min 1 active Clinic Admin | `deactivateStaff`, `deleteStaff`, `transferStaff` resolvers |
| GI-8: Org Admin cannot access clinical modules | Permission engine middleware (hard-coded, not permission-based) |
| ORG-1: Min 1 active Clinic per Org | `deactivateClinic` resolver |
| ORG-4: Transfer within same org only | `transferStaff` resolver validates `organizationId` match |
| ORG-8: Report template per type per org | MongoDB unique index on `{organizationId, type}` |
