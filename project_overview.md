# Hairscope Clinic Platform — Project Overview

> Version 1.1.0 · Status: Draft · May 2026

## What We Are Building

**Hairscope Clinic Platform** is an **Enterprise SaaS** system for hair treatment clinics. It is a multi-tenant, GDPR + HIPAA compliant, event-driven backend platform with a GraphQL API and embedded web components for patient-facing experiences.

---

## High-Level Architecture

```
Organization (Tenant)
  └── Clinic (1..N per Org)
        └── Staff (roles: Org_Admin, Clinic_Admin, Doctor, Nurse, Sales, etc.)
              └── Permissions (module × action — union of roles)

External Touchpoints
  ├── Selfie Analysis Web Component (Stencil) → Lead capture + AI hair report
  └── Appointment Booking Web Component (Stencil) → Self-serve booking
```

**Tech Stack:**
- API: **GraphQL** (all operations except file uploads and webhooks)
- File uploads: HTTP multipart
- Webhook ingestion: HTTP POST
- Real-time: GraphQL Subscriptions + WebRTC (video, future)
- All timestamps: UTC / ISO 8601
- All IDs: UUIDs v4 (server-generated)
- Auth: JWT (httpOnly cookies or secure in-memory — never localStorage)
- Sessions: No expiry — active until explicit logout or account deactivation

---

## 8 System Principles (Non-Negotiable)

1. **Security by default** — Deny is the default for every permission check
2. **GDPR & HIPAA first** — Patient data handling must satisfy both
3. **Tenant isolation** — No query may return data outside the org boundary
4. **Event-driven** — Modules communicate via domain events only, no direct calls
5. **Auditability** — Every state-changing operation produces an immutable audit log
6. **Idempotency** — All mutations must be safe to retry
7. **UTC everywhere** — Timestamps stored and transmitted in UTC
8. **Explicit over implicit** — Every business rule has a formal server-side invariant

---

## Identity Model

| Scope | Who | Access |
|-------|-----|--------|
| `org` | Organization_Admin | Staff mgmt + clinic details + lead assignment across all clinics. **No** access to patients, appointments, billing, or catalog. |
| `clinic` | Clinic_Admin, Doctor, Receptionist, Nurse, Sales, Marketing, Frontdesk | Full/partial access within assigned Clinic only |
| `external` | Web component users | Appointment booking + selfie analysis via API key only |

**Key rules:**
- Deny by default; effective permissions = union of all assigned roles
- Organization_Admin can **never** access Patients, Appointments, Billing, or Catalog. MAY access Leads for assignment purposes.
- Dual-role resolution: ClinicAdmin permissions override OrgAdmin restrictions when operating within their assigned Clinic
- Each Organization must always have ≥ 1 active Org_Admin; each Clinic ≥ 1 active Clinic_Admin
- Record visibility mode: `OPEN` (default) or `RESTRICTED` (staff only see assigned records; HIPAA minimum-necessary)

---

## Core Modules

### 🔐 Identity & Access (IAM-1 to IAM-10)
- **Invite flow**: Admin sends invite → single-use link (7-day TTL) → invitee sets password → ACTIVE
- **Self-registration**: User provides name, email, phone, org name, clinic name, clinic address → creates org + clinic + staff with both roles → invite-self flow → trial period starts
- Staff statuses: `PENDING_REGISTRATION → ACTIVE ↔ INACTIVE`
- Staff email is immutable after invite
- **Deactivation AND deletion** both require reassignment of all responsibility-based records
- Staff record is never physically deleted (kept for audit attribution)
- Multi-device JWTs; deactivation immediately invalidates all tokens
- **Password policy**: min 8 chars, alphanumeric + symbol
- **Session lifetime**: no expiry until explicit logout
- **Password reset**: self-service forgot password flow (24h token)

### 🏢 Organization Management (ORG-1 to ORG-10)
- Self-registration: user details + org + clinic → trial period → external billing system activates plan via webhook
- Clinic Profile: name, address, timezone (IANA), language (locale), currency (ISO 4217), working hours, logo, report header, T&Cs
- **Currency enforcement**: Org-level policy (`ENFORCE_SINGLE_CURRENCY` or `ALLOW_CLINIC_CURRENCY`)
- **Language**: Clinic selects locale; all documents generated in that language permanently
- Inter-clinic staff transfers: requires record reassignment, role assignment from destination clinic, availability reset
- Clinic deactivation (org must always have ≥ 1 active clinic; clinics are NOT deletable)
- Staff availability config (internal to Smart Scheduling; never exposed to patients)
- **Report Templates**: Org_Admin configures 2 template types; all clinics share structure; only ReportHeader is clinic-customizable
- **Record Visibility Mode**: `OPEN` (all staff see all) or `RESTRICTED` (assignment-based); Org-level overrides Clinic-level
- **Individual Record Reassignment**: Admins (or staff with permission) can reassign one record at a time

### 📜 Audit & Compliance (AUD-1 to AUD-6)
- Immutable append-only audit log, retained ≥ 7 years (HIPAA)
- Full entity coverage: Staff, Roles, Clinic, Patient, Session, Lead, Appointment, Catalog Item, Treatment Kit, Invoice, Clinical Report, Treatment Plan, Prescription, Auth events, Plan changes, Webhook Sources, Communication Policy, Import/Export
- All creates, updates, deletes, shares, downloads logged
- GDPR: AES-256 at rest, TLS 1.2+ in transit, right-to-erasure (anonymizes PII, keeps clinical data)
- Consent records (type, granted/revoked, timestamp, staff actor)
- Plan gates enforced at permission layer (plan status from external system)

### 🗂️ Data Ownership (OWN-1 to OWN-4)
- **Attribution** (createdBy, authoredBy) — immutable, never changed
- **Responsibility** (assignedTo) — reassignable on staff deactivation or deletion
- Reassignable records: Sessions (`assignedTo`), assigned Leads (`assignedTo`), Appointments (`assignedTo`)
- Patients, Medical Docs, Invoices, Audit Log — NOT reassignable (belong to clinic/patient/session)

### ⚖️ System Invariants (GI-1 to GI-33)
- 33 hard invariants covering identity, patient/session, data integrity, audit, and API/architecture rules
- Key ones: no cross-org/cross-clinic access, max 1 DRAFT session per patient per type, Saved/Completed sessions undeletable, audit log append-only, all API is GraphQL (exceptions: file upload, webhooks, video), cross-module via events only

---

## Feature Modules

### 🧑‍⚕️ Patients (PAT-1 to PAT-5)
- Required fields: `firstName`, `lastName`, `email`, `genderAssignedAtBirth`
- Optional: `dateOfBirth` (auto-computes age), `age` (manual fallback), `phone`, `externalPatientId`
- Per-clinic uniqueness on email + phone; cross-clinic duplicates allowed
- **`globalPatientId`**: UUID linking same physical person across all clinics/orgs (for Hairscope Care App only — not a cross-clinic access mechanism for staff)
- **Treatment Progress Graph**: plots `hairCount`, `thickness`, `coverage` across `COMPLETED` sessions only
- Medical Documents: JPEG/PNG/PDF, ≤ 10MB, requires title
- **GDPR Erasure**: ClinicAdmin/OrgAdmin only; anonymizes PII (name, email, phone, DOB); clinical data stays

### 🔬 Sessions (SES-1 to SES-HA-4)
- **Session = Trichoscopy analysis session** (NOT the entire clinical visit). Additional procedures like PRP happen after session completion.
- Sub-resource of Patients; cannot exist without a Patient
- Session statuses: `DRAFT → SAVED → COMPLETED`, `DRAFT → DELETED`
- One active DRAFT per patient per session type at a time
- Sessions store optional `appointmentId` (one session per appointment max)
- Multiple staff can edit same session (last save wins, no locking)
- **Session Types** (extensible): currently `HAIR_ANALYSIS`; future: `SKIN_TREATMENT`, `HAIR_REMOVAL`

**Hair Analysis specifics:**
- **Global Images**: 10 positions; ≥ 1 FRONTAL required to save; 1 per position max
- **Trichoscopy Images**: ≥ 6 mandatory positions (P1–P6); each has `(x,y)` position on head diagram
- **AI Analysis** (async): triggered by `SessionSaved` event; produces per-image `hairCount`, `density`, `thickness`; overall hair loss stage; notifies staff; 3 retries then `FAILED`
- **Annotation Editor**: Follicle tool, Strand tool, Delete mode; brightness/contrast persisted; no undo/redo; AI vs HUMAN source tracked
- **Questionnaire**: 5 categories × 5 active questions + `STRESS_TEST` (~10 Qs); auto-calculates `RootCause` + `StressOMeter`; edits after completion trigger recalculation + report regeneration
- **Clinical Trichoscopy Report**: PDF auto-generated on `SessionCompleted`; includes images, AI results, questionnaire summary, doctor's note; shareable immediately (no approval needed); public shareable links with same expiry as patient data

### 📦 Catalog (CAT-1 to CAT-8)
- **Unified catalog** of all clinic offerings (replaces separate Products + Services)
- **Catalog Item Types**: `SERVICE` (bookable, has duration + qualifiedStaff) | `MEDICATION` (prescription required, routine mandatory) | `COSMETIC` | `SUPPLEMENT`
- All items: name, description, image, price (required ≥ 0), externalLink, routine
- Currency inherited from Clinic (no per-item currency)
- **Treatment Kits**: Named bundles of catalog items with combined pricing
- **Session Recommendations**: Any catalog item or kit can be recommended; routines customizable per recommendation
- **Document Generation**: Treatment Plan (all recommendations) + Prescription (medications only); requires digital signature; strike-through edit history for clinical trust
- **Digital Signature**: Staff upload signature image to profile; required for Treatment Plan/Prescription generation
- **Deletion**: SERVICE deletion cancels future appointments (with warning); non-SERVICE deletion preserves snapshots in existing documents

### 📊 Leads (LM-1 to LM-13)
- **Lead Sources**: `MANUAL` | `WEBHOOK` | `SELFIE_ANALYSIS`
- **Lead Statuses**: `NEW → CONTACTED → QUALIFIED → CONVERTED` (via conversion process) | `LOST`
- No lead deletion — only GDPR erasure
- **Lead Assignment Modes** (org-level):
  - `AUTO_ASSIGN` (default): clinic determined from source; LeadDistributionAlgorithm assigns staff
  - `MANUAL_ASSIGN`: Org Admin reviews and confirms clinic assignment
- **LeadDistributionAlgorithm**: Round-Robin (pluggable); ClinicAdmin fallback
- **Unassigned Leads**: visible to OrgAdmin only
- **Conversion**: `convertLeadToPatient`; auto-populates patient fields; updates linked appointments with patientId; emits `LeadConverted`

### 📅 Appointments (APT-1 to APT-11)
- **Services** from Catalog Module (type `SERVICE`); one service per appointment
- Appointments store both `leadId` and `patientId` (nullable); lead conversion updates patientId
- **Slot availability**: derived from ClinicWorkingHours only
- Timezone + currency required before booking
- **Booking**: Staff, walk-in (via calendar), or via web component; email confirmation sent
- **Statuses**: `SCHEDULED → CONFIRMED → COMPLETED/CANCELLED/NO_SHOW`
- **CONFIRMED → auto-creates DRAFT Session** for the patient (if patientId set)
- **Cancellation cascade**: cancelling appointment deletes linked DRAFT session
- **Completion + Next Visit**: option to schedule follow-up appointment at completion time
- **Smart Scheduling Engine** (pluggable): continuity of care → least busy → any available → no assignment (flags for manual)
- `assignedStaffId` never exposed to patients; inactive staff skipped by SmartScheduling

### 🧾 Billing (BIL-1 to BIL-7)
- Auto-generated Draft Invoice on `SessionCompleted` event
- **Auto-sync**: While DRAFT, invoice line items sync with session recommendations (adds/removes/edits). Manual line items never auto-removed.
- **Manual line items**: Staff can add structured items (name, quantity, unitPrice) + MiscCharges + Discounts
- Formula: `Total = (Subtotal - DiscountAmount) × (1 + TaxRate)`; clamped to 0 if negative
- Invoice numbers: sequential integers scoped per clinic
- `DRAFT → FINALIZED` (locked); `FINALIZED → REFUNDED / PARTIALLY_REFUNDED`
- PDF export server-generated; no payment processing within platform
- Billing analytics: date-range filtered; based on finalized invoice totals; refunds deducted

---

## Services (Infrastructure Layer)

### 📬 Notification Service
- Accepts notification intents (from events or explicit commands)
- Renders templates, selects channels, schedules delivery
- Channels: EMAIL, WHATSAPP, SMS, PUSH, IN_APP, WEBHOOK
- Multi-channel fallback, retry (5 attempts), rate limiting, quiet hours
- Delivery tracking, provider webhook handling, deduplication
- Unsubscribe handling (per channel, per notification type)

### ⏰ Reminder Service
- Time-based workflow orchestration
- Creates schedules from domain events (AppointmentBooked, SessionCompleted)
- Due detection (30s scanning interval), missed reminder handling
- Recurrence support (ONCE, RECURRING with intervals)
- Pause/resume, timezone normalization
- Emits `ReminderDue` → consumed by Notification Service

### 📋 Communication Policy Module
- Templates (per notification type, per channel, per locale)
- Channel preferences (primary + fallback chain)
- Appointment reminder rules (default: 24h email + 2h email+WhatsApp)
- Follow-up reminder rules (post-session)
- Consent preferences (per recipient, per purpose)
- Notification branding (org-level + clinic-level override)
- Quiet hours configuration
- Rate limit configuration

---

## Web Components

### 📸 Selfie Analysis (SA-1 to SA-9)
- Standalone Stencil-based embeddable component (UI shell + workflow orchestrator)
- **Modes**: Lead (creates lead record) | Anonymous (no PII stored)
- **7-step flow**: Camera capture → Profile form → Questions → Processing overlay → Report generation → Result screen → Error state
- Authenticated via Organization API key + domain restriction
- Customizable: theme, slots, CSS parts, locale, camera masks, webhook forwarding
- AI model is external API (out of scope)

### 📅 Appointment Booking (AB-1 to AB-9)
- Standalone Stencil-based embeddable component
- Service selection → Date/slot picking → Visitor details → Booking confirmation
- Appointment search by email, reschedule, cancel (self-service)
- Integrates with Selfie Analysis flow (pre-fills data via localStorage)
- Same auth model (Organization API key + domain restriction)

---

## Shared Infrastructure

### API Contracts
- GraphQL (Relay cursor-based pagination for all lists > 20 records)
- Error format: `{ code, field?, traceId }` on all errors
- Async polling: `asyncOperationStatus` query
- File upload: HTTP multipart (images/PDFs ≤ 10MB)
- Webhook: HTTP POST with API key auth
- Subscriptions: `aiAnalysisCompleted`, `appointmentStatusChanged`, `sessionStatusChanged`, `reportGenerated`
- Schema versioning: `X-Schema-Version` header; deprecated fields kept ≥ 2 release cycles

### Enums (canonical values)
- Staff Status: `PENDING_REGISTRATION | ACTIVE | INACTIVE`
- Session Type: `HAIR_ANALYSIS` (future: `SKIN_TREATMENT`, `HAIR_REMOVAL`)
- Session Status: `DRAFT | SAVED | COMPLETED | DELETED`
- Lead Status: `NEW | CONTACTED | QUALIFIED | CONVERTED | LOST`
- Lead Source: `MANUAL | WEBHOOK | SELFIE_ANALYSIS`
- Lead Priority: `LOW | MEDIUM | HIGH | URGENT`
- Appointment Status: `SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW`
- Catalog Item Type: `SERVICE | MEDICATION | COSMETIC | SUPPLEMENT`
- Invoice Status: `DRAFT | FINALIZED | REFUNDED | PARTIALLY_REFUNDED`
- Record Visibility Mode: `OPEN | RESTRICTED`
- Currency Enforcement: `ENFORCE_SINGLE_CURRENCY | ALLOW_CLINIC_CURRENCY`
- Notification Priority: `URGENT | HIGH | NORMAL | LOW`
- Reminder Status: `SCHEDULED | DUE | FIRED | MISSED | CANCELLED | PAUSED`

### Domain Events (event bus)
| Event | Emitted By | Consumed By |
|-------|-----------|-------------|
| `SessionSaved` | Sessions | AI Analysis Service |
| `SessionCompleted` | Sessions | Report Module, Billing, Notification Service, Reminder Service |
| `SessionDeleted` | Sessions | Storage Service |
| `AnnotationEditSaved` | Sessions | Report Module |
| `AIAnalysisCompleted` | AI Service | Sessions, Notification Service |
| `AIAnalysisFailed` | AI Service | Sessions, Notification Service |
| `LeadCreated` | Leads | Notification Service |
| `LeadConverted` | Leads | Patients, Appointments |
| `AppointmentBooked` | Appointments | Notification Service, SmartScheduling, Reminder Service |
| `AppointmentRescheduled` | Appointments | Notification Service, Reminder Service |
| `AppointmentCancelled` | Appointments | Notification Service, Reminder Service, Sessions |
| `ReminderDue` | Reminder Service | Notification Service |
| `InvoiceGenerated` | Billing | Notification Service |
| `InvoiceFinalized` | Billing | Analytics |
| `InvoiceRefunded` | Billing | Analytics |
| `NotificationDelivered` | Notification Service | — |
| `NotificationFailed` | Notification Service | Observability |

---

## Performance Targets
| Operation | SLA |
|-----------|-----|
| GraphQL query (p95) | ≤ 500ms |
| GraphQL mutation (p95) | ≤ 800ms |
| Appointment slot availability | ≤ 300ms |
| AI analysis | Async, ≤ 30s after SessionSaved |
| PDF generation | Async, ≤ 60s |
| File upload ≤ 10MB | ≤ 10s |
| Concurrent users per clinic | ≥ 50 |

---

## Data Lifecycle
- Patient records: indefinite (active) → 7 years post-cancellation
- Session data: indefinite → 7 years post-cancellation (anonymized)
- Audit logs: indefinite → 7 years (HIPAA minimum)
- Leads, Appointments, Invoices: indefinite → 2 years post-cancellation
- Shareable PDF links: same expiry as patient data; invalidated on GDPR erasure
- Import/Export: CSV + Excel; async queued; per-module + full org export (deferred)

---

## Out of Scope (this document)

- **Hairscope Care App** (patient-facing mobile/web): login, report viewing, treatment history — separate spec
- **Payment processing**: platform tracks invoice amounts only, no payment gateway
- **Subscription billing management**: plan status from external system, platform enforces gates only
- **Video/virtual consultations**: WebRTC signaling (noted as future protocol)
- **AI model specifications**: AI analysis models, recommendation engine logic — separate AI spec
