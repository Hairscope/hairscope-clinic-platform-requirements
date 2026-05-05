# Hairscope Clinic Platform — Project Overview

> Version 1.0.0 · Status: Final · April 2025

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

**Tech Stack (from docs):**
- API: **GraphQL** (all operations except file uploads and webhooks)
- File uploads: HTTP multipart
- Webhook ingestion: HTTP POST
- Real-time: GraphQL Subscriptions + WebRTC (video, future)
- All timestamps: UTC / ISO 8601
- All IDs: UUIDs v4 (server-generated)
- Auth: JWT (httpOnly cookies or secure in-memory — never localStorage)

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
| `org` | Organization_Admin | Staff mgmt + clinic details across all clinics. **No** clinical modules. |
| `clinic` | Clinic_Admin, Doctor, Receptionist, Nurse, Sales, Marketing, Frontdesk | Full/partial access within assigned Clinic only |
| `external` | Web component users | Appointment booking + selfie analysis via API key only |

**Key rules:**
- Deny by default; effective permissions = union of all assigned roles
- Organization_Admin can **never** access Patients, Appointments, Leads, Billing, or Products
- Each Organization must always have ≥ 1 active Org_Admin; each Clinic ≥ 1 active Clinic_Admin

---

## Core Modules

### 🔐 Identity & Access (IAM-1 to IAM-7)
- **Invite flow**: Admin sends invite → single-use link (7-day TTL) → invitee sets password → ACTIVE
- Staff statuses: `PENDING_REGISTRATION → ACTIVE ↔ INACTIVE`
- Staff email is immutable after invite
- Deletion requires reassignment of all responsibility-based records (Sessions, Leads, Appointments assignedTo fields)
- Staff record is never physically deleted (kept for audit attribution)
- Multi-device JWTs; deactivation immediately invalidates all tokens

### 🏢 Organization Management (ORG-1 to ORG-8)
- Self-registration: 3 required fields (org name, clinic name, clinic address) → creates 1 org + 1 clinic + 1 staff with both Org_Admin + Clinic_Admin roles
- Clinic Profile: name, address, timezone (IANA, required for appointments), working hours, logo, report header, T&Cs
- Inter-clinic staff transfers (within same org only)
- Clinic deactivation (org must always have ≥ 1 active clinic)
- Staff availability config (internal to Smart Scheduling; never exposed to patients)
- **Report Templates**: Org_Admin configures 2 template types (`SELFIE_ANALYSIS_REPORT`, `HAIR_ANALYSIS_REPORT`); all clinics in the org share the same template structure; only Report_Header (branding) is clinic-level customizable

### 📜 Audit & Compliance (AUD-1 to AUD-6)
- Immutable append-only audit log, retained ≥ 7 years (HIPAA)
- Full entity coverage: Staff, Roles, Clinic, Patient, Session, Lead, Appointment, Invoice, Report, Auth events, Plan changes, etc.
- GDPR: AES-256 at rest, TLS 1.2+ in transit, right-to-erasure (anonymizes PII, keeps clinical data)
- Consent records (type, granted/revoked, timestamp, staff actor)
- Plan gates enforced at permission layer (plan status from external system)

### 🗂️ Data Ownership (OWN-1 to OWN-4)
- **Attribution** (createdBy, authoredBy) — immutable, never changed
- **Responsibility** (assignedTo) — reassignable on staff deletion
- Reassignable records: Sessions (`assignedTo`), assigned Leads (`assignedTo`), Appointments (`assignedTo`)
- Patients, Medical Docs, Invoices, Audit Log — NOT reassignable (belong to clinic/patient/session)

### ⚖️ System Invariants (GI-1 to GI-33)
- 33 hard invariants covering identity, patient/session, data integrity, audit, and API/architecture rules
- Key ones: no cross-org/cross-clinic access, max 1 DRAFT session per patient per type, Saved/Completed sessions undeletable, audit log append-only, all API is GraphQL (exceptions: file upload, webhooks, video), cross-module via events only

---

## Feature Modules

### 🧑‍⚕️ Patients (PAT-1 to PAT-5)
- Required fields: `firstName`, `lastName`, `email`, `phone`, `genderAssignedAtBirth`
- Optional: `dateOfBirth` (auto-computes age), `age` (manual fallback), `externalPatientId`
- Per-clinic uniqueness on email + phone; cross-clinic duplicates allowed
- **`globalPatientId`**: UUID linking same physical person across all clinics/orgs (for Hairscope Care App only — not a cross-clinic access mechanism for staff)
- **Treatment Progress Graph**: plots `hairCount`, `thickness`, `coverage` across `COMPLETED` sessions only
- Medical Documents: JPEG/PNG/PDF, ≤ 10MB, requires title
- **GDPR Erasure**: Clinic_Admin only; anonymizes PII (name, email, phone, DOB); clinical data stays

### 🔬 Sessions (SES-1 to SES-HA-4)
- Sub-resource of Patients; cannot exist without a Patient
- Session statuses: `DRAFT → SAVED → COMPLETED`, `DRAFT → DELETED`
- One active DRAFT per patient per session type at a time
- **Session Types** (extensible): currently `HAIR_ANALYSIS`; future: `SKIN_TREATMENT`, `HAIR_REMOVAL`

**Hair Analysis specifics:**
- **Global Images**: 10 positions (ANTERIOR, FRONTAL, etc.); ≥ 1 FRONTAL required to save; 1 per position max
- **Trichoscopy Images**: ≥ 6 mandatory positions (P1 Frontal, P2 Left Temporal, P3 Right Temporal, P4 Top of Head, P5 Crown, P6 Occipital); each has `(x,y)` position on head diagram
- **AI Analysis** (async): triggered by `SessionSaved` event; produces per-image `hairCount`, `density`, `thickness`; overall hair loss stage for global images; notifies staff via in-app + push; 3 retries then `FAILED`
- **Annotation Editor**: Follicle tool (circle), Strand tool (3-point rectangle), Delete mode; brightness/contrast persisted per image; no undo/redo; AI vs HUMAN source tracked in backend but not visually differentiated
- **Questionnaire**: 5 categories × 5 active questions each (`DAILY_HABITS`, `MEDICAL_CONDITIONS`, `PHYSICAL_OR_EMOTIONAL_SHOCK`, `HAIRSTYLING_AND_TREATMENTS`, `GENETICS`) + `STRESS_TEST` (~10 Qs); auto-calculates `Root_Cause` + `Stress_O_Meter`
- **Report**: PDF auto-generated on `SessionCompleted`; includes images, AI results, questionnaire summary, doctor's note, product recommendations, prescription (if medical products); shareable via email + WhatsApp; Compare_View (same type, same position only)

### 📊 Leads (LM-1 to LM-13)
- **Lead Sources**: `MANUAL` | `WEBHOOK` | `SELFIE_ANALYSIS`
- **Lead Statuses**: `NEW → CONTACTED → QUALIFIED → CONVERTED` (via conversion process) | `LOST`
- **Lead Assignment Modes** (org-level, Org_Admin configures):
  - `AUTO_ASSIGN` (default): clinic determined from source; Lead_Distribution_Algorithm assigns staff immediately
  - `MANUAL_ASSIGN`: clinic shown as suggestion; Org Admin must confirm; lead is Unassigned until then
- **Lead_Distribution_Algorithm**: Round-Robin (pluggable service); Clinic_Admin is fallback if no eligible staff; lead creation from API sources never rejected due to staff availability
- **Unassigned Leads** (`clinicId = null`): visible to Org_Admin only; never to clinic staff
- **Selfie Analysis Web Component** (Stencil): uses Org API key; multi-clinic org requires visitor to select clinic; generates `Selfie_Analysis_Report` (may be null if image failed; lead still created)
- **Webhook ingestion**: Org_Admin configures `Webhook_Source` + `Field_Mapping`; HTTP POST; versioned field mappings
- **CRM actions**: Log interactions (WHATSAPP, EMAIL, PHONE_CALL, IN_PERSON_MEETING, etc.) with optional status change
- **Conversion**: `convertLeadToPatient` mutation; auto-populates patient fields; checks duplicate email/phone in clinic; emits `LeadConverted`; Lead_Actions remain linked (not copied)

### 📅 Appointments (APT-1 to APT-9)
- **Services**: name, description, image, price, currency, duration, `qualifiedStaff[]` (internal only, never exposed to patients)
- **Slot availability**: derived from `Clinic_Working_Hours` only (staff availability is internal to Smart Scheduling)
- Timezone required before any booking (`CLINIC_TIMEZONE_NOT_SET` otherwise)
- **Booking**: Staff or via `Appointment_Web_Component` (Stencil, clinic API key); email confirmation sent
- **Statuses**: `SCHEDULED → CONFIRMED → COMPLETED/CANCELLED/NO_SHOW`; `SCHEDULED → CANCELLED/NO_SHOW`
- **Smart Scheduling Engine** (pluggable): Priority 1 = continuity of care (same doctor for return patient), 2 = least busy qualified staff, 3 = any available qualified staff, 4 = no assignment (flags for manual)
- `assignedStaffId` never exposed to patients
- Calendar View: day/week/month modes; real-time via `appointmentStatusChanged` subscription
- Rescheduling + cancellation allowed by staff or patient (via web component) for SCHEDULED/CONFIRMED

### 💊 Products (PRD-1 to PRD-4)
- Per-clinic catalog; types: `COSMETIC` (no Rx) | `MEDICAL` (triggers Prescription in report)
- Fields: name, description, image, price, currency, purchaseLink (optional), productType
- Session recommendations: 1+ products + optional Routine (usage schedule) per product
- Editing recommendations on COMPLETED sessions triggers report regeneration
- `Stress_O_Meter` threshold → auto-suggests stress-related products
- Platform never processes purchases (purchaseLink directs externally)

### 🧾 Billing (BIL-1 to BIL-6+)
- Auto-generated Draft Invoice on `AppointmentCompleted` event
- Invoice components: Service line item + Product line items + `Misc_Charges` + `Discounts` (fixed or %) + Tax (clinic-configurable rate)
- Formula: `Total = (Subtotal - DiscountAmount) × (1 + TaxRate)`; clamped to 0 if negative
- Invoice numbers: sequential integers scoped per clinic (never global UUIDs)
- `DRAFT → FINALIZED` (locked, immutable); `FINALIZED → REFUNDED / PARTIALLY_REFUNDED`
- PDF export server-generated; no payment processing within platform
- Billing analytics: Org_Admin / Clinic_Admin; date-range filtered; based on finalized invoice totals only

---

## Shared Infrastructure

### API Contracts
- GraphQL (Relay cursor-based pagination for all lists > 20 records)
- Error format: `{ code, field?, traceId }` on all errors
- Async polling: `asyncOperationStatus` query
- File upload: HTTP multipart (images/PDFs ≤ 10MB)
- Webhook: HTTP POST with API key auth
- Subscriptions: `aiAnalysisCompleted`, `appointmentStatusChanged`
- Schema versioning: `X-Schema-Version` header; deprecated fields kept ≥ 2 release cycles

### Enums (canonical values)
- Staff Status: `PENDING_REGISTRATION | ACTIVE | INACTIVE`
- Session Type: `HAIR_ANALYSIS | SKIN_TREATMENT | HAIR_REMOVAL | SCALP_TREATMENT | LASER_TREATMENT | CONSULTATION`
- Session Status: `DRAFT | SAVED | COMPLETED | DELETED`
- Lead Status: `NEW | CONTACTED | QUALIFIED | CONVERTED | LOST`
- Lead Source: `MANUAL | WEBHOOK | SELFIE_ANALYSIS`
- Lead Priority: `LOW | MEDIUM | HIGH | URGENT`
- Appointment Status: `SCHEDULED | CONFIRMED | COMPLETED | CANCELLED | NO_SHOW`
- Product Type: `COSMETIC | MEDICAL`
- Invoice Status: `DRAFT | FINALIZED | REFUNDED | PARTIALLY_REFUNDED`
- Trichoscopy Position: `P1–P6` (6 mandatory) + additional optional
- Global Image Position: 10 values (FRONTAL, ANTERIOR, etc.)
- Questionnaire Category: `DAILY_HABITS | MEDICAL_CONDITIONS | PHYSICAL_OR_EMOTIONAL_SHOCK | HAIRSTYLING_AND_TREATMENTS | GENETICS | STRESS_TEST`
- Annotation Source: `AI | HUMAN`
- Head Diagram: `FRONT | LEFT | RIGHT | BACK`

### Domain Events (event bus)
| Event | Emitted By | Consumed By |
|-------|-----------|-------------|
| `SessionSaved` | Sessions | AI Analysis Service |
| `SessionCompleted` | Sessions | Report Module, Billing |
| `SessionDeleted` | Sessions | — |
| `AnnotationEditSaved` | Sessions | Report Module |
| `AIAnalysisCompleted` | AI Service | Sessions |
| `AIAnalysisFailed` | AI Service | Sessions |
| `LeadCreated` | Leads | — |
| `LeadConverted` | Leads | Patients |
| `AppointmentBooked` | Appointments | — |
| `AppointmentRescheduled` | Appointments | — |
| `AppointmentCancelled` | Appointments | — |
| `AppointmentCompleted` | Appointments | Billing |
| `InvoiceGenerated` | Billing | — |
| `InvoiceFinalized` | Billing | Analytics |
| `InvoiceRefunded` | Billing | Analytics |

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

## Design System

- **Font**: Open Sans (400, 600)
- **Primary palette**: `#19878e` (light), `#184f54` (primary), `#064348` (dark), `#0b2327` (secondary)
- **Hair Score colors**: Green `#87ff5b` (Healthy 75–100%), Yellow `#ffcf20` (Moderate 50–74%), Orange `#ff9320` (Concerning 25–49%), Red `#ea3700` (Critical 0–24%)
- **Skin/hair tones**: 5 clinical reference colors
- **Border radius**: 15px on cards; 10px on inputs; 9999px on badges
- **Cards**: glassmorphism (`rgba(255,255,255,0.1)` + `backdrop-filter: blur(10px)`)
- **Dark background**: `linear-gradient(180deg, #064348, #043237)`
- **Navigation**: icon-based sidebar (100px wide, dark `#0b2327`)
- **Report gradient**: `linear-gradient(180deg, #f7d8c4, #67b5d6)` (skin-tone header)

---

## Out of Scope (this document)

- **Hairscope Care App** (patient-facing mobile/web): login, report viewing, treatment history — separate spec
- **Payment processing**: platform tracks invoice amounts only, no payment gateway
- **Subscription billing management**: plan status from external system, platform enforces gates only
- **Video/virtual consultations**: WebRTC signaling (noted as future protocol)
