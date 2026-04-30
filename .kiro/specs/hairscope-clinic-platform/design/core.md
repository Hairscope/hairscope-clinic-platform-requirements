# Hairscope Clinic Platform - Core Layer Design

> **Version:** 1.0.0
> **Status:** Draft
> **Branch:** designs
> **Modules Covered:** Identity & Access (IAM), Organization Management (ORG), Audit & Compliance (AUD), Data Ownership (OWN)

---

## 1. Overview

This document covers the core layer of the Hairscope Clinic Platform. The core layer provides foundational services shared across all clinical modules.

### Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| JWT payload | Role IDs only (not permissions) | Smaller token, permissions resolved fresh via `/me` query on app load |
| Token storage (web) | Access token in-memory, refresh token in httpOnly cookie | CSRF-safe, XSS-safe |
| Staff availability on transfer | Transferred with staff member | One staff = one clinic at a time; availability follows the person |
| Permission caching | 30s TTL cache + event-driven invalidation | Fast reads across horizontal instances, max 30s stale window |
| Database | MongoDB + Mongoose | Flexible schema for evolving clinical data |
| API | GraphQL (Apollo Server + Bun) | Single endpoint for web, mobile, and future patient app |
| Architecture | Event-driven modules | No direct module dependencies; cross-module via event bus |

---

## 2. High-Level Architecture

```
Clients (Web / iOS / Android / Hairscope Care)
              |
              | GraphQL over HTTPS
              v
+------------------------------------------+
|         Apollo Server (Bun runtime)       |
|                                           |
|  Auth Middleware -> Permission Engine     |
|                                           |
|  +--------+  +--------+  +----------+    |
|  |  IAM   |  |  ORG   |  |  AUD     |    |
|  | Module |  | Module |  | Module   |    |
|  +--------+  +--------+  +----------+    |
|       |           |            |         |
|       +-----+-----+------------+         |
|             |                            |
|        Event Bus                         |
|             |                            |
|  +----------+----------+                 |
|  | Clinical Modules     |                |
|  | (Patients, Sessions, |                |
|  |  Leads, Appts, etc.) |                |
|  +---------------------+                 |
+------------------------------------------+
              |
              v
         MongoDB Atlas
```

---

## 3. Data Models

### 3.1 Organization

```javascript
const OrganizationSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  name: { type: String, required: true, trim: true },
  createdBy: { type: String, required: true, ref: 'Staff' }, // staffId of self-registering user
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  leadAssignmentMode: {
    type: String,
    enum: ['AUTO_ASSIGN', 'MANUAL_ASSIGN'],
    default: 'AUTO_ASSIGN'
  },
  subscriptionPlanId: { type: String, default: null }, // managed externally
  subscriptionStatus: { type: String, default: null },
  dataRetentionPolicy: {
    cancellationDate: { type: Date, default: null },
    deletionScheduledAt: { type: Date, default: null }
  }
}, { timestamps: true });

// Indexes
OrganizationSchema.index({ status: 1 });
```

### 3.2 Clinic

```javascript
const WorkingHoursSchema = new Schema({
  monday:    { open: Boolean, startTime: String, endTime: String },
  tuesday:   { open: Boolean, startTime: String, endTime: String },
  wednesday: { open: Boolean, startTime: String, endTime: String },
  thursday:  { open: Boolean, startTime: String, endTime: String },
  friday:    { open: Boolean, startTime: String, endTime: String },
  saturday:  { open: Boolean, startTime: String, endTime: String },
  sunday:    { open: Boolean, startTime: String, endTime: String }
}, { _id: false });

const ClinicSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  name: { type: String, required: true, trim: true },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  createdBy: { type: String, required: true, ref: 'Staff' },

  // Profile fields
  website: { type: String, default: '' },
  address: {
    line1: String, line2: String, city: String,
    state: String, country: String, postalCode: String
  },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  logoUrl: { type: String, default: '' },
  reportHeader: { type: String, default: '' },
  timezone: { type: String, default: '' }, // IANA timezone
  workingHours: WorkingHoursSchema,
  servicesOffered: [{ type: String }],
  termsAndConditions: { type: String, default: '' },

  // Invoice sequence counter
  invoiceSequence: { type: Number, default: 0 }
}, { timestamps: true });

// Indexes
ClinicSchema.index({ organizationId: 1, status: 1 });
ClinicSchema.index({ organizationId: 1 });
```

### 3.3 Staff

```javascript
const StaffAvailabilitySchema = new Schema({
  monday:    { available: Boolean, startTime: String, endTime: String },
  tuesday:   { available: Boolean, startTime: String, endTime: String },
  wednesday: { available: Boolean, startTime: String, endTime: String },
  thursday:  { available: Boolean, startTime: String, endTime: String },
  friday:    { available: Boolean, startTime: String, endTime: String },
  saturday:  { available: Boolean, startTime: String, endTime: String },
  sunday:    { available: Boolean, startTime: String, endTime: String }
}, { _id: false });

const StaffSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  clinicId: { type: String, required: true, ref: 'Clinic' },

  // Auth
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: null }, // null until invite accepted
  status: {
    type: String,
    enum: ['PENDING_REGISTRATION', 'ACTIVE', 'INACTIVE'],
    default: 'PENDING_REGISTRATION'
  },

  // Profile
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '' },
  specialization: { type: String, default: '' },
  experience: { type: String, default: '' },
  photoUrl: { type: String, default: '' },

  // Roles (array of role IDs assigned to this staff member)
  roleIds: [{ type: String, ref: 'Role' }],

  // Attribution
  invitedBy: { type: String, ref: 'Staff' }, // staffId who sent the invite

  // Availability (for Smart Scheduling - never exposed to patients)
  availability: StaffAvailabilitySchema,

  // Token management
  refreshTokenHash: { type: String, default: null },
  activeSessionIds: [{ type: String }] // for multi-device invalidation
}, { timestamps: true });

// Indexes
StaffSchema.index({ organizationId: 1, clinicId: 1, status: 1 });
StaffSchema.index({ email: 1, clinicId: 1 }, { unique: true });
StaffSchema.index({ organizationId: 1, status: 1 });
```

### 3.4 Invite

```javascript
const InviteSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  staffId: { type: String, required: true, ref: 'Staff' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  email: { type: String, required: true, lowercase: true },
  token: { type: String, required: true, unique: true }, // hashed token
  status: {
    type: String,
    enum: ['PENDING', 'USED', 'EXPIRED', 'REVOKED', 'CANCELLED'],
    default: 'PENDING'
  },
  roleIds: [{ type: String }], // roles assigned at invite time
  invitedBy: { type: String, required: true, ref: 'Staff' },
  expiresAt: { type: Date, required: true }, // createdAt + 7 days
  usedAt: { type: Date, default: null }
}, { timestamps: true });

// Indexes
InviteSchema.index({ token: 1 });
InviteSchema.index({ staffId: 1 });
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

### 3.5 Role

```javascript
const PermissionSchema = new Schema({
  module: {
    type: String,
    enum: ['patients', 'leads', 'appointments', 'products', 'billing',
           'organization', 'audit_log', 'dashboard'],
    required: true
  },
  actions: [{
    type: String,
    enum: ['view', 'create', 'edit', 'delete']
  }]
}, { _id: false });

const RoleSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  name: { type: String, required: true, trim: true },
  isSystem: { type: Boolean, default: false }, // true for Organization_Admin, Clinic_Admin
  isEditable: { type: Boolean, default: true }, // false for Organization_Admin
  permissions: [PermissionSchema],
  createdBy: { type: String, ref: 'Staff' }
}, { timestamps: true });

// Indexes
RoleSchema.index({ clinicId: 1 });
RoleSchema.index({ organizationId: 1, isSystem: 1 });
```

### 3.6 Audit Log

```javascript
const AuditLogSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  clinicId: { type: String, default: null, ref: 'Clinic' }, // null for org-level actions
  actorId: { type: String, required: true }, // staffId snapshot
  actorName: { type: String, required: true }, // full name snapshot - NEVER updated
  action: { type: String, required: true }, // AuditAction enum
  resourceType: { type: String, required: true }, // AuditResourceType enum
  resourceId: { type: String, required: true },
  before: { type: Schema.Types.Mixed, default: null }, // state before change
  after: { type: Schema.Types.Mixed, default: null },  // state after change
  ipAddress: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  traceId: { type: String, required: true }
}, {
  timestamps: true,
  // Audit log is append-only - no update or delete operations allowed
});

// Indexes
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, actorId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, resourceType: 1, resourceId: 1 });
AuditLogSchema.index({ organizationId: 1, action: 1, createdAt: -1 });
// TTL index for 7-year retention (2555 days)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 220752000 });
```

### 3.7 Report Template

```javascript
const ReportTemplateSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  type: {
    type: String,
    enum: ['SELFIE_ANALYSIS_REPORT', 'HAIR_ANALYSIS_REPORT'],
    required: true
  },
  isDefault: { type: Boolean, default: false },
  layout: { type: Schema.Types.Mixed, default: {} }, // template configuration
  sections: [{ id: String, enabled: Boolean, order: Number }],
  createdBy: { type: String, ref: 'Staff' },
  updatedBy: { type: String, ref: 'Staff' }
}, { timestamps: true });

ReportTemplateSchema.index({ organizationId: 1, type: 1 }, { unique: true });
```

---

## 4. Authentication Flow

### 4.1 Self-Registration

```
Client                    Server
  |                          |
  |-- POST /graphql -------->|
  |   mutation register {    |
  |     orgName, clinicName, |
  |     address, email,      |
  |     password             |
  |   }                      |
  |                          |-- Validate inputs
  |                          |-- Check email not taken
  |                          |-- Create Organization
  |                          |-- Create Clinic
  |                          |-- Create Staff (ACTIVE)
  |                          |-- Assign Org_Admin + Clinic_Admin roles
  |                          |-- Write audit log
  |                          |-- Issue JWT + refresh token
  |<-- { accessToken,        |
  |      staff, org, clinic }|
```

### 4.2 Staff Invite Flow

```
Phase 1 - Admin sends invite:
Admin --> createInvite(email, roleIds) --> Server
  Server: validate email not taken
  Server: create Staff (PENDING_REGISTRATION)
  Server: create Invite (token, expiresAt = now + 7d)
  Server: send invite email with link
  Server: write audit log (INVITE_SENT)

Phase 2 - Invitee accepts:
Invitee --> acceptInvite(token, password) --> Server
  Server: find Invite by token hash
  Server: check status = PENDING and expiresAt > now
  Server: hash password, update Staff (ACTIVE, passwordHash)
  Server: update Invite (USED, usedAt)
  Server: issue JWT + refresh token
  Server: write audit log (INVITE_USED)
```

### 4.3 JWT Structure

```json
{
  "sub": "staff-uuid",
  "staffId": "staff-uuid",
  "organizationId": "org-uuid",
  "clinicId": "clinic-uuid",
  "roleIds": ["role-uuid-1", "role-uuid-2"],
  "scope": "clinic",
  "iat": 1714000000,
  "exp": 1714003600
}
```

- Access token TTL: **1 hour**
- Refresh token TTL: **30 days**
- Access token stored: **in-memory** (JS variable, lost on page refresh)
- Refresh token stored: **httpOnly cookie** (survives page refresh, not accessible to JS)

### 4.4 Token Refresh Flow

```
Client (on app load or 401 response):
  --> POST /graphql { mutation refreshToken }
  --> Server reads refresh token from httpOnly cookie
  --> Server validates refresh token hash in Staff record
  --> Server checks Staff status = ACTIVE
  --> Server issues new access token
  --> Returns new accessToken in response body
```

### 4.5 Multi-Device Invalidation

Each Staff record stores `activeSessionIds[]`. On deactivation:
1. Clear `activeSessionIds` array
2. Clear `refreshTokenHash`
3. All subsequent requests with old tokens fail at the refresh step

---

## 5. Permission Engine

### 5.1 Design

The permission engine runs as GraphQL middleware before every resolver.

```
Request arrives with JWT
        |
        v
Extract staffId, roleIds from JWT
        |
        v
Check permission cache (30s TTL)
  Hit? --> Use cached permissions
  Miss? --> Load roles from MongoDB
           --> Compute union of all permissions
           --> Cache result (key: staffId, TTL: 30s)
        |
        v
Check: does effectivePermissions include (module, action)?
  No  --> throw FORBIDDEN
  Yes --> proceed to resolver
        |
        v
Check: is resource within organizationId scope?
  No  --> throw FORBIDDEN + write audit log
  Yes --> proceed
        |
        v
Check: Org_Admin accessing clinical module?
  Yes --> throw FORBIDDEN
  No  --> proceed to resolver
```

### 5.2 Cache Invalidation

When a role's permissions are updated:
1. Resolver updates Role document in MongoDB
2. Resolver publishes `RolePermissionsUpdated` event to event bus
3. All server instances subscribe to this event
4. On receiving event: invalidate cache entries for all Staff holding that role

```javascript
// Cache key pattern
const cacheKey = `permissions:${staffId}`;
const TTL = 30; // seconds

// On role update event
async function handleRolePermissionsUpdated({ roleId, clinicId }) {
  const affectedStaff = await Staff.find({ roleIds: roleId, clinicId });
  for (const staff of affectedStaff) {
    cache.del(`permissions:${staff._id}`);
  }
}
```

### 5.3 Org Admin Hard Limit

The Organization_Admin scope is enforced at the middleware level, not via permissions:

```javascript
const ORG_ADMIN_BLOCKED_MODULES = [
  'patients', 'sessions', 'leads', 'appointments', 'products', 'billing'
];

if (staff.scope === 'org' && ORG_ADMIN_BLOCKED_MODULES.includes(requestedModule)) {
  throw new GraphQLError('FORBIDDEN');
}
```

---

## 6. GraphQL Schema (Core)

### 6.1 Types

```graphql
scalar DateTime
scalar UUID
scalar JSON

enum StaffStatus { ACTIVE INACTIVE PENDING_REGISTRATION }
enum InviteStatus { PENDING USED EXPIRED REVOKED CANCELLED }
enum ClinicStatus { ACTIVE INACTIVE }

type Organization {
  id: UUID!
  name: String!
  status: ClinicStatus!
  leadAssignmentMode: String!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Clinic {
  id: UUID!
  organizationId: UUID!
  name: String!
  status: ClinicStatus!
  email: String
  phone: String
  website: String
  address: Address
  logoUrl: String
  reportHeader: String
  timezone: String
  workingHours: WorkingHours
  termsAndConditions: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Address {
  line1: String
  line2: String
  city: String
  state: String
  country: String
  postalCode: String
}

type WorkingHours {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

type DaySchedule {
  open: Boolean!
  startTime: String
  endTime: String
}

type Staff {
  id: UUID!
  organizationId: UUID!
  clinicId: UUID!
  email: String!
  status: StaffStatus!
  firstName: String
  lastName: String
  phone: String
  specialization: String
  experience: String
  photoUrl: String
  roles: [Role!]!
  createdAt: DateTime!
  updatedAt: DateTime!
  # availability is NOT exposed here - internal only
}

type Role {
  id: UUID!
  clinicId: UUID!
  name: String!
  isSystem: Boolean!
  isEditable: Boolean!
  permissions: [Permission!]!
}

type Permission {
  module: String!
  actions: [String!]!
}

type Invite {
  id: UUID!
  email: String!
  status: InviteStatus!
  roleIds: [UUID!]!
  expiresAt: DateTime!
  createdAt: DateTime!
}

type AuthPayload {
  accessToken: String!
  staff: Staff!
}

type AuditLogEntry {
  id: UUID!
  organizationId: UUID!
  clinicId: UUID
  actorId: UUID!
  actorName: String!
  action: String!
  resourceType: String!
  resourceId: UUID!
  before: JSON
  after: JSON
  ipAddress: String
  traceId: String!
  createdAt: DateTime!
}

type AuditLogConnection {
  edges: [AuditLogEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type AuditLogEdge {
  node: AuditLogEntry!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 6.2 Queries

```graphql
type Query {
  # Auth
  me: Staff!

  # Organization
  organization: Organization!
  clinics(status: ClinicStatus): [Clinic!]!
  clinic(id: UUID!): Clinic!

  # Staff
  staffList(clinicId: UUID, status: StaffStatus, first: Int, after: String): StaffConnection!
  staffMember(id: UUID!): Staff!

  # Roles
  roles(clinicId: UUID!): [Role!]!
  role(id: UUID!): Role!

  # Audit Log
  auditLog(
    dateFrom: DateTime
    dateTo: DateTime
    actorId: UUID
    action: String
    resourceType: String
    resourceId: UUID
    first: Int
    after: String
  ): AuditLogConnection!
}
```

### 6.3 Mutations

```graphql
type Mutation {
  # Auth
  register(input: RegisterInput!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
  refreshToken: AuthPayload!
  logout: Boolean!

  # Invite
  sendInvite(input: SendInviteInput!): Invite!
  acceptInvite(token: String!, password: String!): AuthPayload!
  resendInvite(staffId: UUID!): Invite!
  cancelInvite(staffId: UUID!): Boolean!

  # Organization
  updateOrganization(input: UpdateOrganizationInput!): Organization!
  createClinic(input: CreateClinicInput!): Clinic!
  updateClinic(id: UUID!, input: UpdateClinicInput!): Clinic!
  deactivateClinic(id: UUID!): Clinic!
  reactivateClinic(id: UUID!): Clinic!

  # Staff
  updateStaff(id: UUID!, input: UpdateStaffInput!): Staff!
  deactivateStaff(id: UUID!): Staff!
  reactivateStaff(id: UUID!): Staff!
  deleteStaff(id: UUID!, reassignments: [ReassignmentInput!]!): Boolean!
  transferStaff(staffId: UUID!, destinationClinicId: UUID!, reassignments: [ReassignmentInput!]): Staff!

  # Roles
  createRole(input: CreateRoleInput!): Role!
  updateRole(id: UUID!, input: UpdateRoleInput!): Role!
  deleteRole(id: UUID!): Boolean!
  assignRoles(staffId: UUID!, roleIds: [UUID!]!): Staff!

  # Staff Availability
  updateStaffAvailability(staffId: UUID!, availability: AvailabilityInput!): Staff!

  # Report Templates
  updateReportTemplate(type: String!, input: ReportTemplateInput!): ReportTemplate!
}
```

### 6.4 Input Types

```graphql
input RegisterInput {
  organizationName: String!
  clinicName: String!
  clinicAddress: AddressInput!
  email: String!
  password: String!
}

input SendInviteInput {
  email: String!
  roleIds: [UUID!]!
  clinicId: UUID
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
}

input ReassignmentInput {
  recordType: String!
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
```

---

## 7. Audit Log Write Strategy

Every state-changing resolver calls the audit service after a successful write:

```javascript
// Audit middleware pattern
async function writeAuditLog(ctx, { action, resourceType, resourceId, before, after }) {
  await AuditLog.create({
    organizationId: ctx.user.organizationId,
    clinicId: ctx.user.clinicId || null,
    actorId: ctx.user.staffId,
    actorName: ctx.user.fullName, // snapshot at write time
    action,
    resourceType,
    resourceId,
    before: before || null,
    after: after || null,
    ipAddress: ctx.req.ip,
    userAgent: ctx.req.headers['user-agent'],
    traceId: ctx.traceId
  });
}
```

The audit log collection has no `update` or `delete` operations exposed. MongoDB-level write concern is set to `majority` for audit log writes to ensure durability.

---

## 8. GDPR & Data Lifecycle

### 8.1 GDPR Erasure

```javascript
async function processGdprErasure(patientId, actorId) {
  const PLACEHOLDER = '[GDPR_ERASED]';

  await Patient.findByIdAndUpdate(patientId, {
    firstName: PLACEHOLDER,
    lastName: PLACEHOLDER,
    email: PLACEHOLDER,
    phone: PLACEHOLDER,
    dateOfBirth: null,
    age: null,
    globalPatientId: PLACEHOLDER // unlink from Care App
  });

  await writeAuditLog({ action: 'PATIENT_GDPR_ERASED', resourceId: patientId });
}
```

### 8.2 Post-Cancellation Retention

A scheduled job runs daily to check for organizations past their retention period:

```
Daily job:
  Find orgs where subscriptionStatus = CANCELLED
    AND cancellationDate + retentionPeriod < today
  For each:
    - Delete/anonymize data per retention table
    - Write audit log
    - Send confirmation email to last known Org Admin email
```

---

## 9. Key Design Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| UUID v4 for all IDs (not MongoDB ObjectId) | Portable across services, safe to expose in URLs, no timestamp leakage |
| Staff record never physically deleted | Required for audit log attribution permanence (GI-27) |
| Invite token stored as hash | Never store raw tokens; hash with bcrypt or SHA-256 |
| Role permissions cached per staff (not per role) | Avoids fan-out lookup; cache key is staffId |
| Availability transferred on inter-clinic move | One staff = one clinic at a time; availability is personal, not clinic-specific |
| Audit log uses TTL index for 7-year retention | MongoDB handles expiry automatically; no application-level job needed |
| Invoice sequence per clinic (not global) | Avoids distributed counter contention; sequential per clinic is sufficient |
| globalPatientId lookup is atomic | Use MongoDB findOneAndUpdate with upsert on a GlobalPatient collection to prevent race conditions |

---

## 10. Correctness Properties - Implementation Mapping

| Invariant | Implementation |
|-----------|---------------|
| GI-4: Min 1 active Org Admin | Guard in deactivateStaff + deleteStaff resolvers; DB query before write |
| GI-5: Min 1 active Clinic Admin | Same guard pattern |
| GI-8: Org Admin cannot access clinical modules | Hard-coded middleware check, not permission-based |
| GI-9: Permission union | `effectivePermissions = union(roles.map(r => r.permissions))` |
| GI-10: Deny by default | Middleware throws FORBIDDEN if no matching permission found |
| GI-20: UTC timestamps | Mongoose `timestamps: true` + serializer enforces UTC ISO 8601 |
| GI-21: Server-generated UUIDs | `default: () => uuidv4()` in all schemas; input IDs rejected |
| GI-25: Audit log append-only | No update/delete mutations exposed; MongoDB collection-level write rules |
| GI-27: Actor name snapshot | `actorName` written at log creation time, never updated |
