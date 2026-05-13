# Changelog

All notable changes to the Hairscope Clinic Platform requirements are documented here. Latest entries are at the top.

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
