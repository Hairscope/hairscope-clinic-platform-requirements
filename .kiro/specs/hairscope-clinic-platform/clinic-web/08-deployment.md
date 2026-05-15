# Clinic Web App — Deployment

> Covers: Docker containerization, CI/CD, and environment strategy.

---

# 1. Dockerfile

```dockerfile
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun:1-slim AS production

WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["bun", "run", "server.js"]
```

---

# 2. Next.js Output Configuration

```typescript
// next.config.ts
const nextConfig = {
  output: 'standalone',
};
```

The `standalone` output mode creates a minimal production build that includes only the necessary files.

---

# 3. Environment Strategy

| Environment | URL | Backend API |
|-------------|-----|-------------|
| Development | localhost:3000 | localhost:4000 |
| Staging | staging.app.hairscope.ai | staging.api.hairscope.ai |
| Production | app.hairscope.ai | api.hairscope.ai |

---

# 4. CI/CD

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [dev, staging, main]
  pull_request:
    branches: [dev]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run test

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run build
```

---

# 5. Branch Strategy

Same as backend:

| Branch | Environment |
|--------|-------------|
| `main` | Production |
| `staging` | Staging |
| `dev` | Development |

Feature branches merge into `dev` → `staging` → `main`.

---
