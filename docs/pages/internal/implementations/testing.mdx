# Testing

> Covers: Jest unit/integration testing, Playwright E2E testing, test structure, mocking strategy, database testing, and CI integration.

---

# 1. Test Framework

## 1.1 Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Tests | Jest + `@nestjs/testing` | Domain logic, services, engines |
| Integration Tests | Jest + MongoDB Memory Server | Module workflows, repositories |
| E2E Tests | Playwright | Full API lifecycle testing |
| API Assertions | Supertest | HTTP request/response validation |

## 1.2 Configuration

```typescript
// jest.config.ts (root)
export default {
  projects: [
    '<rootDir>/packages/api',
    '<rootDir>/packages/worker-reminder',
    '<rootDir>/packages/worker-notification',
    '<rootDir>/packages/worker-report',
  ],
};
```

```typescript
// packages/api/jest.config.ts
export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverageFrom: ['**/*.(t|j)s', '!**/*.module.ts', '!**/index.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/../../shared/src/$1',
  },
};
```

---

# 2. Test Structure

## 2.1 Directory Layout

```text
packages/api/src/
├── modules/
│   ├── patients/
│   │   ├── patients.service.ts
│   │   ├── patients.service.spec.ts          ← Unit test
│   │   ├── patients.resolver.spec.ts         ← Resolver test
│   │   └── __tests__/
│   │       └── patients.integration.spec.ts  ← Integration test
│   ├── sessions/
│   │   └── ...
│   └── ...
├── engines/
│   ├── access-resolution/
│   │   ├── access-resolution.engine.ts
│   │   └── access-resolution.engine.spec.ts  ← Engine test
│   └── ...
└── ...

tests/e2e/
├── auth.spec.ts
├── patients.spec.ts
├── appointments.spec.ts
├── sessions.spec.ts
└── helpers/
    ├── setup.ts
    ├── factories.ts
    └── assertions.ts
```

## 2.2 Naming Convention

| Test Type | File Pattern | Example |
|-----------|-------------|---------|
| Unit | `*.spec.ts` | `patients.service.spec.ts` |
| Integration | `__tests__/*.integration.spec.ts` | `patients.integration.spec.ts` |
| E2E | `tests/e2e/*.spec.ts` | `auth.spec.ts` |

---

# 3. Unit Testing

## 3.1 Domain/Service Tests

Unit tests SHALL test business logic in isolation:

```typescript
describe('PatientService', () => {
  let service: PatientService;
  let patientRepo: jest.Mocked<PatientRepository>;
  let auditService: jest.Mocked<AuditService>;
  let outboxRepo: jest.Mocked<OutboxEventRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PatientService,
        { provide: PatientRepository, useValue: createMock<PatientRepository>() },
        { provide: AuditService, useValue: createMock<AuditService>() },
        { provide: OutboxEventRepository, useValue: createMock<OutboxEventRepository>() },
        { provide: Connection, useValue: createMockConnection() },
      ],
    }).compile();

    service = module.get(PatientService);
    patientRepo = module.get(PatientRepository);
  });

  describe('create', () => {
    it('SHALL create a patient with valid input', async () => {
      const input = patientFactory.build();
      const context = tenantContextFactory.build();

      patientRepo.findByEmail.mockResolvedValue(null);
      patientRepo.save.mockResolvedValue({ id: 'patient-1', ...input });

      const result = await service.create(input, context);

      expect(result.id).toBe('patient-1');
      expect(patientRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: input.email }),
        expect.any(Object),
      );
    });

    it('SHALL reject duplicate email within same clinic', async () => {
      const input = patientFactory.build();
      const context = tenantContextFactory.build();

      patientRepo.findByEmail.mockResolvedValue({ id: 'existing' } as any);

      await expect(service.create(input, context)).rejects.toThrow(DuplicatePatientEmailError);
    });
  });
});
```

## 3.2 Engine Tests

Engine tests SHALL validate deterministic behavior with no side effects:

```typescript
describe('AccessResolutionEngine', () => {
  let engine: AccessResolutionEngine;

  beforeEach(() => {
    engine = new AccessResolutionEngine();
  });

  it('SHALL grant access for OrgAdmin to all clinic resources', () => {
    const result = engine.resolve({
      staffId: 'staff-1',
      roles: [{ role: 'OrgAdmin', scope: 'ORGANIZATION' }],
      resource: 'patients',
      action: 'view',
      targetClinicId: 'clinic-1',
    });

    expect(result.decision).toBe('ALLOWED');
  });

  it('SHALL deny access for Doctor to other clinic resources', () => {
    const result = engine.resolve({
      staffId: 'staff-1',
      roles: [{ role: 'Doctor', scope: 'CLINIC', clinicId: 'clinic-1' }],
      resource: 'patients',
      action: 'view',
      targetClinicId: 'clinic-2',
    });

    expect(result.decision).toBe('DENIED');
  });
});
```

---

# 4. Integration Testing

## 4.1 MongoDB Memory Server

Integration tests SHALL use `mongodb-memory-server` for isolated database testing:

```typescript
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSet: MongoMemoryReplSet;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = replSet.getUri();
});

afterAll(async () => {
  await replSet.stop();
});
```

## 4.2 Module Integration Test

```typescript
describe('Patients Module Integration', () => {
  let app: INestApplication;
  let patientService: PatientApplicationService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          useFactory: () => ({ uri: process.env.MONGODB_URI }),
        }),
        PatientsModule,
        AuthModule,
        AuditModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    patientService = module.get(PatientApplicationService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('SHALL create patient and emit PatientCreated event', async () => {
    const context = tenantContextFactory.build();
    const input = createPatientInputFactory.build();

    const patient = await patientService.create(input, context);

    expect(patient.id).toBeDefined();
    expect(patient.email).toBe(input.email);

    // Verify outbox event was written
    const outboxEvents = await getOutboxEvents(patient.id);
    expect(outboxEvents).toHaveLength(1);
    expect(outboxEvents[0].eventType).toBe('PatientCreated');
  });
});
```

---

# 5. E2E Testing (Playwright)

## 5.1 Setup

```typescript
// tests/e2e/helpers/setup.ts
import { test as base } from '@playwright/test';

interface ApiFixtures {
  apiContext: APIRequestContext;
  authToken: string;
}

export const test = base.extend<ApiFixtures>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.API_URL ?? 'http://localhost:3000',
    });
    await use(context);
    await context.dispose();
  },

  authToken: async ({ apiContext }, use) => {
    const response = await apiContext.post('/auth/login', {
      data: { email: 'test@hairscope.ai', password: 'TestPass123!' },
    });
    const { accessToken } = await response.json();
    await use(accessToken);
  },
});
```

## 5.2 E2E Test Example

```typescript
// tests/e2e/patients.spec.ts
import { test } from './helpers/setup';
import { expect } from '@playwright/test';

test.describe('Patients API', () => {
  test('SHALL create and retrieve a patient', async ({ apiContext, authToken }) => {
    // Create
    const createResponse = await apiContext.post('/graphql', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        query: `
          mutation CreatePatient($input: CreatePatientInput!) {
            createPatient(input: $input) { id firstName lastName email }
          }
        `,
        variables: {
          input: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+971501234567',
            gender: 'MALE',
            dateOfBirth: '1990-01-15',
          },
        },
      },
    });

    const { data } = await createResponse.json();
    expect(data.createPatient.id).toBeDefined();
    expect(data.createPatient.email).toBe('john.doe@example.com');

    // Retrieve
    const getResponse = await apiContext.post('/graphql', {
      headers: { Authorization: `Bearer ${authToken}` },
      data: {
        query: `
          query GetPatient($id: ID!) {
            patient(id: $id) { id firstName lastName email }
          }
        `,
        variables: { id: data.createPatient.id },
      },
    });

    const { data: getData } = await getResponse.json();
    expect(getData.patient.firstName).toBe('John');
  });
});
```

## 5.3 Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.API_URL ?? 'http://localhost:3000',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  projects: [
    { name: 'api', testMatch: '**/*.spec.ts' },
  ],
});
```

---

# 6. Mocking Strategy

## 6.1 Repository Mocks

```typescript
function createMock<T>(): jest.Mocked<T> {
  return new Proxy({} as any, {
    get: (target, prop) => {
      if (!target[prop]) {
        target[prop] = jest.fn();
      }
      return target[prop];
    },
  });
}
```

## 6.2 MongoDB Session Mock

```typescript
function createMockConnection() {
  const mockSession = {
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  return {
    startSession: jest.fn().mockResolvedValue(mockSession),
  };
}
```

## 6.3 External Service Mocks

External services SHALL be mocked in unit and integration tests:

| Service | Mock Strategy |
|---------|--------------|
| GCS | In-memory buffer store |
| Redis | `ioredis-mock` |
| SMTP | `nodemailer-mock` |
| FCM | Jest mock of `firebase-admin` |
| Typst | Mock returning empty Buffer |

---

# 7. Test Factories

```typescript
// tests/factories/patient.factory.ts
import { faker } from '@faker-js/faker';

export const patientFactory = {
  build: (overrides?: Partial<CreatePatientInput>): CreatePatientInput => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    email: faker.internet.email(),
    phone: faker.phone.number('+971#########'),
    gender: faker.helpers.arrayElement(['MALE', 'FEMALE']),
    dateOfBirth: faker.date.birthdate().toISOString().split('T')[0],
    ...overrides,
  }),
};

export const tenantContextFactory = {
  build: (overrides?: Partial<TenantContext>): TenantContext => ({
    staffId: faker.database.mongodbObjectId(),
    organizationId: faker.database.mongodbObjectId(),
    clinicId: faker.database.mongodbObjectId(),
    authSessionId: faker.database.mongodbObjectId(),
    ...overrides,
  }),
};
```

---

# 8. CI Integration

## 8.1 Test Commands

```json
{
  "scripts": {
    "test": "jest",
    "test:unit": "jest --testPathPattern=\\.spec\\.ts$ --testPathIgnorePatterns=integration",
    "test:integration": "jest --testPathPattern=integration\\.spec\\.ts$",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --reporters=default --reporters=jest-junit"
  }
}
```

## 8.2 Coverage Thresholds

```typescript
// jest.config.ts
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

## 8.3 CI Pipeline

```yaml
# .github/workflows/test.yml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v2
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm test:ci
    - run: pnpm test:e2e
      env:
        API_URL: http://localhost:3000
```

---

# 9. Test Database Seeding

```typescript
// tests/helpers/seed.ts
export async function seedTestData(connection: Connection): Promise<TestSeedData> {
  const org = await createOrganization(connection);
  const clinic = await createClinic(connection, org.id);
  const admin = await createStaff(connection, org.id, clinic.id, 'OrgAdmin');
  const doctor = await createStaff(connection, org.id, clinic.id, 'Doctor');

  return { org, clinic, admin, doctor };
}
```

---
