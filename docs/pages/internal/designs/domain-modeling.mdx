# Hairscope Platform — Domain Modeling

> Covers: Core business entities, aggregate definitions, aggregate ownership, lifecycle models, cross-module relationships, identity models, and domain invariants.

---

# 1. Purpose

This document defines the domain model of the Hairscope Platform.

It establishes:

- core business entities
- aggregate definitions
- aggregate ownership
- lifecycle models
- cross-module relationships
- identity models
- domain invariants

This document defines **what the platform models**, not how it is implemented.

All module implementations MUST conform to this model.

This document derives from `01-system-architecture.md`.

---

# 2. Domain Modeling Principles

## DM-1 Aggregate Definition

An **aggregate** is a business object that:

- owns a set of related data
- enforces all invariants within its boundary
- is modified as a single unit
- acts as a transaction boundary

Each aggregate has a single entry point called the **aggregate root**.

An aggregate root must:

- Own its data
- Enforce invariants
- Be the only way to modify that data
- Be a transaction boundary

All interactions with data inside an aggregate SHALL occur through its aggregate root.

Internal components of an aggregate SHALL NOT be directly accessed or modified from outside.

---

## DM-2 Aggregates Define Consistency Boundaries

All invariants within an aggregate SHALL be enforced atomically.

Cross-aggregate consistency SHALL be achieved through:

- domain events
- application orchestration

---

## DM-3 Modules Own Aggregates

Each module owns its aggregates.

Only the owning module may:

- create aggregate instances
- modify aggregate state
- enforce aggregate invariants
- emit domain events

Other modules SHALL interact only through:

- events
- contracts

---

## DM-4 Identity is Explicit

Every aggregate SHALL have a unique identifier.

Identity SHALL be immutable.

Cross-module relationships SHALL use identifiers only.

---

## DM-5 No Cross-Aggregate Mutation

Aggregates SHALL NOT directly mutate other aggregates.

All cross-aggregate workflows SHALL be event-driven or orchestrated.

---

## DM-6 Immutable Historical Records

Historical facts SHALL be immutable.

State transitions SHALL preserve historical truth.

---

## DM-7 Tenant-Scoped Modeling

All aggregates SHALL be scoped by:

- `organizationId`
- `clinicId` (when applicable)

No aggregate SHALL exist outside tenant context unless explicitly defined.

---

# 3. Domain Structure

The platform is divided into bounded contexts:

## Core Domain

- IAM
- Organization
- Audit

## Clinical Domain

- Patients
- Sessions
- Leads
- Appointments

## Commercial Domain

- Catalog
- Billing

## Communication Domain

- Communication Policy

---

# 4. IAM Domain

## Aggregates

### Staff (Aggregate Root)

Represents an authenticated user.

Owns:

- identity
- role assignments
- status

---

### Role (Aggregate Root)

Represents permission grouping.

Owns:

- permission definitions
- role scope

---

### AuthSession (Aggregate Root)

Represents authenticated session.

Owns:

- authentication state
- authenticated session lifecycle

---

### Invite (Aggregate Root)

Represents onboarding flow.

Owns:

- invitation lifecycle
- initial role assignment

---

## Invariants

- Staff must belong to an organization
- Staff must have at least one role
- AuthSession must map to a valid Staff
- Role definitions are organization-scoped

---

# 5. Organization Domain

## Aggregates

### Organization (Aggregate Root)

Represents tenant root.

Owns:

- organization identity
- global settings
- subscription

---

### Clinic (Aggregate Root)

Represents operational unit.

Owns:

- clinic configuration
- clinic status

---

### Subscription (Aggregate Root)

Represents entitlement state.

Owns:

- plan
- status
- limits
- validity
- feature access

Subscription defines entitlement constraints enforced by the platform.

---

### APIKey (Aggregate Root)

Represents external access.

Owns:

- key identity
- scope
- status

---

## Invariants

- Every Clinic belongs to an Organization
- Subscription defines feature availability
- API keys are organization-scoped
- Organization defines tenant boundary

---

# 6. Audit Domain

## Aggregates

### AuditLog (Aggregate Root)

Represents immutable system activity records.

Owns:

- action
- actor identity
- target entity
- timestamp
- context metadata

---

## Invariants

- Audit records are append-only
- Audit records are immutable
- Every state mutation MUST produce an audit entry

---

# 7. Patients Domain

## Aggregates

### Patient (Aggregate Root)

Represents a person receiving care within a clinic.

Owns:

- identity profile (clinic-scoped)
- globalPatientId linkage
- contact information
- demographic data

---

## Global Identity (Concept)

Global identity is modeled through `globalPatientId`.

It links multiple Patient aggregates across clinics.

This is NOT a separate aggregate.

It is a linkage mechanism owned by the Patients module.

---

## Invariants

- Patient is unique per clinic
- globalPatientId may link multiple patient records
- identity linking requires verification
- patient must belong to organization and clinic

---

# 8. Sessions Domain

## Aggregates

### Session (Aggregate Root)

Represents a clinical analysis session.

Owns:

- session lifecycle
- associated patient
- session type
- processing state

Lifecycle:

```text
DRAFT → SAVED → COMPLETED
```

---

## Session Components

Session logically owns all associated data including:

- images
- annotations
- questionnaire
- recommendations
- report

These MAY be stored separately for scalability,
but they are not independent aggregates.

Session remains the consistency boundary.

---

## Relationships

- Session MUST reference a Patient
- Session MAY originate from an Appointment
- Session lifecycle is independent after creation

---

## Invariants

- Only one active (DRAFT) session per sessionType per patient per clinic
- SAVED sessions are immutable
- COMPLETED sessions represent finalized output

---

# 9. Leads Domain

## Aggregates

### Lead (Aggregate Root)

Represents a potential customer.

Owns:

- identity (partial or complete)
- source
- status
- assignment

---

## Invariants

- Lead may exist without full identity
- Lead must belong to organization
- Lead assignment is optional
- Lead conversion creates Patient

---

# 10. Appointments Domain

## Aggregates

### Appointment (Aggregate Root)

Represents a scheduled interaction.

Owns:

- patient reference
- clinic reference
- service reference
- assigned staff
- time slot
- status

---

## Invariants

- Appointment must belong to a clinic
- Appointment must reference a valid patient
- Appointment may exist without session
- Appointment lifecycle is independent of session lifecycle

---

# 11. Catalog Domain

## Aggregates

### CatalogItem (Aggregate Root)

Represents a unified catalog entry (SERVICE, MEDICATION, COSMETIC, SUPPLEMENT).

Owns:

- catalog item definition
- item type
- availability
- pricing
- applicability

---

## Invariants

- CatalogItems are clinic-scoped
- CatalogItems may be referenced in sessions and billing

---

# 12. Billing Domain

## Aggregates

### Invoice (Aggregate Root)

Represents a billing document generated by the platform.

Owns:

- billing items
- patient reference
- session reference
- status

---

## Lifecycle

```text
DRAFT → ISSUED → PAID
````

---

## Invariants

- Invoice is generated from SessionCompleted
- Invoice must belong to clinic
- Invoice represents billing intent, not payment state

---

## Clarification

The platform does not process or enforce payment transactions.

Payment collection is handled externally by clinics.

Invoices represent billing records, not financial settlement.

---

# 13. Cross-Domain Relationships

Aggregates SHALL NOT embed other aggregates.

All cross-aggregate relationships SHALL be reference-based using identifiers.

Examples:

- Session → Patient (patientId)
- Appointment → Patient
- Invoice → Session

This ensures module isolation and aligns with event-driven coordination.

---

# 14. Identity Model

Identity exists at two levels:

## Local Identity

Patient within a clinic.

## Global Identity

Patient across clinics via `globalPatientId`.

Identity linking requires verification.

---

# 15. Lifecycle Modeling

Each aggregate defines its lifecycle.

Examples:

### Session

```text
DRAFT → SAVED → COMPLETED
```

### Lead

```text
NEW → ASSIGNED → CONVERTED / LOST
```

### Appointment

```text
SCHEDULED → CONFIRMED → COMPLETED / CANCELLED / NO_SHOW
SCHEDULED → CANCELLED / NO_SHOW
```

### Invoice

```text
DRAFT → ISSUED → PAID
```

Lifecycles SHALL be explicit and enforced by owning modules.

---

# 16. Event Boundaries

State transitions MAY emit domain events.

Examples:

- SessionCompleted
- LeadConverted
- AppointmentScheduled
- InvoiceGenerated

Events enable cross-module workflows.

---

# 17. Domain Guarantees

This domain model guarantees:

- clear aggregate ownership
- strong consistency boundaries
- explicit identity modeling
- immutable historical records
- tenant-safe modeling
- event-driven cross-module workflows
- scalable domain separation

All modules MUST adhere to this domain model.

---