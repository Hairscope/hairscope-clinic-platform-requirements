# System Invariants

> These are non-negotiable rules that must hold at all times across the entire platform. Any operation that would violate an invariant must be rejected before it is committed to the database.

---

## Identity & Access Invariants

| ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Invariant | Enforced By |
|:------------|-----------|-------------|
| GI-1 | Every record belongs to exactly one Organization. Cross-organization data access is impossible. | All GraphQL resolvers |
| GI-2 | Every Clinic belongs to exactly one Organization. | DB constraint + resolver |
| GI-3 | Every Clinic-level Staff member is assigned to exactly one Clinic at a time. Organization_Admins span all Clinics in their Organization. Staff may be transferred between Clinics within the same Organization by an Organization_Admin only. | DB constraint + resolver |
| GI-4 | Every Organization has at least one active Organization_Admin at all times. | Deactivation + deletion guards |
| GI-5 | Every Clinic has at least one active Clinic_Admin at all times. | Deactivation + deletion guards |
| GI-6 | Every Patient record is scoped to the Clinic where it was created (data isolation maintained). The platform assigns a `globalPatientId` (UUID) to each unique physical person at creation time via email or phone lookup. All Patient records for the same person across any Clinic or Organization share the same `globalPatientId`. A Clinic cannot access another Clinic's Patient records via `globalPatientId` — it is a linking key for the **Hairscope Care App** only. Per-Clinic uniqueness on email and phone still applies. | DB unique constraint (per clinic) + global identity lookup on create |
| GI-7 | A Patient may have at most one active Session (status: `Draft`) per Clinic at any point in time. Only `Completed` Sessions contribute to the Treatment Progress Graph and patient progress tracking. `Draft` and `Saved` Sessions are excluded from progress tracking. | Session create guard + progress graph query filter |
| GI-8 | The Organization_Admin role cannot be granted permissions to `patients`, `appointments`, `leads`, `billing`, or `products` modules under any configuration. | Permission engine |
| GI-9 | A Staff member's effective permissions are the union of all permissions granted by all their assigned roles. | Permission engine |
| GI-10 | Deny is the default. If no role grants a permission, the action is denied. | Permission engine |

---

## Patient & Session Invariants

| ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Invariant | Enforced By |
|:------------|-----------|-------------|
| GI-11 | No two Patients within the same Clinic may share the same `email`. | DB unique constraint (per clinic) |
| GI-12 | No two Patients within the same Clinic may share the same `phone`. | DB unique constraint (per clinic) |
| GI-13 | A Patient may have at most one active Session (status: `Draft` or `Saved`) per Clinic at any point in time. | Session create guard |
| GI-14 | A Session in `Saved` or `Completed` status cannot be deleted. | Session delete guard |
| GI-15 | A saved Session must contain a minimum of 6 Trichoscopy_Images, one from each of the 6 mandatory positions: Frontal (P1), Left Temporal (P2), Right Temporal (P3), Top of the Head (P4), Crown (P5), Occipital (P6). Additional images beyond these 6 are permitted. | Session save validation |
| GI-16 | A saved Session must contain at least one Frontal Global_Image. | Session save validation |
| GI-17 | Patient records cannot be deleted or archived except via GDPR erasure. | No delete mutation exposed |
| GI-18 | Each Questionnaire_Category must have exactly 5 active questions per Clinic at all times. | Question toggle guard |
| GI-19 | Only `Saved` and `Completed` Sessions contribute to the Treatment Progress Graph and patient progress tracking. `Draft` Sessions are excluded. | Progress graph query filter |

---

## Data Integrity Invariants

| ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Invariant | Enforced By |
|:------------|-----------|-------------|
| GI-20 | All timestamps are stored in UTC. | DB constraint + serializer |
| GI-21 | All entity IDs are server-generated UUIDs (v4). Client-supplied IDs are rejected. | Resolver input validation |
| GI-22 | Invoice numbers are sequential integers scoped per Clinic and are never reused. | DB sequence per Clinic |
| GI-23 | An Invoice associated with a Completed Session is immutable once Finalized. | Invoice finalize guard |
| GI-24 | A Lead's status cannot be manually set to `Converted` - it is set only by the conversion process. | Lead status mutation guard |

---

## Audit Invariants

| ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Invariant | Enforced By |
|:------------|-----------|-------------|
| GI-25 | Audit_Log entries are append-only and cannot be edited, deleted, or soft-deleted. | No update/delete mutation exposed; DB append-only policy |
| GI-26 | Audit_Log entries are never transferred when a Staff member is deleted. | Data transfer logic |
| GI-27 | Audit_Log entries retain the original actor name even after the actor is deleted. | Snapshot at write time |
| GI-28 | Audit_Log entries are retained for a minimum of 7 years. | Retention policy enforcement |

---

## API & Architecture Invariants

| ID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Invariant | Enforced By |
|:------------|-----------|-------------|
| GI-29 | All API operations are GraphQL except file uploads (HTTP multipart), webhook ingestion (HTTP POST), and video/virtual consultation sessions (WebRTC or equivalent real-time protocol). | Architecture |
| GI-30 | No module may directly call another module's internal resolver, service, or repository. | Architecture + code review |
| GI-31 | All cross-module communication uses domain events via the event bus. | Architecture |
| GI-32 | GraphQL mutations are atomic. Partial success is not permitted. | Resolver transaction wrapping |
| GI-33 | Subscription plan status is provided by an external system. The platform enforces gates but does not manage billing. | Architecture |

---

## Violation Handling

When an invariant would be violated by an operation:

1. The operation MUST be rejected before any database write occurs.
2. The rejection MUST return a specific error code from `shared/error-codes.md`.
3. The rejection MUST NOT produce a partial state change.
4. The rejection SHOULD be logged at the application level for monitoring.
5. Invariant violations caused by concurrent requests MUST be handled via database-level constraints (unique indexes, check constraints, serializable transactions) — application-level checks alone are insufficient.
