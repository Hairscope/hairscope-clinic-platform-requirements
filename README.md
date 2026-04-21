# Hairscope Clinic Platform — Requirements Documentation

> Enterprise SaaS patient management platform for hair treatment clinics worldwide.
> API: GraphQL | Compliance: GDPR + HIPAA | Architecture: Event-driven, multi-tenant

---

## 📖 View Requirements (GitHub Pages)

### Master
| Document | Description | View |
|----------|-------------|------|
| **Master Requirements** | System principles, global invariants, identity model, permission engine, time handling, ID strategy, audit, error handling, performance, versioning | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements) |

### Core
| Document | Description | View |
|----------|-------------|------|
| **Identity & Access** | Staff lifecycle, authentication, roles, permissions, invitations, multi-device sessions | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/identity-access) |
| **Organization** | Org/clinic hierarchy, self-registration, clinic profile, inter-clinic transfers, dashboard | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/organization) |
| **Audit & Compliance** | Audit logging, GDPR, HIPAA, data retention, consent management | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/audit-compliance) |
| **Data Ownership** | Record ownership, transferable records, deletion policies | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/data-ownership) |
| **System Invariants** | Non-negotiable rules enforced across the entire platform | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/system-invariants) |

### Modules
| Document | Description | View |
|----------|-------------|------|
| **Patients** | Patient profiles, sessions, AI analysis, trichoscopy, reports | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/patients) |
| **Leads** | CRM, lead capture, webhooks, selfie analysis, conversion | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/leads) |
| **Appointments** | Scheduling, calendar, services, working hours | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/appointments) |
| **Products** | Product catalog, recommendations, prescriptions | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/products) |
| **Billing** | Invoice generation, misc charges, PDF export, analytics | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/billing) |

### Shared
| Document | Description | View |
|----------|-------------|------|
| **Enums** | All canonical enum values used across the platform | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/enums) |
| **Error Codes** | Full error code registry for all GraphQL responses | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/error-codes) |
| **API Contracts** | GraphQL conventions, pagination, subscriptions, file upload, webhooks | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/api-contracts) |
| **Event Definitions** | Domain event registry for cross-module communication | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/event-definitions) |

---

## Platform Overview

Hairscope Clinic Platform is an enterprise SaaS solution for hair treatment clinics globally. It supports single clinics and multi-clinic chains through an **Organization → Clinics → Staff** hierarchy.

### Modules
- **Patients Management** — Patient profiles, analysis sessions, AI-powered trichoscopy, and PDF report generation
- **Organization Management** — Org/clinic hierarchy, staff lifecycle, roles, permissions, inter-clinic transfers, dashboards
- **Leads Management CRM** — Lead capture (manual, webhook, selfie analysis), nurturing, and patient conversion
- **Appointments** — Scheduling, calendar view, service configuration, and embeddable booking widget
- **Products** — Per-clinic product catalog for session recommendations and prescription generation
- **Billing** — Per-session invoice generation, miscellaneous charges, PDF export, and analytics

### Compliance
- ✅ GDPR compliant
- ✅ HIPAA compliant
- ✅ Audit logging (7-year retention, append-only)
- ✅ Encryption at rest (AES-256) and in transit (TLS 1.2+)

### Architecture
- ✅ GraphQL API (queries, mutations, subscriptions)
- ✅ Event-driven — modules communicate via domain events only
- ✅ Multi-tenant — strict Organization-level data isolation
- ✅ UTC timestamps throughout
