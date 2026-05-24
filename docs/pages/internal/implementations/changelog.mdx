# Implementation Documents — Changelog

All notable changes to the Hairscope Clinic Platform implementation documents are documented here. Latest entries are at the top.

---

## v1.2.1 — 2026-05-24

### Changed
- **Tasks moved out** — Backend and frontend task lists moved from `implementations/` to new top-level `tasks/` directory (`tasks/backend/tasks.md`, `tasks/frontend/tasks.md`)
- **Added** frontend IAM module Kiro spec tasks (`tasks/frontend/iam-module-tasks.md`)
- **Removed** `tasks.md` and `frontend-tasks.md` from implementations (now in `tasks/`)

---

## v1.2.0 — 2026-05-18

### Added
- **API Workflow** (`17-api-workflow.md`): Complete frontend API consumption map — 29 queries + 54 mutations = 83 APIs organized by user journey phases (unauthenticated → dashboard → core workflows → settings → session)
- **Collection Schemas** (`18-collection-schemas.md`): Full MongoDB schema definitions for all 21 collections across 9 modules + infrastructure, including field types, indexes, constraints, and embedded sub-documents

---

## v1.1.5 — 2026-05-16

### Added
- Implementation Tasks page listing all executed tasks across all 9 backend modules
- Complete task breakdown with subtasks for: Infrastructure, Auth & IAM, Organization, Patients, Sessions, Leads, Appointments, Catalog, Billing

---

## v1.1.3 — 2026-05-14

### Fixed
- Appointments: Slot availability checks clinic open hours + at least one qualified staff available (staff-level)
- Appointments: Rescheduling cancels original and creates new appointment linked through `rescheduledFrom`
- Billing: Invoice created atomically on TreatmentPlanSigned (not SessionCompleted)
- Sessions: AI analysis provides clinical findings only (no recommendations); Recommendation Engine generates treatment plans
- Sessions: Treatment plan routines are per-line-item, not plan-level
- Communication Policy: Workers use internal GraphQL client to query main API, preserving module encapsulation
- Audit: entityId passed explicitly in metadata, not inferred from key order

---

## v1.1.2 — 2026-05-14

### Fixed
- GraphQL: File uploads via GraphQL mutation (graphql-upload), not HTTP controller
- File Storage: Upload flow uses stream from GraphQL Upload scalar
- File downloads remain as HTTP signed URLs

---

## v1.1.1 — 2026-05-14

### Fixed
- Database: Added `updatedBy` and `status` to base schema fields
- Database: Patient email/phone uniqueness enforced at application level, not database unique index
- Database: Added base repository pattern that module repositories extend
- Database: Added backup strategy (MongoDB Atlas PITR) and rollback strategy sections
- Database: Application rollback via fresh build from git (no old image retention)
- Authentication: Clarified refresh token rotation detection mechanism (hash mismatch, not stored old tokens)
- Authentication: Added `usedBy` field to PasswordResetTokenSchema
- Deployment: Rollback via fresh build from git commit, removed image retention
- Nextra: Enabled copy button on code blocks

---

## v1.1.0 — 2026-05-14

### Changed
- Runtime versions updated: Node.js 24 LTS (fallback), TypeScript 6.x, NestJS 11.x, pnpm 11.x (fallback)
- Added Zod for runtime schema validation
- MongoDB infrastructure updated to MongoDB Atlas (managed)
- All dependencies use exact versions (removed caret range exception for dev dependencies)

---

## v1.0.0 — 2026-05-14

### Initial Release
- 16 platform infrastructure documents covering tech stack through environment configuration
- 10 module implementation documents (IAM, Organization, Patients, Sessions, Leads, Appointments, Catalog, Billing, Communication Policy, Audit)
- Architecture aligned with designs v1.0.0 and requirements v1.1.1

### Key Implementation Decisions
- TypeScript + NestJS modular monolith with Bun workspaces
- Bun runtime (Node.js 24 LTS fallback)
- MongoDB + Mongoose with replica set for transactions
- Redis for caching, BullMQ job queues, and event streaming
- Transactional Outbox + Redis Streams for event-driven architecture
- Separate Worker Services: Reminder, Notification, Report Generation, AI Models
- Typst self-hosted for PDF generation (reports, treatment plans, prescriptions, invoices)
- SMTP2Go for email, Firebase Cloud Messaging for push notifications
- GCP Compute Engine deployment with Docker containers
- Jest unit/integration tests + Playwright E2E tests

---
