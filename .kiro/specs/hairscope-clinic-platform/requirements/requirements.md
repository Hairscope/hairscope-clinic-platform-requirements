# Hairscope Clinic Platform - Master Requirements

> Version: 1.0.0 | Status: **Final** | API: GraphQL | Last Updated: 2025-04-29

---

## 1. System Principles

These principles are non-negotiable and govern every design and implementation decision across the platform.

1. **Security by default** - All data is private unless explicitly granted. Deny is the default for every permission check.
2. **GDPR & HIPAA first** - Patient data handling must satisfy both regulations in every jurisdiction the platform operates in.
3. **Tenant isolation** - No query, mutation, or subscription may return data outside the authenticated user's Organization boundary.
4. **Event-driven extensibility** - Modules communicate via domain events, not direct calls. No module may import or directly invoke another module's internal logic.
5. **Auditability** - Every state-changing operation on clinical or identity data produces an immutable audit log entry.
6. **Idempotency** - All GraphQL mutations that create or update records must be safe to retry without producing duplicate side effects.
7. **UTC everywhere** - All timestamps are stored and transmitted in UTC. Display conversion to clinic timezone is a presentation concern only.
8. **Explicit over implicit** - Business rules are documented as formal invariants, not left to implementation convention.

---

## 2. Global Invariants

These invariants must hold at all times across the entire system. Any operation that would violate an invariant must be rejected before it is committed.

| ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Invariant |
|:------------|-----------|
| GI-1 | Every record belongs to exactly one Organization. Cross-organization data access is impossible. |
| GI-2 | Every Clinic belongs to exactly one Organization. |
| GI-3 | Every Clinic-level Staff member is assigned to exactly one Clinic at a time. Organization_Admins span all Clinics in their Organization. A Staff member may be transferred between Clinics within the same Organization by an Organization_Admin - only one Clinic assignment is active at any time. |
| GI-4 | Every Organization has at least one active Organization_Admin at all times. |
| GI-5 | Every Clinic has at least one active Clinic_Admin at all times. |
| GI-6 | Every Patient record is scoped to the Clinic where it was created (data isolation is maintained per Clinic). However, the platform assigns a `globalPatientId` (UUID) to each unique physical person at Patient creation time, determined by email or phone lookup across the platform. All Patient records for the same person - across any Clinic or Organization - share the same `globalPatientId`. This enables the **Hairscope Care App** to aggregate the patient's full cross-clinic treatment journey. A Clinic cannot access another Clinic's Patient records via `globalPatientId` - it is a linking key for the Hairscope Care App only, not a cross-clinic data access mechanism for Staff. Per-Clinic uniqueness constraints on email and phone still apply. |
| GI-7 | A Patient may have at most one active Session per Clinic at any point in time. A Session is active only when its status is `Draft`. Only Sessions with status `Completed` contribute to the Treatment Progress Graph and patient progress tracking. `Draft` and `Saved` Sessions are excluded from progress tracking. |
| GI-8 | A Session in Saved or Completed status cannot be deleted. |
| GI-9 | Audit log entries are immutable and are never reassigned, transferred, or deleted. |
| GI-10 | All timestamps stored in the system are in UTC. |
| GI-11 | No module may directly call another module's internal resolver or service. Cross-module communication uses domain events only. |
| GI-12 | All API operations are GraphQL. There are no REST endpoints except for file uploads and webhook ingestion. |
| GI-13 | Subscription plan status is provided by an external system. The platform enforces plan gates but does not manage billing. |

---

## 3. Identity Model

```
Organization
  └── Clinic (1..N per Organization)
        └── Staff (1..N per Clinic)
              └── Role (1..N per Staff)
                    └── Permission (module × action)
```

### 3.1 Scope Levels

| Scope | Who | Access |
|-------|-----|--------|
| `org` | Organization_Admin | Staff management + clinic details + org dashboard across all clinics. No access to clinical modules. |
| `clinic` | Clinic_Admin, Doctor, Receptionist, Nurse, Sales, Marketing, Frontdesk | Full or partial access within their assigned Clinic only. |
| `external` | Web component users (leads/patients) | Appointment booking and selfie analysis via API key-authenticated web components only. |

### 3.2 Default Roles

Default roles are provided by the platform. Some are **system roles** - they cannot be deleted and have fixed or restricted permissions. Custom roles created by a Clinic_Admin are always deletable (subject to the last-admin guard).

| Role | Scope | Permissions Editable | Deletable | Notes |
|------|-------|---------------------|-----------|-------|
| Organization_Admin | `org` | No - fixed | No - system role | Permissions are platform-defined and cannot be changed |
| Clinic_Admin | `clinic` | Yes | No - system role | Cannot be deleted; ensures last-admin guard is always enforceable |
| Doctor | `clinic` | Yes | Yes | Subject to last-admin guard |
| Receptionist | `clinic` | Yes | Yes | Subject to last-admin guard |
| Nurse | `clinic` | Yes | Yes | Subject to last-admin guard |
| Sales | `clinic` | Yes | Yes | Subject to last-admin guard |
| Marketing | `clinic` | Yes | Yes | Subject to last-admin guard |
| Frontdesk | `clinic` | Yes | Yes | Subject to last-admin guard |

### 3.3 Staff Authentication

- Staff authenticate via email + password.
- On successful authentication, the platform issues a signed JWT scoped to the Staff member's `organizationId`, `clinicId`, and effective permissions.
- Web component users authenticate via a clinic-specific API key embedded at configuration time.
- All tokens must be validated on every request. Expired or revoked tokens must be rejected.

---

## 4. Permission Engine Rules

### 4.1 Core Rules

1. **Deny by default** - If no role assigned to a Staff member explicitly grants a permission, the action is denied.
2. **Union of roles** - A Staff member holding multiple roles has the union of all permissions granted by those roles.
3. **Immediate propagation** - When a role's permissions are updated, the change takes effect on the next request by any Staff member holding that role.
4. **Org scope hard limit** - The Organization_Admin role cannot be granted permissions to Patients, Appointments, Leads, Billing, or Products modules under any configuration.
5. **Plan gate** - Even if a role grants a permission, if the Organization's active plan does not include the feature, the action is denied.

### 4.2 Permission Matrix

Permissions are defined as `(module, action)` pairs where action ∈ `{view, create, edit, delete}`.

Modules and their logical grouping:

| Module | Belongs To | Notes |
|--------|-----------|-------|
| `patients` | Clinical | Includes sessions as a sub-resource of patients. Sessions cannot exist without a Patient. |
| `leads` | Clinical | |
| `appointments` | Clinical | |
| `products` | Clinical | |
| `billing` | Clinical | |
| `dashboard` | Shared | Scope varies by role (org-wide vs clinic-only) |
| `organization` | Org Management | Includes staff, clinic_settings, and roles as sub-resources |
| `audit_log` | Org Management | |

> **Note on sub-resources:** Sessions are a sub-resource of Patients - a permission on `patients` implicitly covers session access within that patient's record. Similarly, `staff`, `clinic_settings`, and `roles` are sub-resources of the `organization` module and do not require separate top-level permission entries.

### 4.3 Failure Behaviour

| Condition | Response |
|-----------|----------|
| Missing authentication token | `UNAUTHENTICATED` error |
| Expired token | `UNAUTHENTICATED` error |
| Valid token, insufficient permission | `FORBIDDEN` error |
| Valid token, resource outside tenant scope | `FORBIDDEN` error + audit log entry |
| Plan gate violation | `PLAN_LIMIT_EXCEEDED` error |

---

## 5. Time Handling Rules

1. All timestamps are stored in UTC in the database.
2. All GraphQL responses return timestamps in ISO 8601 UTC format (`2025-04-21T10:30:00Z`).
3. All GraphQL inputs that include a date or time must be in ISO 8601 UTC format.
4. Display conversion to the Clinic's configured timezone is performed client-side only.
5. Appointment slot availability is calculated in the Clinic's configured timezone, then stored as UTC.
6. The Clinic timezone is a required field that must be configured before the Appointments module can be used. Attempting to book or display appointment slots without a configured timezone SHALL return a `CLINIC_TIMEZONE_NOT_SET` error. UTC is not used as a fallback for appointments - timezone must be explicitly set.

---

## 6. ID Strategy

1. All entity IDs are globally unique UUIDs (v4).
2. IDs are generated server-side at record creation time.
3. Client-supplied IDs are not accepted for any entity creation mutation.
4. The `patientExternalId` field (clinic-assigned alphanumeric mapping) is separate from the platform-generated UUID and is optional.
5. Invoice numbers are sequential integers scoped per Clinic (not global UUIDs).

---

## 7. API Contract Standard

All platform API operations use GraphQL unless explicitly noted.

### 7.1 Exceptions to GraphQL

| Operation | Protocol | Reason |
|-----------|----------|--------|
| File uploads (images, PDFs) | HTTP multipart | GraphQL does not natively support binary uploads |
| Webhook lead ingestion | HTTP POST | External campaign systems send standard HTTP webhooks |
| Video/virtual consultation sessions | WebRTC or equivalent | Real-time video requires a dedicated signaling and media protocol |

### 7.2 GraphQL Operation Naming

- Queries: `camelCase` noun (e.g., `patient`, `sessionList`, `invoiceSummary`)
- Mutations: `camelCase` verb+noun (e.g., `createPatient`, `saveSession`, `finalizeInvoice`)
- Subscriptions: `camelCase` event (e.g., `aiAnalysisCompleted`, `appointmentStatusChanged`)

### 7.3 Pagination

All list queries that may return more than 20 records must support cursor-based pagination using `first`, `after`, `last`, `before` arguments following the Relay connection specification.

### 7.4 Error Format

All GraphQL errors follow this extension structure:

```json
{
  "errors": [{
    "message": "Human-readable description",
    "extensions": {
      "code": "ERROR_CODE",
      "field": "fieldName (if validation error)",
      "traceId": "uuid"
    }
  }]
}
```

See `shared/error-codes.md` for the full error code registry.

---

## 8. Audit Requirements

### 8.1 What Gets Logged

Every state-changing operation on the following entities must produce an audit log entry:

- Staff (create, update, deactivate, reactivate, delete, transfer)
- Roles and Permissions (create, update, delete)
- Clinic Profile (update)
- Patient (create, update, GDPR erasure)
- Session (create, save, complete, delete)
- Trichoscopy annotations (edit, save)
- Medical Documents (upload, delete)
- Leads (create, update, convert, delete)
- Appointments (create, reschedule, cancel, status change)
- Products (create, update, delete)
- Invoices (generate, add charge, finalize)
- Reports (generate, regenerate, share)
- Authentication (login, logout, failed login, invite sent, invite used)
- Data transfers (staff deletion data transfer)
- Plan changes (received from external system)

### 8.2 Audit Entry Structure

Each audit log entry must contain:

| Field | Description |
|-------|-------------|
| `id` | UUID |
| `timestamp` | UTC ISO 8601 |
| `organizationId` | Tenant scope |
| `clinicId` | Clinic scope (null for org-level actions) |
| `actorId` | Staff UUID at time of action |
| `actorName` | Staff full name at time of action (snapshot, never updated) |
| `action` | Enum - see `shared/enums.md` |
| `resourceType` | Entity type affected |
| `resourceId` | UUID of affected entity |
| `before` | JSON snapshot of state before change (null for creates) |
| `after` | JSON snapshot of state after change (null for deletes) |
| `ipAddress` | Client IP |
| `userAgent` | Client user agent |
| `traceId` | Request trace ID |

### 8.3 What Cannot Be Modified

- Audit log entries cannot be edited, deleted, or soft-deleted by any user including Organization_Admin.
- Audit log entries are never transferred when a Staff member is deleted.
- Audit log entries must be retained for a minimum of 7 years (HIPAA requirement).
- The audit log is append-only at the storage level.

---

## 9. Error Handling Standard

### 9.1 Validation Errors

- All input validation errors must identify the specific field(s) that failed.
- Multiple validation errors on the same mutation must be returned together, not one at a time.
- Validation errors use the `VALIDATION_ERROR` code with a `field` extension.

### 9.2 Business Rule Violations

- Business rule violations (e.g., deleting last admin, duplicate patient email) return a specific error code from the registry in `shared/error-codes.md`.
- Business rule errors must include a human-readable `message` suitable for display.

### 9.3 System Errors

- Unexpected system errors return `INTERNAL_ERROR` with a `traceId` for debugging.
- Stack traces and internal details must never be exposed in production responses.

### 9.4 Partial Failures

- GraphQL mutations are atomic. If any part of a mutation fails, the entire operation is rolled back.
- Partial success is not permitted for any mutation that modifies multiple records.

### 9.5 Async Operation Failures

- If an async operation (AI analysis, PDF generation, email delivery) fails, the platform must:
  1. Retry up to 3 times with exponential backoff.
  2. After 3 failures, set the operation status to `FAILED` and notify the relevant Staff member.
  3. Allow manual resubmission from the UI.

---

## 10. Data Lifecycle

### 10.1 Retention Policies

| Data Type | Active Subscription Retention | Post-Cancellation Retention | Configurable |
|-----------|------------------------------|----------------------------|--------------|
| Patient records | Indefinite | 7 years after subscription cancellation, then deleted | No |
| Session data (images, AI analysis, reports) | Indefinite | 7 years after subscription cancellation, then anonymized | No |
| Audit logs | Indefinite | 7 years after subscription cancellation (as per HIPAA minimum) | No |
| Medical documents | Indefinite | 7 years after subscription cancellation, then deleted | No |
| Leads | Indefinite | 2 years after subscription cancellation, then deleted | No |
| Appointments | Indefinite | 2 years after subscription cancellation, then deleted | No |
| Invoices | Indefinite | 2 years after subscription cancellation, then deleted | No |
| Staff records | Name preserved in audit logs | Preserved for duration of audit log retention | No |
| All other data (products, services, routines) | Indefinite | 2 years after subscription cancellation, then deleted | No |
| Backups | After 30 days | 30 days rolling retention | Yes |

**Post-cancellation behaviour:**
- WHEN an Organization's subscription is cancelled, THE Platform SHALL begin retention countdown for all data belonging to that Organization.
- WHEN the retention period expires, THE Platform SHALL permanently delete or anonymize all data for that Organization in accordance with GDPR and HIPAA requirements.
- THE Platform SHALL notify the Organization_Admin via email at 90 days, 30 days, and 7 days before data deletion.
- THE Platform SHALL allow an Organization to export all their data at any point during the retention period.
- IF an Organization reactivates their subscription before the retention period expires, THE Platform SHALL cancel the deletion countdown and restore full access to all retained data.

### 10.2 GDPR Erasure

- On a verified GDPR right-to-erasure request, a Clinic_Admin may trigger erasure for a Patient.
- Erasure anonymizes all personal identifiers (name, email, phone, date of birth) and replaces them with a placeholder.
- Erasure does not delete Session clinical data (images, AI analysis, reports) - only personal identifiers.
- Erasure is recorded in the audit log with the actor and timestamp.
- Erasure cannot be undone.

### 10.3 Staff Deletion and Responsibility Reassignment

#### Principle

THE Platform SHALL distinguish between:

- **Attribution** (who created or performed an action) - immutable, never modified
- **Responsibility** (who is currently assigned to a record) - reassignable

THE Platform SHALL NOT modify historical attribution under any circumstance.

#### Reassignment Scope

WHEN a Staff member is deleted, ONLY responsibility-based fields SHALL be reassigned. The specific list of reassignable record types is defined in `core/data-ownership.md`.

#### Deletion Execution Rules

- THE Platform SHALL require completion of reassignment before allowing Staff deletion.
- THE Platform SHALL support multi-recipient reassignment - different record categories may be reassigned to different Staff members.
- THE Platform SHALL validate that all recipients:
  - belong to the same Clinic (or valid target Clinic in case of inter-clinic transfer)
  - are Active
- THE Platform SHALL mark the Staff record as `INACTIVE` and revoke all access tokens immediately.
- THE Platform SHALL NOT physically delete the underlying Staff record - it is retained for audit log attribution.

#### Constraints

- THE Platform SHALL NOT allow deletion of the last active Clinic_Admin in a Clinic.
- THE Platform SHALL NOT allow deletion of the last active Organization_Admin in an Organization.
- THE Platform SHALL block deletion if any reassignable data remains unassigned.

---

## 11. Performance Constraints

| Constraint | Requirement |
|------------|-------------|
| GraphQL query response (p95) | ≤ 500ms for non-AI operations |
| GraphQL mutation response (p95) | ≤ 800ms for non-AI operations |
| AI analysis submission | Async - response within 30 seconds of session save |
| PDF report generation | Async - response within 60 seconds of trigger |
| File upload (≤ 10MB) | ≤ 10 seconds |
| Appointment slot availability query | ≤ 300ms |
| Audit log query (paginated) | ≤ 1 second |
| Concurrent users per clinic | Support ≥ 50 concurrent authenticated users |

---

## 12. Multi-Device and Session Rules

1. A Staff member may be authenticated on multiple devices simultaneously.
2. Each device session has its own JWT with an independent expiry.
3. When a Staff member is deactivated, all active sessions across all devices must be invalidated immediately.
4. When a Staff member's role permissions are updated, the change takes effect on the next API request - active sessions are not forcibly terminated.
5. Web component sessions (external users) are stateless and authenticated per-request via API key.
6. Session tokens must not be stored in localStorage on web clients - use httpOnly cookies or secure in-memory storage.

---

## 13. Versioning Strategy

1. The GraphQL schema is versioned. Breaking changes require a new schema version.
2. Non-breaking additions (new fields, new types) may be added without a version bump.
3. Deprecated fields must be marked with `@deprecated(reason: "...")` and supported for a minimum of 2 release cycles before removal.
4. The current schema version is included in every GraphQL response via a custom HTTP header: `X-Schema-Version`.
5. Web components (Stencil) are versioned independently and must declare the minimum platform schema version they require.
6. Webhook field mappings are versioned per Webhook_Source configuration to allow source-specific schema evolution.

---

## 14. Extensibility Strategy

1. **No direct module dependencies** - Modules must not import or call each other's internal resolvers, services, or repositories.
2. **Event bus** - All cross-module communication uses a domain event bus. See `shared/event-definitions.md` for the full event registry.
3. **Plugin-ready resolvers** - Each module exposes a defined GraphQL schema boundary. New modules can be added by registering new schema types and event handlers without modifying existing modules.
4. **Feature flags** - Plan-gated features are controlled via feature flags evaluated at the permission layer, not hardcoded in module logic.
5. **Webhook extensibility** - External systems can push data into the platform via the webhook ingestion endpoint with configurable field mappings, without requiring platform code changes.

---

## 15. Separation of Business Logic and UX Logic

1. All business rules (validation, invariants, permission checks, calculations) are enforced server-side in GraphQL resolvers and domain services.
2. Client applications (web, mobile, web components) may implement UX-level validation for responsiveness, but server-side validation is always authoritative.
3. Calculated fields (e.g., patient age, invoice total, stress-o-meter score, root cause) are computed server-side and returned in GraphQL responses. Clients must not recompute these.
4. Display formatting (timezone conversion, currency formatting, date display) is a client responsibility.
5. Business rules must not be documented only in frontend code - every rule must have a corresponding server-side requirement in this document.

---

## Module Index

| Module | File |
|--------|------|
| Identity & Access | `core/identity-access.md` |
| Organization Management | `core/organization.md` |
| Audit & Compliance | `core/audit-compliance.md` |
| Data Ownership | `core/data-ownership.md` |
| System Invariants | `core/system-invariants.md` |
| Leads | `modules/leads.md` |
| Appointments | `modules/appointments.md` |
| Patients | `modules/patients.md` |
| Sessions | `modules/sessions.md` |
| Products | `modules/products.md` |
| Billing | `modules/billing.md` |
| Enums | `shared/enums.md` |
| Error Codes | `shared/error-codes.md` |
| API Contracts | `shared/api-contracts.md` |
| Event Definitions | `shared/event-definitions.md` |
