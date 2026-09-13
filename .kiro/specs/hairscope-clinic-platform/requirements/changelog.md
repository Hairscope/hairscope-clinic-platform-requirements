# Changelog — Requirements

All notable changes to the Hairscope Clinic Platform requirements are documented here. Latest entries are at the top.

---

## v1.5.0 — 2026-07-24

### Added
- **ORG-12: First-Login Onboarding Wizard** (Deferred — specified for future implementation, not yet built). Defines a guided 5-step setup flow (Clinic Details, Working Hours, Clinic Settings, Invite Your Team, Terms & Conditions) shown once to the first OrganizationAdmin after self-registration (ORG-2) invite acceptance, collecting the remaining `ClinicProfile` (ORG-3) fields not captured at registration. Only Working Hours is mandatory to complete the wizard; every other step is skippable per-step or via a global "Skip setup." Tracked via `Organization.onboardingCompletedAt`; shown at most once per Organization and never to subsequently invited staff. Non-blocking — modules remain fully usable while onboarding is incomplete. Added glossary terms `OnboardingWizard`/`OnboardingStep`, error codes `ONBOARDING_WORKING_HOURS_REQUIRED`/`ONBOARDING_ALREADY_COMPLETED`, and the `OnboardingCompleted` event.

---

## v1.4.0 — 2026-06-25

### Added
- **ORG-11: Cross-Clinic Visibility (Organization-Wide Access)** — defines the organization-level `recordVisibilityMode` (`CLINIC_ONLY` / `ORGANIZATION_WIDE`) as a distinct axis from ORG-9's per-staff, within-clinic visibility. Cross-clinic access is **permission-driven, not role-driven** (a role is only a combination of permissions; org-wide access is a grantable permission, not hardcoded to `OrganizationAdmin`). Cross-clinic access exposes non-clinical clinic details only — patient sessions, clinical data, medical documents, and invoices remain clinic-isolated (preserves GI-8). Added a clarifier to ORG-9 distinguishing the two visibility axes.

### Changed
- **File-upload contract** (`shared/api-contracts.md` §8, PAT-4) — accepted upload types broadened to all common modern image formats, including iPhone **HEIC/HEIF**, plus `application/pdf`; HEIC/HEIF should be transcoded to a web-displayable format on ingestion. The GraphQL enum remains `FileType`.

---

## v1.3.0 — 2026-06-25

### Changed
- **Billing reworked** — Invoice generation is now a manual **"Generate Invoice"** action (BIL-1); the platform no longer auto-generates on `SessionCompleted`. Invoice lifecycle is `DRAFT → ISSUED → PAID → REFUNDED / PARTIALLY_REFUNDED` plus `CANCELLED` (replaces `FINALIZED`). A wrong invoice is `CANCELLED` and regenerated (GI-23). Payment status may be recorded with a free-text **method** label (`CASH`/`CARD`/`BANK_TRANSFER`/`OTHER`) — the platform stores method + amount only and never card/bank-account details or processes payments (BIL-3). Refunds now apply to `ISSUED`/`PAID` invoices (BIL-7). `InvoiceFinalized` event → `InvoiceIssued`; audit actions updated (`issue`, `mark_paid`, `cancel`).
- **JWT is identity-only** (IAM-2) — `staffId`, `organizationId`, `clinicId`, `authSessionId`, `iat`, `exp`. Roles/permissions/entitlements are no longer embedded; effective access is resolved server-side per request.
- **globalPatientId no longer auto-links** (PAT-2, GI-6) — each Patient gets a new `globalPatientId` at creation; cross-clinic linking happens only through an explicit verified process (Hairscope Care App), never automatically by email/phone match, to avoid wrongly associating different individuals' medical data.
- **Appointment rescheduling is delete-and-recreate** (APT-7) — the current appointment is moved to `DELETED`/`CANCELLED` and a new one is created (linked via `rescheduledFrom`); `AppointmentRescheduled` is still emitted.
- **AI analysis results are editable** after completion (SES-1) — alongside questionnaire answers, recommendations, routines, and doctor's notes, staff may correct trichoscopy annotations and global analysis values (AI accuracy is not guaranteed).

---

## v1.2.0 — 2026-05-24

### Changed
- **Unified module numbering** — All module files renumbered to match across requirements, designs, and implementations (0=Infra, 1=IAM, 2=Org, 3=Patients, 4=Sessions, 5=Leads, 6=Appointments, 7=Catalog, 8=Billing, 9=Communication, 10=Audit)
- **Removed** `products.md` (redundant — merged into catalog)
- **Moved** IAM and Organization requirements from `core/` to `modules/` with proper numbering
- **Moved** notification-engine and audit-compliance from `core/` to `modules/09-communication.md` and `modules/10-audit.md`
- **Deleted** `reminder-engine.md` (merged into communication)
- **Deleted** `communication-policy.md` (replaced by `09-communication.md`)

---

## v1.1.2 — 2026-05-14

### Changed
- **GI-12 / API contracts** — All API operations are GraphQL, including file uploads. File uploads use GraphQL mutations with the multipart request specification; HTTP endpoints are reserved for file downloads (signed URLs) and webhook ingestion.

### Fixed
- Removed the incorrect claim that GraphQL cannot support binary file uploads.

---

## v1.1.1 — 2026-05-13

### Added
- AI analysis failure cases: partial failure handling, timeout (60s), stuck session detection (>1 hour alert)
- Routine structure: `dosage` field (required for MEDICATION), corrected `frequency` (repeat interval — every day, every other day, every 2 weeks), clarified `duration` (how long to continue)
- Appointment booking via web component auto-creates Lead if no existing Patient/Lead match
- OTP verification for booking email match (deferred)
- Working hour changes: warn admin of affected appointments, auto-cancel on confirmation
- LOST lead status cancels active appointments
- Catalog items support `INACTIVE` status (hidden but retained for history)
- Standalone invoices without sessions (product-only sales)
- Invoice auto-updates on Treatment Plan/Prescription signing
- 7 new events: `TreatmentPlanSigned`, `PrescriptionSigned`, `TreatmentPlanRegenerated`, `PrescriptionRegenerated`, `CatalogItemDeleted`, `LeadLost`, `WorkingHoursChanged`
- Fixed consumers: `AppointmentRescheduled` (+Reminder Service), `AppointmentCancelled` (+Sessions delete DRAFT, +Reminder Service)
- 36 edge case clarifications: globalPatientId system-managed, no re-conversion, inactive services not bookable, public booking toggle, no anonymous booking, existing patient auto-linking, reminders without notifications, GDPR erasure 404s all links

---

## v1.1.0 — 2026-05-13

### Added
- **Catalog Module** — Replaces Products module. Unified catalog with types: SERVICE, MEDICATION, COSMETIC, SUPPLEMENT. Treatment Kits. Digital signature management. Document generation/signing workflow with strike-through edit history.
- **Notification Service** — Delivery infrastructure: multi-channel (EMAIL, WHATSAPP, SMS, PUSH, IN_APP, WEBHOOK), fallback chains, retry, rate limiting, quiet hours, deduplication, provider webhooks, unsubscribe handling.
- **Reminder Service** — Time-based scheduling: due detection, recurrence, missed reminder handling, pause/resume, timezone normalization.
- **Communication Policy Module** — Templates, channel preferences, appointment reminder rules, follow-up rules, consent preferences, notification branding, quiet hours config, rate limit config.
- **Selfie Analysis Web Component** (SA-1 to SA-9) — 7-step flow, Lead + Anonymous modes, OTP domain restriction, customization model.
- **Appointment Booking Web Component** (AB-1 to AB-9) — Service selection, date/slot picking, booking, search with OTP, reschedule, cancel, integration with Selfie Analysis.
- **IAM-8: Password Policy** — Min 8 chars, alphanumeric + symbol.
- **IAM-9: Session Lifetime** — No expiry until explicit logout.
- **IAM-10: Password Reset** — Self-service forgot password flow (24h token).
- **ORG-9: Record Visibility Mode** — OPEN (default) or RESTRICTED (assignment-based, HIPAA minimum-necessary). Org-level overrides clinic-level.
- **ORG-10: Individual Record Reassignment** — Admins or staff with permission can reassign one record at a time.
- **APT-10: Appointment Completion + Next Visit** — Option to schedule follow-up at completion time.
- **APT-11: Appointment Cancellation Cascade** — Cancelling appointment deletes linked DRAFT session.
- **Data Lifecycle 10.3: Import/Export** — CSV + Excel, per-module, async queued, deferred implementation.
- Slot availability = clinic hours ∩ staff availability for selected service.
- Walk-in appointments via calendar page.
- Appointment confirmation by patient (via link) or staff.
- Session `assignedTo` = creator (manual) or least-load staff (auto from appointment).
- Invoice auto-sync with recommendation changes (while DRAFT). Manual line items (name, quantity, unitPrice).
- Treatment Kit as single invoice line item with bundle price.
- Zero-item and zero-total invoices allowed.
- Questionnaire edits overwrite (audit preserves history), report marked outdated, manual regeneration required.
- Shareable PDF links: public access, same expiry as patient data retention, invalidated on GDPR erasure.
- Currency enforcement policy (org-level). Clinic language/locale setting. Currency required before catalog use.

### Changed
- **GI-8** — OrgAdmin can now access Leads module (for assignment only). Cannot access Patients, Appointments, Billing, Catalog.
- **IAM-4: Staff Deactivation** — Now requires record reassignment (same pattern as deletion).
- **ORG-2: Self-Registration** — Expanded: user details + org + clinic → invite-self flow → trial period → external billing via webhook.
- **ORG-4: Inter-Clinic Transfer** — Requires record reassignment before transfer. OrgAdmin assigns roles from destination clinic. StaffAvailability resets.
- **Sessions** — Clarified as "trichoscopy session" (not entire clinical visit). Stores `appointmentId`. Multiple staff can edit (last save wins).
- **Appointments** — Stores both `leadId` and `patientId`. Lead conversion updates appointment. CONFIRMED auto-creates DRAFT session.
- **Billing** — Triggered by `SessionCompleted` (not AppointmentCompleted). Supports structured manual line items.
- **Permission Engine** — Dual-role resolution: ClinicAdmin overrides GI-8 in own clinic.
- **SmartScheduling** — Inactive staff skipped. Rule 4 now edge case only.
- **Audit Coverage** — Expanded to all creates/deletes/downloads/shares. Split refund into full/partial. Added Treatment Plan, Prescription, Digital Signature, Webhook, Communication Policy, Import/Export events.

### Removed
- **Products Module** — Superseded by Catalog Module.
- **AppointmentCompleted event** — Redundant. SessionCompleted handles billing trigger.
- **Lead deletion** — Deferred. Only GDPR erasure removes lead data.

### Fixed
- Enum inconsistencies: Appointment statuses aligned (SCHEDULED/CONFIRMED/COMPLETED/CANCELLED/NO_SHOW). Lead sources aligned (MANUAL/WEBHOOK/SELFIE_ANALYSIS).
- Duplicate `SessionCompleted` event removed from event definitions.
- All `products` references updated to `catalog` across all modules.

---

## v1.0.0 — 2025-04-29

### Initial Release
- Master requirements document with 8 system principles, 33 global invariants.
- Core: Identity & Access (IAM-1 to IAM-7), Organization Management (ORG-1 to ORG-8), Audit & Compliance (AUD-1 to AUD-6), Data Ownership (OWN-1 to OWN-4), System Invariants.
- Modules: Patients (PAT-1 to PAT-5), Sessions (SES-1 to SES-HA-4), Leads (LM-1 to LM-13), Appointments (APT-1 to APT-9), Products (PRD-1 to PRD-4), Billing (BIL-1 to BIL-7).
- Shared: Enums, Error Codes, API Contracts, Event Definitions (with Transactional Outbox Pattern).
