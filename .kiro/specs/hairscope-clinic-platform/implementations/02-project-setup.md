# Project Setup

> Covers: Repository initialization, workspace configuration, Docker Compose setup, and local development environment.

---

# 1. Prerequisites

Development environment requires:

- Bun 1.x (primary runtime and package manager)
- Node.js 20 LTS (fallback runtime only)
- Docker + Docker Compose
- MongoDB 7.x (via Docker)
- Redis 7.x (via Docker)
- Typst CLI (installed locally or via Docker)
- GCP service account key (for Cloud Storage)

---

# 2. Workspace Configuration

### Root package.json

```json
{
  "name": "hairscope-backend",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "dev": "bun run --filter api dev",
    "build": "bun run --filter '*' build",
    "test": "bun run --filter '*' test",
    "test:e2e": "bun run --filter tests e2e",
    "lint": "bun run --filter '*' lint",
    "docker:up": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down"
  },
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

# 3. Docker Compose (Development)

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: hairscope
      MONGO_INITDB_ROOT_PASSWORD: hairscope_dev

  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'

volumes:
  mongodb_data:
```

---

# 4. Environment Variables

All environment variables SHALL be defined in `.env` files per package.

A `.env.example` SHALL be maintained in each package with all required variables.

```env
# Database
MONGODB_URI=mongodb://hairscope:hairscope_dev@localhost:27017/hairscope?authSource=admin

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-change-in-production
JWT_ISSUER=hairscope-platform

# GCS
GCS_BUCKET=hairscope-dev-uploads
GCS_PROJECT_ID=hairscope-dev
GOOGLE_APPLICATION_CREDENTIALS=./gcp-key.json

# Email (SMTP2Go)
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=your-smtp2go-user
SMTP_PASS=your-smtp2go-pass
SMTP_FROM=noreply@hairscope.ai

# Firebase
FIREBASE_PROJECT_ID=hairscope-dev
FIREBASE_CREDENTIALS=./firebase-key.json

# Typst
TYPST_BINARY_PATH=/usr/local/bin/typst
TYPST_TEMPLATES_PATH=./typst/templates

# App
PORT=4000
NODE_ENV=development
```

---

# 5. TypeScript Configuration

Base `tsconfig.json` at root:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Each package extends the root config.

---

# 6. Local Development Flow

```text
1. Clone repository
2. bun install
3. docker compose up (MongoDB + Redis)
4. Copy .env.example → .env (configure secrets)
5. bun dev (starts API server with hot reload)
```

---

# 7. Code Quality

ESLint SHALL enforce:

- No unused variables
- No implicit any
- Consistent return types
- Module boundary enforcement (via eslint-plugin-boundaries)

Prettier SHALL enforce:

- Single quotes
- Trailing commas
- 2-space indentation
- 100 char line width

---
