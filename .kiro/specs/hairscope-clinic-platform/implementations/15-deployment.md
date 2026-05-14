# Deployment

> Covers: Docker containerization, GitHub Actions CI/CD, GCP Compute Engine deployment, environment promotion, health checks, and rollback strategy.

---

# 1. Docker

## 1.1 API Dockerfile

```dockerfile
# docker/Dockerfile.api
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock ./
COPY packages/api/package.json packages/api/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY packages/api/ packages/api/
RUN bun run --filter=shared build
RUN bun run --filter=api build

# Production image
FROM oven/bun:1-slim AS production

WORKDIR /app
COPY --from=builder /app/packages/api/dist ./dist
COPY --from=builder /app/packages/api/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./shared

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["bun", "run", "dist/main.js"]
```

## 1.2 Worker Dockerfiles

Each worker SHALL have its own Dockerfile following the same pattern:

```dockerfile
# docker/Dockerfile.worker-reminder
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock ./
COPY packages/worker-reminder/package.json packages/worker-reminder/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY packages/worker-reminder/ packages/worker-reminder/
RUN bun run --filter=shared build
RUN bun run --filter=worker-reminder build

FROM oven/bun:1-slim AS production

WORKDIR /app
COPY --from=builder /app/packages/worker-reminder/dist ./dist
COPY --from=builder /app/packages/worker-reminder/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./shared

EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["bun", "run", "dist/main.js"]
```

## 1.3 Report Worker (with Typst)

```dockerfile
# docker/Dockerfile.worker-report
FROM oven/bun:1 AS builder

WORKDIR /app
COPY package.json bun.lock ./
COPY packages/worker-report/package.json packages/worker-report/
COPY packages/shared/package.json packages/shared/
RUN bun install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY packages/worker-report/ packages/worker-report/
RUN bun run --filter=shared build
RUN bun run --filter=worker-report build

FROM oven/bun:1-slim AS production

# Install Typst
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://typst.community/typst-install/install.sh | sh && \
    apt-get remove -y curl && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app
COPY --from=builder /app/packages/worker-report/dist ./dist
COPY --from=builder /app/packages/worker-report/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./shared
COPY typst/templates ./typst/templates
COPY typst/fonts ./typst/fonts
COPY typst/assets ./typst/assets

EXPOSE 3004
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3004/health || exit 1

CMD ["bun", "run", "dist/main.js"]
```

## 1.4 Docker Compose (Development)

```yaml
# docker/docker-compose.yml
services:
  mongodb:
    image: mongo:8
    command: ["--replSet", "rs0", "--bind_ip_all"]
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    healthcheck:
      test: echo "try { rs.status() } catch (err) { rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]}) }" | mongosh --quiet
      interval: 5s
      timeout: 10s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build:
      context: ..
      dockerfile: docker/Dockerfile.api
    ports:
      - "3000:3000"
    env_file: ../.env.local
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker-reminder:
    build:
      context: ..
      dockerfile: docker/Dockerfile.worker-reminder
    env_file: ../.env.local
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker-notification:
    build:
      context: ..
      dockerfile: docker/Dockerfile.worker-notification
    env_file: ../.env.local
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

  worker-report:
    build:
      context: ..
      dockerfile: docker/Dockerfile.worker-report
    env_file: ../.env.local
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy

volumes:
  mongodb_data:
  redis_data:
```

---

# 2. Node.js Fallback

If Bun compatibility issues arise, Dockerfiles SHALL swap the base image and package manager:

```dockerfile
# Replace: FROM oven/bun:1 AS builder
# With:    FROM node:24 AS builder

# Replace: RUN bun install --frozen-lockfile
# With:    RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Replace: FROM oven/bun:1-slim AS production
# With:    FROM node:24-slim AS production

# Replace: CMD ["bun", "run", "dist/main.js"]
# With:    CMD ["node", "dist/main.js"]
```

No application code changes are required for the fallback.

---

# 3. GitHub Actions CI/CD

## 3.1 Build and Test

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

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
    services:
      mongodb:
        image: mongo:8
        ports: ['27017:27017']
        options: --health-cmd "mongosh --eval 'db.runCommand({ping:1})'" --health-interval 10s
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: --health-cmd "redis-cli ping" --health-interval 10s
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run test:ci
        env:
          MONGODB_URI: mongodb://localhost:27017/hairscope-test?replicaSet=rs0
          REDIS_URL: redis://localhost:6379

  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: gcr.io
          username: _json_key
          password: ${{ secrets.GCP_SA_KEY }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile.api
          push: ${{ github.ref == 'refs/heads/main' }}
          tags: gcr.io/${{ secrets.GCP_PROJECT }}/hairscope-api:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## 3.2 Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Authenticate to GCP
        uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Deploy to GCE
        run: |
          gcloud compute ssh hairscope-server --zone=${{ secrets.GCP_ZONE }} --command="
            cd /opt/hairscope &&
            docker compose pull &&
            docker compose up -d --remove-orphans &&
            docker system prune -f
          "
```

---

# 4. GCP Compute Engine

## 4.1 Server Setup

| Resource | Specification |
|----------|--------------|
| Machine Type | e2-standard-2 (2 vCPU, 8 GB RAM) |
| OS | Ubuntu 22.04 LTS |
| Disk | 50 GB SSD |
| Region | Based on clinic locations |
| Firewall | HTTP (80), HTTPS (443), SSH (22) |

## 4.2 Production Docker Compose

```yaml
# /opt/hairscope/docker-compose.yml (on GCE instance)
services:
  api:
    image: gcr.io/${GCP_PROJECT}/hairscope-api:${IMAGE_TAG}
    ports:
      - "3000:3000"
    env_file: .env.production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 2G

  worker-reminder:
    image: gcr.io/${GCP_PROJECT}/hairscope-worker-reminder:${IMAGE_TAG}
    env_file: .env.production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M

  worker-notification:
    image: gcr.io/${GCP_PROJECT}/hairscope-worker-notification:${IMAGE_TAG}
    env_file: .env.production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M

  worker-report:
    image: gcr.io/${GCP_PROJECT}/hairscope-worker-report:${IMAGE_TAG}
    env_file: .env.production
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
```

MongoDB and Redis SHALL be managed services (MongoDB Atlas, Redis Cloud) in production.

---

# 5. Health Checks

## 5.1 API Health Endpoint

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: MongooseHealthIndicator,
    private readonly redis: RedisHealthIndicator,
    private readonly email: EmailHealthIndicator,
    private readonly eventSystem: EventSystemHealthIndicator,
  ) {}

  @Get()
  @Public()
  async check() {
    return this.health.check([
      () => this.db.pingCheck('mongodb'),
      () => this.redis.pingCheck('redis'),
      () => this.email.isHealthy(),
      () => this.eventSystem.isHealthy(),
    ]);
  }

  @Get('ready')
  @Public()
  async readiness() {
    return this.health.check([
      () => this.db.pingCheck('mongodb'),
      () => this.redis.pingCheck('redis'),
    ]);
  }
}
```

## 5.2 Worker Health Endpoints

Each worker SHALL expose a `/health` endpoint:

```typescript
@Controller('health')
export class WorkerHealthController {
  @Get()
  async check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

---

# 6. Rollback Strategy

## 6.1 Rollback Procedure

Any previous version can be redeployed with a fresh build from the corresponding Git commit. Old Docker images are not retained.

```bash
# Rollback: trigger a fresh build and deploy from the target commit
# Option 1: Revert commit and push to main
git revert <bad-commit-sha>
git push origin main

# Option 2: Manually trigger CI workflow on a specific SHA
gh workflow run ci.yml --ref <target-sha>
```

## 6.2 Database Migrations

Migrations SHALL be forward-compatible.

Rollback SHALL NOT require database schema reversal.

New fields SHALL be nullable or have defaults to support running old code against new schema.

---

# 7. Environment Promotion

```text
develop → staging → production
```

| Environment | Trigger | Approval |
|-------------|---------|----------|
| Staging | Push to `develop` | Automatic |
| Production | Push to `main` | Manual approval |

---

# 8. Secrets Management

Secrets SHALL be stored in GitHub Actions secrets and injected as environment variables.

Production secrets SHALL be stored in `.env.production` on the GCE instance (not in source control).

Secret rotation SHALL not require redeployment — workers SHALL reload configuration on restart.

---
