# Hairscope Platform — System Architecture

> Covers: Platform boundaries, architectural layers, module boundaries, module interaction rules, event flow, engine architecture, worker services, storage architecture, tenancy boundaries, and system-wide correctness guarantees.

---

# 1. Purpose

This document defines the high-level system architecture of the Hairscope Platform backend.

It establishes:

- platform boundaries
- architectural layers
- module boundaries
- module interaction rules
- event flow
- engine architecture
- storage architecture
- tenancy boundaries
- system-wide correctness guarantees

This document is the canonical architectural reference for all implementation decisions.

All module designs MUST conform to this architecture.

All implementation specifications MUST derive from this architecture.

---

# 2. Architecture Principles

## AP-1 Modular Monolith

The Hairscope Platform SHALL be implemented as a **single deployable backend application composed of strictly isolated internal modules**.

Characteristics:

- single backend application
- single database cluster
- single GraphQL API surface
- internally isolated modules
- event-driven module coordination
- shared platform infrastructure
- no direct cross-module data ownership

Modules are logical boundaries, not deployment boundaries.

Modules MAY be extracted into independent services in the future without breaking platform contracts.

---

## AP-2 Clear Ownership Boundaries

Each module SHALL own its domain entities, invariants, and lifecycle rules.

Only the owning module may:

- create owned entities
- mutate owned entities
- enforce owned invariants
- publish owned domain events

Other modules SHALL interact only through:

- domain events
- published service contracts
- engine contracts

Direct cross-module mutation is forbidden.

Example:

Allowed:

```text
Sessions publishes SessionCompleted
Billing consumes SessionCompleted
Billing creates Invoice
```

Forbidden:

```text
Billing updates Session.status
Billing mutates Session.reportUrl
```

---

## AP-3 Event-Driven Coordination

Cross-module workflows SHALL be coordinated through domain events.

Events SHALL be:

- immutable
- append-only
- versioned
- durable through Transactional Outbox
- delivered with at-least-once guarantees

Consumers MUST be idempotent.

No module SHALL assume exactly-once delivery.

---

## AP-4 Identity-Only Authentication

JWT SHALL contain identity and request scope only.

JWT payload includes:

- `staffId`
- `organizationId`
- `clinicId`
- `authSessionId`
- `issuedAt`
- `expiresAt`

JWT SHALL NOT contain:

- roles
- permissions
- derived authorization state
- dynamic organization state

Authorization state SHALL NOT be embedded in JWT.

---

## AP-5 Server-Authoritative Access Control

Effective access SHALL be determined and enforced by server authority.

Effective access is derived from:

- assigned roles
- resolved permissions
- system invariants
- subscription entitlements
- account status

Effective access MAY be cached for performance.

Caching is an optimization only and SHALL NOT be treated as the source of truth.

Access-affecting state changes SHALL invalidate previously derived access state.

Clients SHALL never be treated as authority for access decisions.

---

## AP-6 Tenant Isolation

Every tenant-scoped entity SHALL include:

- `organizationId`
- `clinicId` (nullable only for explicit organization-level records)

All reads and writes SHALL be tenant-scoped.

Cross-organization access is forbidden.

No module may bypass tenant isolation.

Tenant isolation is enforced by architecture, not developer convention.

---

## AP-7 Immutable Attribution

Historical attribution SHALL be immutable.

Once the platform records who performed an action, created a record, authored content, or uploaded material, that attribution SHALL never be modified.

Operational responsibility MAY be reassigned over time.

Historical authorship may never change.

---

## AP-8 Async-First Processing

Long-running work SHALL execute asynchronously.

Mutations SHALL enqueue work and return immediately.

Mutations SHALL NOT block on long-running processing.

---

## AP-9 Stateless Engines

Decision engines SHALL be:

- deterministic
- stateless
- replaceable
- side-effect free

Engines SHALL NOT directly write to persistence.

Engines compute decisions.

Application services apply those decisions.

---

# 3. Architectural Layers

The platform is organized into architectural layers.

## 3.1 API Layer

Responsibilities:

- request authentication
- request authorization
- input validation
- request context construction
- trace ID creation
- response shaping

Contains:

- GraphQL resolvers
- HTTP endpoints
- webhook endpoints
- upload endpoints

API layer SHALL NOT contain business logic.

---

## 3.2 Application Layer

Responsibilities:

- execute use cases
- orchestrate workflows
- coordinate transactions
- invoke engines
- append audit logs
- write outbox events
- coordinate cross-aggregate operations

Application layer coordinates work.

It does not define business invariants.

---

## 3.3 Domain Layer

Responsibilities:

- business invariants
- aggregate rules
- state transitions
- lifecycle rules
- domain event creation

This layer is the core source of platform correctness.

---

## 3.4 Infrastructure Layer

Responsibilities:

- repositories
- cache
- storage adapters
- dispatcher workers
- schedulers
- event bus adapters
- notification delivery
- observability
- external integrations

Infrastructure supports the platform.

It SHALL NOT define business rules.

---

# 4. Modules

Platform modules are bounded contexts.

## Core Modules

- IAM
- Organization
- Audit

## Clinical Modules

- Patients
- Sessions
- Leads
- Appointments

## Commercial Modules

- Catalog
- Billing

## Communication Module

- Communication Policy

## Future Modules

- Care
- Pro
- Marketplace
- Messaging

Each module owns:

- entities
- invariants
- events
- workflows

No module owns another module's state.

---

# 5. Engines

Engines are platform decision systems.

They compute decisions or derived outputs.

They do not own domain state.

Platform engines include:

- Access Resolution Engine
- Entitlement Engine
- Lead Distribution Engine
- Smart Scheduling Engine
- Recommendation Engine

Future engines MAY be introduced without changing module boundaries.

---

# 5.1 Worker Services

Worker Services are stateful asynchronous infrastructure services.

They are deployed separately from the modular monolith core.

They own persistent state, produce side effects, and interact with external systems.

They execute policy defined by business modules — they do NOT own business logic.

Platform Worker Services include:

- **Reminder Service** — Understands time. Consumes domain events, queries Communication Policy for rules, creates and manages ReminderSchedules, emits `ReminderDue` when schedules fire.
- **Notification Service** — Delivers messages. Consumes `ReminderDue` and `NotificationRequested`, renders templates, resolves channels, sends via providers (Email, WhatsApp, SMS, Push, In-App), tracks delivery state, handles retries and bounces.
- **AI Models** — Processes images and data for analysis. Consumes `SessionSaved`, runs AI models, emits `AIAnalysisCompleted` or `AIAnalysisFailed`. Stateful (tracks analysis state, retries).
- **Report Generation Service** — Generates PDF documents. Renders Clinical Trichoscopy Reports, Treatment Plans, Prescriptions, Invoices. Stores files, uploads to object storage, tracks generation state, retries failures.

Worker Services:

- own persistent state (schedules, delivery logs, generation state)
- produce side effects (send emails, upload files, call external APIs)
- are NOT deterministic (depend on external systems)
- are independently deployable and scalable
- execute policy defined by business modules
- communicate with the core via domain events

---

# 6. High-Level Platform Architecture

```text
Clients
 ├── Clinic Web App
 ├── Clinic Mobile App
 ├── Hairscope Care App
 ├── Hairscope Pro App
 ├── Selfie Analysis Web Component
 └── Appointment Booking Web Component
            │
            │ HTTPS
            ▼
+------------------------------------------------------+
|                    API Layer                         |
|------------------------------------------------------|
| GraphQL API                                          |
| HTTP Endpoints (uploads, webhooks)                   |
| Authentication                                       |
| Authorization                                        |
| Validation                                           |
| Rate Limiting                                        |
| Trace Context                                        |
+------------------------------------------------------+
            │
            ▼
+------------------------------------------------------+
|                Application Layer                     |
|------------------------------------------------------|
| Command Handlers                                     |
| Query Handlers                                       |
| Transaction Coordination                             |
| Audit Append                                         |
| Outbox Writes                                        |
| Workflow Orchestration                               |
+------------------------------------------------------+
            │
            ▼
+------------------------------------------------------+
|                     Modules                          |
|------------------------------------------------------|
| IAM              | Organization    | Audit           |
| Patients         | Sessions        | Leads           |
| Appointments     | Catalog         | Billing         |
| Communication Policy                                 |
+------------------------------------------------------+
            │
            ▼
+------------------------------------------------------+
|                     Engines                          |
|------------------------------------------------------|
| Access Resolution    | Entitlement                   |
| Lead Distribution    | Smart Scheduling              |
| Recommendation                                       |
+------------------------------------------------------+
            │
            ▼
+------------------------------------------------------+
|            Platform Infrastructure                   |
|------------------------------------------------------|
| Transactional Outbox | Event Bus                     |
| File Storage         | Cache                         |
| GraphQL API Layer    | Observability                 |
+------------------------------------------------------+
            │
            ▼
+------------------------------------------------------+
|          Worker Services (separate deploy)           |
|------------------------------------------------------|
| Reminder Service     | Notification Service          |
| AI Models            | Report Generation Service     |
+------------------------------------------------------+
            │
            ▼
+------------------------------------------------------+
|                   Persistence                        |
|------------------------------------------------------|
| MongoDB              | Object Storage                |
| Future Search Index                                  |
+------------------------------------------------------+
```

---

# 7. Module Communication Rules

Modules SHALL communicate only through:

- domain events
- published interfaces
- engine contracts

Modules SHALL NOT:

- directly mutate another module's data
- enforce another module's invariants
- write directly into another module's collections


Allowed:

```text
LeadConverted → Patients creates Patient
SessionCompleted → Billing creates Invoice
SessionCompleted → Report Generation Service generates Clinical Report
TreatmentPlanSigned → Billing updates Invoice line items
AppointmentBooked → Reminder Service creates reminder schedules
ReminderDue → Notification Service delivers message
CatalogItemDeleted → Appointments cancels future bookings
```

Forbidden:

```text
Billing updates Patient state directly
Leads writes directly into Patient collection
Appointments modifies Staff roles
Notification Service defines reminder rules (owned by Communication Policy)
```

---

# 8. Event Architecture

All domain events SHALL use the Transactional Outbox Pattern.

Flow:

```text
Mutation
   ↓
Transaction
   ├── domain mutation
   ├── audit append
   └── outbox write
commit
   ↓
Outbox Dispatcher
   ↓
Event Bus
   ↓
Consumers
```

Delivery guarantee:

> **At least once delivery**

Consumers MUST be idempotent.

Consumers MUST tolerate duplicates.

Consumers MUST handle replay safely.

---

# 9. Storage Architecture

Primary persistence:

- transactional state
- module entities
- audit logs
- outbox events

Object storage:

- images
- reports
- uploads
- documents

Cache:

- optimization only
- source of truth remains primary persistence

Search:

- derived read-only state

---

# 10. Security Architecture

Authentication:

> JWT identity token

Authorization:

> server-authoritative effective access

Web Components:

> Organization API key

Refresh:

> secure httpOnly cookie

Authentication sessions are modeled as `AuthSession` aggregates in the IAM module.

All access enforcement happens server-side.

---

# 11. Scalability Model

Horizontally scalable:

- API nodes (modular monolith core)
- worker service nodes (Reminder, Notification, AI, Report Generation)
- dispatcher nodes (outbox)

Worker Services scale independently from the core.

System SHALL remain operational under partial subsystem failure.

Async jobs MUST be retryable and resumable.

---

# 12. Platform Correctness Guarantees

This architecture guarantees:

- strict tenant isolation
- immutable historical attribution
- durable event emission
- append-only audit history
- idempotent async processing
- server-authoritative access control
- invariant ownership by module
- deterministic engine execution
- retry-safe background processing

These guarantees are platform-wide and non-negotiable.

---