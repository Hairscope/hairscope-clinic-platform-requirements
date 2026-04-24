# Hairscope Clinic Platform — Requirements Documentation

> Enterprise SaaS patient management platform for hair treatment clinics worldwide.
> API: GraphQL | Compliance: GDPR + HIPAA | Architecture: Event-driven, multi-tenant

🌐 **[View on GitHub Pages](https://hairscope.github.io/hairscope-clinic-platform-requirements/)**

---

## 📖 Requirements

### Master
| Document | View |
|----------|------|
| Master Requirements — system principles, global invariants, identity model, permission engine, time handling, API standard, audit, error handling, data lifecycle, performance, versioning | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements) |

### Core
| Document | View |
|----------|------|
| Identity & Access — staff lifecycle, invite flow, authentication, roles, permissions | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/identity-access) |
| Organization Management — hierarchy, self-registration, clinic profile, transfers, dashboards | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/organization) |
| Audit & Compliance — audit logging, GDPR, HIPAA, consent management | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/audit-compliance) |
| Data Ownership — attribution vs responsibility, ownership table, reassignment rules | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/data-ownership) |
| System Invariants — non-negotiable rules (GI-1 to GI-33) | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/core/system-invariants) |

### Modules
| Document | View |
|----------|------|
| Patients — profile, global identity (Hairscope Care App), progress graph, medical docs, GDPR erasure | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/patients) |
| Sessions — lifecycle, session types, AI analysis, annotation editing, questionnaire, reports | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/sessions) |
| Leads — assignment mode (AUTO/MANUAL), webhook, selfie analysis, distribution algorithm, CRM | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/leads) |
| Appointments — services, working hours, booking, smart scheduling engine | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/appointments) |
| Products — catalog, recommendations, prescriptions | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/products) |
| Billing — invoice generation, misc charges, PDF export, analytics | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/modules/billing) |

### Shared
| Document | View |
|----------|------|
| Enums — canonical enum values for all modules | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/enums) |
| Error Codes — full GraphQL error code registry | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/error-codes) |
| API Contracts — GraphQL conventions, pagination, subscriptions, file upload, webhooks | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/api-contracts) |
| Event Definitions — domain event registry for cross-module communication | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/shared/event-definitions) |

---

## Platform Overview

Hairscope Clinic Platform is an enterprise SaaS solution for hair treatment clinics globally. It supports single clinics and multi-clinic chains through an **Organization → Clinics → Staff** hierarchy.

### Modules
- **Patients** — Patient profiles, global identity, treatment progress, medical documents
- **Sessions** — Clinical sessions (Hair Analysis + future types), AI analysis, reports
- **Organization Management** — Org/clinic hierarchy, staff lifecycle, roles, permissions, dashboards
- **Leads Management** — Lead capture (manual, webhook, selfie analysis), CRM, patient conversion
- **Appointments** — Scheduling, smart scheduling engine, calendar, virtual consultations
- **Products** — Per-clinic product catalog, recommendations, prescription generation
- **Billing** — Per-session invoice generation, PDF export, analytics

### Compliance
- ✅ GDPR compliant (right to erasure, consent management, data export)
- ✅ HIPAA compliant (audit logging, 7-year retention, PHI protection)
- ✅ Audit logging — append-only, 7-year minimum retention
- ✅ Encryption at rest (AES-256) and in transit (TLS 1.2+)

### Architecture
- ✅ GraphQL API (queries, mutations, subscriptions)
- ✅ Event-driven — modules communicate via domain events only
- ✅ Multi-tenant — strict Organization-level data isolation
- ✅ UTC timestamps throughout
- ✅ Pluggable algorithms — Smart Scheduling, Lead Distribution
