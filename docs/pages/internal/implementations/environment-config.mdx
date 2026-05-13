# Environment Configuration

> Covers: Environment variables, NestJS ConfigModule setup, validation, per-environment overrides, and secrets handling.

---

# 1. ConfigModule Setup

## 1.1 Root Configuration

```typescript
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      validationSchema: envValidationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
  ],
})
export class AppModule {}
```

## 1.2 Validation Schema

```typescript
const envValidationSchema = Joi.object({
  // Runtime
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().default(3000),

  // Database
  MONGODB_URI: Joi.string().required(),

  // Redis
  REDIS_URL: Joi.string().required(),

  // Authentication
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('30d'),

  // GCP
  GCP_PROJECT_ID: Joi.string().required(),
  GCS_BUCKET: Joi.string().required(),
  GCS_KEY_FILE: Joi.string().required(),

  // Email
  SMTP_HOST: Joi.string().default('mail.smtp2go.com'),
  SMTP_PORT: Joi.number().default(2525),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  EMAIL_FROM_NAME: Joi.string().default('Hairscope'),
  EMAIL_FROM_ADDRESS: Joi.string().default('noreply@hairscope.ai'),

  // Firebase
  FIREBASE_PROJECT_ID: Joi.string().required(),
  FIREBASE_CLIENT_EMAIL: Joi.string().required(),
  FIREBASE_PRIVATE_KEY: Joi.string().required(),

  // Typst
  TYPST_TEMPLATE_DIR: Joi.string().default('typst/templates'),

  // AI
  AI_API_URL: Joi.string().optional(),
  AI_API_KEY: Joi.string().optional(),

  // App
  APP_URL: Joi.string().required(),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
});
```

---

# 2. Environment Variables

## 2.1 Core

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Runtime environment | `development` | No |
| `PORT` | API server port | `3000` | No |
| `APP_URL` | Public application URL | — | Yes |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` | No |

## 2.2 Database

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MONGODB_URI` | MongoDB connection string | — | Yes |

## 2.3 Redis

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REDIS_URL` | Redis connection URL | — | Yes |

## 2.4 Authentication

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `JWT_PRIVATE_KEY` | RS256 private key (PEM) | — | Yes |
| `JWT_PUBLIC_KEY` | RS256 public key (PEM) | — | Yes |
| `JWT_ACCESS_EXPIRY` | Access token lifetime | `15m` | No |
| `JWT_REFRESH_EXPIRY` | Refresh token lifetime | `30d` | No |

## 2.5 Google Cloud

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GCP_PROJECT_ID` | GCP project identifier | — | Yes |
| `GCS_BUCKET` | GCS bucket name | — | Yes |
| `GCS_KEY_FILE` | Path to service account key | — | Yes |

## 2.6 Email (SMTP2Go)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server host | `mail.smtp2go.com` | No |
| `SMTP_PORT` | SMTP server port | `2525` | No |
| `SMTP_USER` | SMTP username | — | Yes |
| `SMTP_PASS` | SMTP password/API key | — | Yes |
| `EMAIL_FROM_NAME` | Sender display name | `Hairscope` | No |
| `EMAIL_FROM_ADDRESS` | Sender email address | `noreply@hairscope.ai` | No |

## 2.7 Firebase (Push Notifications)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `FIREBASE_PROJECT_ID` | Firebase project ID | — | Yes |
| `FIREBASE_CLIENT_EMAIL` | Service account email | — | Yes |
| `FIREBASE_PRIVATE_KEY` | Service account private key | — | Yes |

## 2.8 Typst (PDF Generation)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `TYPST_TEMPLATE_DIR` | Path to Typst templates | `typst/templates` | No |

## 2.9 AI Integration

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `AI_API_URL` | External AI service URL | — | No |
| `AI_API_KEY` | AI service API key | — | No |

## 2.10 Worker Ports

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `WORKER_REMINDER_PORT` | Reminder worker health port | `3001` | No |
| `WORKER_NOTIFICATION_PORT` | Notification worker health port | `3002` | No |
| `WORKER_REPORT_PORT` | Report worker health port | `3004` | No |

---

# 3. Per-Environment Files

## 3.1 File Hierarchy

```text
.env                  → Shared defaults (committed, no secrets)
.env.development      → Local development overrides
.env.staging          → Staging environment
.env.production       → Production (on server only, never committed)
```

## 3.2 .env (Shared Defaults)

```env
NODE_ENV=development
PORT=3000
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
EMAIL_FROM_NAME=Hairscope
EMAIL_FROM_ADDRESS=noreply@hairscope.ai
TYPST_TEMPLATE_DIR=typst/templates
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d
```

## 3.3 .env.development

```env
MONGODB_URI=mongodb://localhost:27017/hairscope-dev?replicaSet=rs0
REDIS_URL=redis://localhost:6379
APP_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
GCS_BUCKET=hairscope-dev-files
```

## 3.4 .env.example

A `.env.example` SHALL be committed with all required variables (no values):

```env
# Core
NODE_ENV=development
PORT=3000
APP_URL=

# Database
MONGODB_URI=

# Redis
REDIS_URL=

# Auth
JWT_PRIVATE_KEY=
JWT_PUBLIC_KEY=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# GCP
GCP_PROJECT_ID=
GCS_BUCKET=
GCS_KEY_FILE=

# Email
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=
SMTP_PASS=
EMAIL_FROM_NAME=Hairscope
EMAIL_FROM_ADDRESS=noreply@hairscope.ai

# Firebase
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Typst
TYPST_TEMPLATE_DIR=typst/templates

# AI (optional)
AI_API_URL=
AI_API_KEY=

# CORS
CORS_ORIGINS=http://localhost:3000
```

---

# 4. Configuration Access

## 4.1 Typed Configuration

```typescript
// packages/shared/src/config/app.config.ts
export interface AppConfig {
  port: number;
  env: 'development' | 'staging' | 'production';
  appUrl: string;
  corsOrigins: string[];
}

export const appConfig = registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV as AppConfig['env'],
  appUrl: process.env.APP_URL,
  corsOrigins: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()),
}));
```

## 4.2 Usage in Services

```typescript
@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService) {}

  getAppUrl(): string {
    return this.config.get<string>('APP_URL');
  }
}
```

---

# 5. Secrets Handling

## 5.1 Rules

- Secrets SHALL NEVER be committed to source control
- `.env.production` SHALL exist only on the production server
- `.env.development` MAY contain local development secrets (not production)
- `.gitignore` SHALL include: `.env.development`, `.env.staging`, `.env.production`
- `.env` and `.env.example` MAY be committed (no secrets)

## 5.2 Key Generation

JWT keys SHALL be generated per environment:

```bash
# Generate RS256 key pair
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem
```

## 5.3 Multi-line Keys in .env

Multi-line keys SHALL use `\n` escaping:

```env
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n"
```

---

# 6. Runtime Validation

If required environment variables are missing at startup, the application SHALL fail fast with a clear error message:

```text
Error: Config validation error: "MONGODB_URI" is required
```

The application SHALL NOT start with invalid configuration.

---
