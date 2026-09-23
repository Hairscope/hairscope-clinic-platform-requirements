# Environment Configuration

> Covers: environment variable files, the ConfigModule setup, validation,
> hostnames and ports, and secrets handling.

This document describes the environment-configuration convention shared by
every deployed Hairscope repository. See **15-deployment.md** for how these
values reach a running deployment.

---

# 1. File Convention

A repository SHALL commit exactly two environment files:

| File | Committed | Purpose |
|------|-----------|---------|
| `.env.example` | Yes | Every variable and secret key the application can read, with no real values. This is the canonical inventory of configuration. |
| `.env.local` | Yes, as a template with placeholder values | The subset of variables needed to run the application on a developer's machine. Each developer overwrites the placeholders locally; the file itself is never rewritten with real secrets and committed back. |

No other `.env.*` file is required by, or read by, the deployment pipeline.
A developer MAY keep additional files such as `.env.dev`, `.env.staging`,
or `.env.prod` purely as their own private, gitignored record of the real
values already configured in GitHub for each environment — convenient for
remembering what a VM is running, but not part of the deployment mechanism.
Deployed environments get their configuration from GitHub Environments
(Section 5), not from any file in the repository.

`.gitignore` SHALL exclude every `.env*` file except `.env.example`.

Adding a new configuration value to the application SHALL come with an
addition to `.env.example` in the same change, so the file never drifts
out of date with what the code actually reads.

---

# 2. ConfigModule Setup

## 2.1 Root Configuration

```typescript
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.local',
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

In a deployed environment, the process's real environment variables are
already set by the deployment platform (Section 5) before the application
starts, so `.env.local` is absent and `envFilePath` simply has nothing to
load — `ConfigModule` falls through to `process.env` either way.

## 2.2 Validation Schema

The validation schema SHALL mirror `.env.example` — every key declared
there SHALL have a corresponding validator here, `.required()` unless the
application has a safe default.

```typescript
const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
  PORT: Joi.number().default(3000),

  MONGODB_URI: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRY: Joi.string().default('30d'),

  APP_URL: Joi.string().required(),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),
});
```

If a required environment variable is missing at startup, the application
SHALL fail fast with a clear error message and SHALL NOT start with invalid
configuration:

```text
Error: Config validation error: "MONGODB_URI" is required
```

---

# 3. Hostnames and Ports

Every environment's externally reachable hostname(s) and the port the
application listens on SHALL be declared as keys in `.env.example`.

If an application exposes only one externally addressable surface, one
`APP_URL`-style key is enough. If it exposes more than one surface under
different hostnames (see **14-deployment-architecture.md** §4.4), each
surface SHALL have its own key, so the pipeline can bake or inject the
right value per environment without guessing:

```env
# .env.example — illustrative
APP_URL=
PORT=3000
```

The real value of each such key, per environment, is configuration, not a
secret: it SHALL be stored as a GitHub repository **variable** scoped to the
matching GitHub Environment (Section 5), never as a secret and never
hardcoded in a workflow file.

---

# 4. .env.example Contents

`.env.example` SHALL list every key the application reads, grouped by
concern, with no values (or a safe, non-secret local default where one
genuinely exists, such as a local port number):

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

# Third-party integrations
# (one block per integration; group related keys together)

# CORS
CORS_ORIGINS=http://localhost:3000
```

A reviewer SHALL be able to read `.env.example` alone and know every piece
of configuration the application depends on, without reading the source
code.

---

# 5. Secrets Handling

## 5.1 Where Values Live

| Location | Contents | Committed |
|----------|----------|-----------|
| `.env.example` | Keys only | Yes |
| `.env.local` | Placeholder values for local development | Yes (placeholders only) |
| Developer's local machine | Real local/dev credentials, if different from the placeholders | Never |
| GitHub Environment: `development` | Real dev values (variables + secrets) | N/A — lives in GitHub, not the repo |
| GitHub Environment: `staging` | Real staging values | N/A |
| GitHub Environment: `production` | Real production values | N/A |

## 5.2 Rules

- Secret values SHALL NEVER be committed to source control, in any file, in
  any environment.
- Non-secret configuration (hostnames, ports, flags) SHALL be a GitHub
  **variable**; credentials SHALL be a GitHub **secret**. Both are scoped to
  a GitHub Environment, never left ungrouped at the repository level, so a
  workflow reading `${{ vars.X }}` or `${{ secrets.X }}` under
  `environment: staging` can only ever see staging's own values.
- Rotating a secret SHALL NOT require an application code change — only an
  update to the value in the relevant GitHub Environment, followed by a
  redeploy.

## 5.3 Multi-line Values

Multi-line values (e.g. a PEM key) SHALL use `\n` escaping when stored as a
single-line environment variable:

```env
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBg...\n-----END PRIVATE KEY-----\n"
```

---

# 6. Configuration Access

## 6.1 Typed Configuration

```typescript
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

## 6.2 Usage in Services

```typescript
@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService) {}

  getAppUrl(): string {
    return this.config.get<string>('APP_URL');
  }
}
```
