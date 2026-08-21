# Implementation Documents

> Scope: NestJS backend implementation specifications for the Hairscope Clinic Platform. Covers tech stack, architecture patterns, infrastructure services, deployment, and module-level implementation details.

---

## Platform Infrastructure

| # | Document | Covers |
|---|----------|--------|
| 01 | [Tech Stack](./01-tech-stack.md) | Runtime, dependencies, monorepo structure |
| 02 | [Project Setup](./02-project-setup.md) | Workspace configuration, scripts, tooling |
| 03 | [Module Structure](./03-module-structure.md) | NestJS module patterns, layering, conventions |
| 04 | [Database](./04-database.md) | MongoDB, Mongoose schemas, transactions, indexing |
| 05 | [Authentication](./05-authentication.md) | JWT, argon2, AuthSession, token rotation |
| 06 | [Authorization](./06-authorization.md) | Access Resolution Engine, permission guards |
| 07 | [GraphQL](./07-graphql.md) | Apollo Server, code-first schema, pagination |
| 08 | [Event System](./08-event-system.md) | Transactional Outbox, Redis Streams, idempotency |
| 09 | [Worker Services](./09-worker-services.md) | Reminder, Notification, Report Generation, AI |
| 10 | [File Storage](./10-file-storage.md) | GCS integration, signed URLs, tenant isolation |
| 11 | [PDF Generation](./11-pdf-generation.md) | Typst self-hosted, templates, document types |
| 12 | [Email](./12-email.md) | SMTP2Go, Nodemailer, Handlebars templates |
| 13 | [Push Notifications](./13-push-notifications.md) | FCM, device tokens, delivery |
| 14 | [Testing](./14-testing.md) | Jest, Playwright, factories, CI integration |
| 15 | [Deployment](./15-deployment.md) | Docker, GitHub Actions, GCP Compute Engine |
| 16 | [Environment Config](./16-environment-config.md) | ConfigModule, validation, secrets |

---

## Cross-cutting Implementation Checklists

| # | Document | Covers |
|---|----------|--------|
| 20 | [Recommendations & Treatment Plan Checklist](./20-recommendations-treatment-plan-checklist.md) | Recommendation Engine, treatment documents, signatures, PDFs, frontend flow, and release gates |
| 21 | [Recommendation and Treatment Plan Reference](./21-recommendation-treatment-plan-reference.md) | Current CatalogItem, ProtocolTemplate, TreatmentPlan, routine, document, and future engine behavior |

---

## Module Implementations

| # | Module | Covers |
|---|--------|--------|
| 01 | [IAM](./modules/01-iam.md) | Staff lifecycle, invites, roles, password policy |
| 02 | [Organization](./modules/02-organization.md) | Org/Clinic hierarchy, profiles, visibility mode |
| 03 | [Patients](./modules/03-patients.md) | Patient CRUD, global identity, GDPR erasure |
| 04 | [Sessions](./modules/04-sessions.md) | Session lifecycle, treatment plans, signatures |
| 05 | [Leads](./modules/05-leads.md) | Lead lifecycle, distribution, conversion |
| 06 | [Appointments](./modules/06-appointments.md) | Booking, slot availability, smart scheduling |
| 07 | [Catalog](./modules/07-catalog.md) | Items, treatment kits, routines |
| 08 | [Billing](./modules/08-billing.md) | Invoices, payments, auto-sync |
| 09 | [Communication Policy](./modules/09-communication-policy.md) | Reminder rules, channels, templates |
| 10 | [Audit](./modules/10-audit.md) | Append-only log, immutable attribution |

---

## Architecture Summary

```text
Modular Monolith Core (single deployable)
├── Modules:
│   ├── IAM
│   ├── Organization
│   ├── Audit
│   ├── Patients
│   ├── Sessions
│   ├── Appointments
│   ├── Leads
│   ├── Catalog
│   ├── Billing
│   └── Communication Policy
│
├── Engines (stateless, deterministic):
│   ├── Access Resolution Engine
│   ├── Entitlement Engine
│   ├── Lead Distribution Engine
│   ├── Smart Scheduling Engine
│   └── Recommendation Engine
│
└── Platform Infrastructure:
    ├── Transactional Outbox
    ├── Event Bus (Redis Streams)
    ├── File Storage (GCS)
    └── GraphQL API Layer

Separate Worker Services (stateful async)
├── Reminder Service
├── Notification Service
├── AI Models
└── Report Generation Service
```

---
