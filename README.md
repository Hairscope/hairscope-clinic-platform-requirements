# Hairscope Clinic Platform — Requirements Documentation

> Enterprise SaaS patient management platform for hair treatment clinics worldwide.

## 📖 View Requirements

| Module | Description | View |
|--------|-------------|------|
| **Master** | Platform overview, GDPR/HIPAA, multi-tenancy, auth, audit logging | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements) |
| **Patients** | Patient profiles, sessions, AI analysis, trichoscopy, reports | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements/patients) |
| **Staff** | Org/clinic hierarchy, roles, permissions, onboarding | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements/staff) |
| **Leads** | CRM, lead capture, webhooks, selfie analysis, conversion | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements/leads) |
| **Appointments** | Scheduling, calendar, services, working hours | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements/appointments) |
| **Products** | Product catalog, recommendations, prescriptions | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements/products) |
| **Billing** | Invoice generation, misc charges, PDF export, analytics | [Open](https://hairscope.github.io/hairscope-clinic-platform-requirements/requirements/billing) |

---

## 📂 Raw Markdown Files

- [`requirements.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements.md)
- [`requirements-patients.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements-patients.md)
- [`requirements-staff.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements-staff.md)
- [`requirements-leads.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements-leads.md)
- [`requirements-appointments.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements-appointments.md)
- [`requirements-products.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements-products.md)
- [`requirements-billing.md`](.kiro/specs/hairscope-clinic-platform/requirements/requirements-billing.md)

---

## Platform Overview

Hairscope Clinic Platform is an enterprise SaaS solution for hair treatment clinics globally. It supports single clinics and multi-clinic chains through an **Organization → Clinics → Staff** hierarchy.

### Modules

- **Patients Management** — Patient profiles, analysis sessions, AI-powered trichoscopy, and PDF report generation
- **Staff Management** — Staff lifecycle, roles, permissions, email invite onboarding, and audit logging
- **Leads Management CRM** — Lead capture (manual, webhook, selfie analysis), nurturing, and patient conversion
- **Appointments** — Scheduling, calendar view, service configuration, and embeddable booking widget
- **Products** — Per-clinic product catalog for session recommendations and prescription generation
- **Billing** — Per-session invoice generation, miscellaneous charges, PDF export, and analytics

### Compliance

- ✅ GDPR compliant
- ✅ HIPAA compliant
- ✅ Audit logging (7-year retention)
- ✅ Encryption at rest (AES-256) and in transit (TLS 1.2+)
