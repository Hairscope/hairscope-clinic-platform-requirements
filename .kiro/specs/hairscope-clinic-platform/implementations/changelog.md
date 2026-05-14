# Implementation Documents — Changelog

All notable changes to the Hairscope Clinic Platform implementation documents are documented here. Latest entries are at the top.

---

## v1.1.0 — 2026-05-14

### Changed
- Package manager switched from pnpm to Bun (Bun is now primary runtime AND package manager)
- Monorepo uses Bun workspaces via `package.json` (no `pnpm-workspace.yaml`)
- Dockerfiles updated to use `bun install --frozen-lockfile`
- CI pipelines updated to use `oven-sh/setup-bun@v2`
- pnpm retained as fallback only

---

## v1.0.0 — 2026-05-14

### Initial Release
- 16 platform infrastructure documents covering tech stack through environment configuration
- 10 module implementation documents (IAM, Organization, Patients, Sessions, Leads, Appointments, Catalog, Billing, Communication Policy, Audit)
- Architecture aligned with designs v1.0.0 and requirements v1.1.1

### Key Implementation Decisions
- TypeScript + NestJS modular monolith with Bun workspaces
- Bun runtime (Node.js 20 LTS fallback)
- MongoDB + Mongoose with replica set for transactions
- Redis for caching, BullMQ job queues, and event streaming
- Transactional Outbox + Redis Streams for event-driven architecture
- Separate Worker Services: Reminder, Notification, Report Generation, AI Models
- Typst self-hosted for PDF generation (reports, treatment plans, prescriptions, invoices)
- SMTP2Go for email, Firebase Cloud Messaging for push notifications
- GCP Compute Engine deployment with Docker containers
- Jest unit/integration tests + Playwright E2E tests

---
