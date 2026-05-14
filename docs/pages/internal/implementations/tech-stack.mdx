# Tech Stack

> Covers: Technology choices, versions, runtime environment, and dependency management.

---

# 1. Runtime

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Bun (primary), Node.js (fallback) | Bun 1.x, Node.js 24 LTS |
| Language | TypeScript | 6.x (strict mode) |
| Framework | NestJS | 11.x |
| Package Manager | Bun (primary), pnpm (fallback) | Bun 1.x, pnpm 11.x |

Bun SHALL be the primary runtime AND package manager for development and production.

Bun workspaces SHALL be used for monorepo package management.

IF Bun compatibility issues arise with any dependency, Node.js 24 LTS SHALL be used as runtime fallback and pnpm as package manager fallback without code changes.

TypeScript SHALL be configured in strict mode across all packages.

---

# 2. Core Dependencies

| Concern | Package | Purpose |
|---------|---------|---------|
| GraphQL | `@nestjs/graphql` + `@apollo/server` | API layer |
| Database | `@nestjs/mongoose` + `mongoose` | MongoDB ODM |
| Cache | `@nestjs/cache-manager` + `cache-manager-redis-yet` | Redis cache |
| Validation | `class-validator` + `class-transformer` + `zod` | Input validation |
| Auth | `jsonwebtoken` + `argon2` | JWT + password hashing |
| Events | `@nestjs/event-emitter` | In-process domain events |
| Queue | `@nestjs/bullmq` + `bullmq` | Job queues for workers |
| Config | `@nestjs/config` | Environment configuration |
| Storage | `@google-cloud/storage` | GCS file uploads |
| Email | `nodemailer` | SMTP2Go integration |
| Push | `firebase-admin` | FCM push notifications |
| PDF | Typst CLI (self-hosted binary) | PDF generation |

---

# 3. Development Dependencies

| Concern | Package | Purpose |
|---------|---------|---------|
| Testing (E2E) | `playwright` | End-to-end API testing |
| Testing (Unit) | `jest` + `@nestjs/testing` | Unit and integration tests |
| Linting | `eslint` + `@typescript-eslint` | Code quality |
| Formatting | `prettier` | Code formatting |
| API Testing | `supertest` | HTTP assertion library |

---

# 4. Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | MongoDB LTS (MongoDB Atlas) | Primary persistence (managed) |
| Cache/Queue | Redis 7.x | Caching, BullMQ job queue, event streaming |
| Object Storage | Google Cloud Storage | Files, images, PDFs |
| Container | Docker | Deployment packaging |
| CI/CD | GitHub Actions | Build, test, deploy pipeline |
| Server | GCP Compute Engine | Production hosting |

---

# 5. Monorepo Structure

The project SHALL use Bun workspaces:

```
hairscope-backend/
├── bunfig.toml
├── package.json (root, workspaces defined here)
├── bun.lock
├── packages/
│   ├── api/              → Main NestJS application (modular monolith)
│   ├── worker-reminder/  → Reminder Service worker
│   ├── worker-notification/ → Notification Service worker
│   ├── worker-report/    → Report Generation worker
│   └── shared/           → Shared types, contracts, utilities
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.worker-reminder
│   ├── Dockerfile.worker-notification
│   ├── Dockerfile.worker-report
│   └── docker-compose.yml
├── typst/
│   └── templates/        → Typst PDF templates
├── tests/
│   └── e2e/              → Playwright E2E tests
└── .github/
    └── workflows/        → CI/CD pipelines
```

Workspace configuration in root `package.json`:

```json
{
  "workspaces": [
    "packages/*"
  ]
}
```

---

# 6. Version Constraints

All dependencies SHALL use exact versions (no ranges).

Dependency updates SHALL be reviewed and tested before merging.

---
