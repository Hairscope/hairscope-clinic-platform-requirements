# Changelog — Designs

All notable changes to the Hairscope Clinic Platform design documents are documented here. Latest entries are at the top.

---

## v1.1.0 — 2026-06-25

### Changed
- **Sessions design** (`modules/04-sessions.md`) — AI analysis results are now editable after completion (alongside questionnaire responses, recommendations, and doctor notes); only the original captured image binaries remain immutable. Annotation data is modelled as `RootPoint` / `HairStrand` documents (+ `GlobalAnalysisData` with an `overrides[]` audit trail) to match the implemented schema, as sub-entities of the Session aggregate (not independent aggregates).
- **Billing design** (`modules/08-billing.md`) — Invoice lifecycle is now `DRAFT → ISSUED → PAID → REFUNDED / PARTIALLY_REFUNDED` plus `CANCELLED` (replaces `FINALIZED`). Invoice creation is a manual "Generate Invoice" action — Billing consumes no events to create invoices and does not auto-generate on `SessionCompleted`; signed documents only suggest line items. Payment is recorded as a free-text method label with no card/bank-account details. `InvoiceFinalized` event → `InvoiceIssued`.
- **Domain modeling** (`03-domain-modeling.md`) — Invoice lifecycle aligned to the above. Lead lifecycle corrected to `NEW → CONTACTED → QUALIFIED → CONVERTED / LOST`; `ASSIGNED` is not a status (assignment is tracked via `assignedStaffId`).
- **Appointments design** (`modules/06-appointments.md`) — Dropped the "at most one active appointment per Lead/Patient" invariant (per-patient appointment caps deferred).

---

## v1.0.0 — 2026-05-13

### Initial Release
- 16 platform design documents covering system architecture through performance
- 6 module design documents (Patients, Sessions, Leads, Appointments, Catalog, Billing)
- Architecture aligned with requirements v1.1.1

### Key Architectural Decisions
- Modular Monolith Core with isolated modules
- Stateless Engines for decision computation
- Separate Worker Services for async infrastructure (Reminder, Notification, AI Models, Report Generation)
- Event-driven cross-module communication via Transactional Outbox
- Identity-only JWT with transparent token rotation (IAM-9 compliance)
- Communication Policy Module owns business rules; Worker Services execute them
