# Deployment

> Covers: repository layout for deployment, environments and branches, VM
> topology, Docker, nginx and TLS, GitHub Actions CI/CD, tagging and
> changelogs, and rollback.

This document describes the deployment model shared by every deployed
Hairscope repository. It is written generically — a repository name, a
service name, or a port number is a placeholder unless shown as a literal
example from `hairscope-backend` or `hairscope-clinic-web`.

---

# 1. Environments and Branches

Every repository SHALL use exactly three deployment branches, one per
environment:

| Branch | Environment | Deploys to |
|--------|-------------|------------|
| `dev` | development | shared non-production VM |
| `staging` | staging | shared non-production VM |
| `main` | production | production VM |

`dev` and `staging` SHALL share one VM. `main` SHALL always deploy to the
dedicated production VM. This keeps a single non-production machine to
maintain while still keeping the two pre-production environments isolated
from each other (own processes, own ports, own data — see
**14-deployment-architecture.md** §4.3).

A repository MAY additionally use `feature/*` branches for local development.
Those branches SHALL NOT trigger any deployment.

---

# 2. Environment Files

Each repository SHALL commit exactly two environment files:

| File | Committed | Contains |
|------|-----------|----------|
| `.env.example` | Yes | Every variable and secret **key** the app can use, with no values (or safe local defaults only) |
| `.env.local` | Yes, as a template with placeholder values | The subset needed to run the app locally |

`.env.example` is the single source of truth for what configuration exists.
Adding a new required variable to the application SHALL come with an update
to `.env.example` in the same change.

No other `.env.*` file (`.env.dev`, `.env.staging`, `.env.prod`, etc.) is
required by the deployment pipeline, and none SHALL be committed. A
developer MAY keep such files locally, gitignored, purely as their own
record of the real values already configured for a VM — the pipeline itself
never reads them; it reads from GitHub Environments (Section 6).

---

# 3. Hostnames and Ports

Each environment's hostnames and the port(s) the application listens on
SHALL be declared as keys in `.env.example`, following the naming already
used for URLs elsewhere in the file (e.g. an `APP_URL`-style key per
environment, or one key per externally addressable surface if the
application exposes more than one — see **14-deployment-architecture.md**
§4.4).

The actual per-environment values (the real hostname, the real port) are
configuration, not secrets, and SHALL be set as GitHub **repository
variables** scoped to the matching GitHub Environment (Section 6) — not as
GitHub secrets, and not hardcoded in workflow files.

---

# 4. VM Topology

## 4.1 Shared Non-Production VM

`dev` and `staging` run as separate, independently addressable deployments
on the same VM. Each repository SHALL own its own directory on that VM
(e.g. `/opt/<repo>/dev`, `/opt/<repo>/staging`) so that one repository's
deploy can never remove or overwrite another repository's containers.

## 4.2 Production VM

`main` deploys to a separate VM dedicated to production. The same
one-directory-per-repository convention applies
(`/opt/<repo>/production`).

## 4.3 Managed vs. In-VM Services

| Service | Where it runs |
|---------|----------------|
| MongoDB | Managed (e.g. MongoDB Atlas) — never self-hosted in a VM |
| Redis | Runs in a container on the VM |
| PostgreSQL (where a repository owns a relational store) | Runs in a container on the VM |

Redis and PostgreSQL data SHALL persist on a Docker volume scoped to that
repository's compose project, so a redeploy never loses data.

---

# 5. Docker

## 5.1 Application Dockerfile

Each deployable process (an API, a worker, a frontend) SHALL have its own
Dockerfile under `docker/`, using a multi-stage build: a `builder` stage
that installs dependencies and compiles, and a slim `production` stage that
copies only the build output.

```dockerfile
# docker/Dockerfile.api — illustrative shape, not literal for every repo
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM oven/bun:1-slim AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD curl -f http://localhost:3000/health || exit 1
CMD ["bun", "run", "dist/main.js"]
```

A frontend Dockerfile follows the same two-stage shape, building a
production bundle in the builder stage and serving it from the production
stage.

## 5.2 Local Development Compose

A repository MAY provide `docker/docker-compose.yml` to run its own
dependencies (Redis, Postgres, or a local Mongo replica set for testing)
during local development. This file is for developer convenience and is
not the file deployed to a VM.

---

# 6. GitHub Actions CI/CD

CI/CD is set up once per repository and requires no manual deployment steps
afterward: every merge to `dev`, `staging`, or `main` triggers CI, and a
successful CI run on a deploy branch triggers the matching deploy job.

## 6.1 GitHub Environments

Each repository SHALL define three GitHub **Environments**:

- `development`
- `staging`
- `production`

Each Environment holds:

- **Variables** — non-secret configuration for that environment (hostnames,
  ports, feature flags, public URLs). Read via `${{ vars.NAME }}`.
- **Secrets** — credentials for that environment (API keys, database
  passwords, signing secrets). Read via `${{ secrets.NAME }}`.

The `production` Environment SHOULD require manual approval before a
deployment job runs against it, so a merge to `main` does not release to
customers unattended.

## 6.2 CI Workflow

```yaml
# .github/workflows/ci.yml — shape
name: CI

on:
  push:
    branches: [dev, staging, main]
  pull_request:
    branches: [dev, staging, main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # install, lint, typecheck, test

  build:
    if: github.event_name == 'push'
    needs: [lint-and-test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: gcr.io
          username: _json_key
          password: ${{ secrets.GCP_SA_KEY }}
      # resolve an image tag per Section 8, then build & push
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: gcr.io/${{ secrets.GCP_PROJECT }}/<image-name>:${{ steps.tag.outputs.tag }}
```

`lint-and-test` SHALL run on both pushes and pull requests. `build` SHALL
run only on a push to a deploy branch — a pull request builds nothing and
deploys nothing.

## 6.3 Deploy Workflow

```yaml
# .github/workflows/deploy.yml — shape
name: Deploy

on:
  workflow_run:
    workflows: [CI]
    types: [completed]
    branches: [dev, staging, main]

jobs:
  deploy-dev:
    if: >
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.head_branch == 'dev'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: actions/checkout@v4
      - uses: google-github-actions/auth@v2
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      - uses: google-github-actions/setup-gcloud@v2
      # write this environment's env file + docker-compose.yml to the VM
      # using ${{ vars.* }} and ${{ secrets.* }} from the `development`
      # GitHub Environment, then:
      #   docker compose pull && docker compose up -d --remove-orphans

  deploy-staging:
    if: >
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.head_branch == 'staging'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      # same shape, targeting the staging VM directory

  deploy-production:
    if: >
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.head_branch == 'main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      # same shape, targeting the production VM
```

Each job pulls only from its matching GitHub Environment, so a bug that
leaks a staging value into a workflow file cannot reach production — the
values themselves are never in the file.

## 6.4 Required Secrets (shared across repositories)

- `GCP_SA_KEY` — GCP service-account JSON with Compute SSH and GCR
  push/pull permissions.
- `GCP_PROJECT`, `GCE_INSTANCE`, `GCP_ZONE` — target GCP project and VM.

Repository-specific secrets (database credentials, signing keys,
third-party API keys) are declared per Environment as described in Section
6.1, and their required keys SHALL appear in `.env.example`.

---

# 7. nginx and TLS

Each repository SHALL commit its own nginx site configuration(s) under
`deploy/nginx/`, one file per environment, containing no secret values —
only hostnames, ports, and proxy rules.

```nginx
# deploy/nginx/<repo>-dev.conf — shape
server {
    listen 80;
    server_name <dev-hostname>;

    location / {
        proxy_pass http://127.0.0.1:<dev-port>;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Where an application exposes more than one externally addressable surface
(for example, a public-facing surface and an administrative surface served
from the same deployment), each surface SHALL get its own `server_name`
block proxying to the same backing port, and the application itself SHALL
decide which routes each hostname may answer — nginx routes by hostname to
the right port; the application enforces which paths belong to which
surface. This avoids an nginx path allowlist that must be kept in sync by
hand every time a route is added.

TLS is issued and renewed with certbot, once per hostname, after DNS and
nginx are in place:

```sh
sudo cp deploy/nginx/<repo>-dev.conf /etc/nginx/sites-available/<repo>-dev
sudo ln -sf /etc/nginx/sites-available/<repo>-dev /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d <dev-hostname>
```

certbot's HTTP-01 challenge requires the hostname's DNS record to already
resolve to the VM and port 80 to already be reachable, so the order is
always: DNS record → nginx config → certbot. A webhook or callback URL
registered with a third party (e.g. a payment gateway) SHALL be registered
only after TLS is confirmed live, since most such providers validate
reachability before accepting the URL.

---

# 8. Tagging, Versioning, and Changelog

Every deployment SHALL be tagged and versioned, and every version SHALL
have a changelog entry, so that any past deployment can be identified and,
if necessary, rolled back to.

| Branch | Image tag | Example |
|--------|-----------|---------|
| `dev` | `dev-<short-sha>` | `dev-a1b2c3d` |
| `staging` | `rc-<version>` | `rc-1.4.0` |
| `main` | `<version>` | `1.4.0` |

Full versioning rules, branch promotion flow, and changelog format are
defined in **19-versioning.md** and apply identically here — this document
only fixes the image-tag convention above, since it is the deployment
pipeline that reads it.

---

# 9. Rollback

Because every deployed image is tagged with its version (Section 8) and
retained in the registry, rolling back an environment is: point that
environment's compose file at the previous tag and re-run
`docker compose pull && docker compose up -d` — no rebuild required.

```bash
# On the target VM, inside that repository's environment directory
sed -i 's/:<bad-tag>/:<previous-good-tag>/' docker-compose.yml
docker compose pull && docker compose up -d --remove-orphans
```

Database migrations SHALL be forward-compatible so that a rollback of
application code never requires a schema reversal: new fields SHALL be
nullable or defaulted, so that the previous version of the code continues
to run correctly against the newer schema.

---

# 10. Health Checks

Each deployed process SHALL expose a `/health` endpoint (or equivalent, for
a frontend) that a container `HEALTHCHECK` and, if used, a load balancer can
poll.

```typescript
@Controller('health')
export class HealthController {
  @Get()
  @Public()
  async check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

A process with dependencies it needs to be healthy (a database, a cache)
SHALL check those dependencies here rather than only reporting that the
process itself is running.
