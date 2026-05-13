# Hairscope Platform — Data Layer

> **Version:** 1.0.0  
> **Status:** Draft  
> **Layer:** Platform Design  
> **Scope:** Data Ownership, Persistence Boundaries, and Access Patterns

---

# 1. Purpose

This document defines how data is structured, owned, and accessed within the Hairscope Platform.

It establishes:

- data ownership boundaries
- persistence responsibilities
- data access patterns
- consistency rules
- data lifecycle principles

This document answers:

> Where does data live, who owns it, and how is it accessed?

This document derives from:

- `01-system-architecture.md`
- `02-repository-architecture.md`
- `03-domain-modeling.md`

---

# 2. Design Principles

## DL-1 Module-Owned Data

Each module SHALL own its data.

Only the owning module may:

- create data
- modify data
- enforce invariants

Other modules SHALL NOT directly access or mutate another module’s data.

---

## DL-2 Aggregate-Centric Persistence

Aggregates define the consistency boundary for persistence.

Data within an aggregate MAY be stored across multiple structures,  
but consistency and invariants MUST be enforced at the aggregate level.

---

## DL-3 Encapsulated Data Access

All data access SHALL occur through module-owned interfaces.

- Aggregates SHALL be accessed through repositories  
- Read operations SHALL be accessed through module-defined query interfaces  

Direct access to storage from outside the module is forbidden.

---

## DL-4 Reference-Based Relationships

Cross-module relationships SHALL use identifiers only.

No aggregate SHALL embed another aggregate.

---

## DL-5 Tenant Isolation

All data SHALL be scoped by:

- `organizationId`
- `clinicId` (when applicable)

Data isolation between tenants SHALL be strictly enforced.

---

## DL-6 Immutable Historical Data

Historical data SHALL be immutable.

Examples include:

- audit logs
- completed sessions
- issued invoices

---

## DL-7 Separation of Concerns

The data layer SHALL NOT contain:

- business logic
- authorization logic
- transport logic

---

# 3. Data Ownership Model

Each module owns its aggregates and corresponding data.

---

## 3.1 IAM Module

Owns:

- Staff
- Role
- AuthSession
- Invite

---

## 3.2 Organization Module

Owns:

- Organization
- Clinic
- Subscription
- APIKey

---

## 3.3 Audit Module

Owns:

- AuditLog

Audit data is append-only and immutable.

---

## 3.4 Patients Module

Owns:

- Patient

Includes identity linkage via `globalPatientId`.

---

## 3.5 Sessions Module

Owns:

- Session

Session logically owns all associated data including:

- images
- annotations
- questionnaire
- recommendations
- report

These are not independent aggregates.

---

## 3.6 Leads Module

Owns:

- Lead

---

## 3.7 Appointments Module

Owns:

- Appointment

---

## 3.8 Catalog Module

Owns:

- CatalogItem (unified entity with types: SERVICE, MEDICATION, COSMETIC, SUPPLEMENT)

---

## 3.9 Billing Module

Owns:

- Invoice

---

## 3.10 Communication Policy Module

Owns:

- NotificationTemplate
- ChannelPreference
- ReminderRule
- ConsentPreference
- NotificationBranding
- QuietHoursConfig

---

# 4. Persistence Boundaries

Each module SHALL define its own persistence boundary.

---

## 4.1 Repository Responsibility

Repositories SHALL:

- load aggregates  
- persist aggregates  

Repositories SHALL NOT:

- implement business logic  
- access other module data directly  
- perform complex read aggregation  

---

## 4.2 Query Interfaces

Query operations SHALL be handled through module-defined read interfaces.

These interfaces MAY:

- provide optimized read access  
- support projections or views  
- combine data within module boundaries  

---

## 4.3 Cross-Module Access

Modules MAY access data from other modules only through:

- published contracts  
- domain events  
- explicitly exposed application-level query interfaces  

Direct access to another module’s storage is forbidden.

---

# 5. Data Access Patterns

---

## 5.1 Command Operations (Write)

Write operations SHALL:

- go through the application layer  
- operate on aggregates  
- enforce invariants  
- emit domain events  
- respect transactional boundaries  

---

## 5.2 Query Operations (Read)

Read operations MAY:

- use optimized query paths  
- use projections or views  
- combine data from multiple modules only through module-defined interfaces  

Read operations SHALL NOT:

- modify data  
- enforce business invariants  

Cross-module data access at the storage level is forbidden.

---

## 5.3 Read vs Write Separation

Write model:

- strict  
- invariant-driven  
- aggregate-based  

Read model:

- flexible  
- optimized for queries  
- may be denormalized  

---

# 6. Data Consistency

Cross-module transactions SHALL NOT be used.

Consistency across modules SHALL be achieved through
event-driven coordination and asynchronous processing.

---

## 6.1 Within Aggregate

Consistency SHALL be strong.

All invariants MUST be enforced atomically.

---

## 6.2 Across Aggregates

Consistency SHALL be eventual.

Cross-module workflows SHALL be coordinated via:

- domain events  
- asynchronous processing  

---

# 7. Data Lifecycle

---

## 7.1 Creation

Data SHALL be created through module-owned workflows.

---

## 7.2 Updates

Data updates SHALL:

- respect aggregate boundaries  
- enforce invariants  

---

## 7.3 Deletion

Deletion MAY be:

- soft (logical removal)  
- hard (physical removal)  

Deletion rules SHALL be defined per module.

---

## 7.4 Retention

Retention policies SHALL be module-defined.

Critical data MAY require long-term retention.

---

# 8. Data for Authorization

Authorization SHALL operate on resolved access context,  
not directly on raw storage structures.

The data layer SHALL expose data required to construct this context
through module-defined interfaces.

---

# 9. Data Integrity

The system SHALL ensure:

- no orphan references  
- valid cross-entity relationships  
- tenant-safe data access  
- consistency within aggregates  

---

# 10. Security Considerations

The data layer SHALL enforce:

- tenant isolation  
- controlled access via modules  
- no direct exposure of storage  
- protection of sensitive data  

---

# 11. Transactional Event Support

The data layer SHALL support reliable event publication.

State changes within aggregates SHALL produce domain events.

Event recording SHALL occur within the same persistence boundary
as the aggregate state change.

This responsibility lies within the module’s persistence layer.

Event delivery SHALL be handled asynchronously.

This ensures consistency between state changes and event propagation.

---

# 12. Guarantees

This data layer design guarantees:

- clear ownership of data  
- strong aggregate consistency  
- safe cross-module interaction  
- scalable read and write patterns  
- alignment with domain model  
- support for authorization and event systems  

---