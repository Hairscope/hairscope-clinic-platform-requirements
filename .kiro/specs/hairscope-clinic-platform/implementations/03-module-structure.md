# Module Structure

> Covers: NestJS module conventions, internal file organization, dependency injection patterns, and cross-module communication implementation.

---

# 1. Module Organization

Every business module SHALL follow this internal structure:

```
src/modules/{module-name}/
├── {module-name}.module.ts       → NestJS module definition
├── domain/
│   ├── entities/                 → Mongoose schema definitions
│   ├── value-objects/            → Domain value objects
│   ├── events/                   → Domain event classes
│   ├── invariants/               → Business rule validators
│   └── services/                 → Domain services (pure logic)
├── application/
│   ├── commands/                 → Command handlers (write operations)
│   ├── queries/                  → Query handlers (read operations)
│   ├── services/                 → Application services (orchestration)
│   └── dto/                      → Data transfer objects
├── infrastructure/
│   ├── repositories/             → Mongoose repository implementations
│   └── adapters/                 → External service adapters
├── graphql/
│   ├── resolvers/                → GraphQL resolvers
│   ├── types/                    → GraphQL type definitions (code-first)
│   └── inputs/                   → GraphQL input types
├── events/
│   ├── producers/                → Event emission logic
│   └── consumers/                → Event consumption handlers
├── guards/                       → Module-specific guards
├── decorators/                   → Module-specific decorators
└── tests/
    ├── unit/                     → Unit tests
    └── integration/              → Integration tests
```

---

# 2. Module Definition

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema }
    ]),
  ],
  providers: [
    // Domain services
    PatientDomainService,
    // Application services
    CreatePatientHandler,
    GetPatientHandler,
    // Repositories
    PatientRepository,
    // Event consumers
    LeadConvertedConsumer,
  ],
  controllers: [PatientResolver],
  exports: [PatientRepository], // Only export what other modules need
})
export class PatientsModule {}
```

---

# 3. Dependency Injection Rules

- Modules SHALL only import other modules through NestJS `imports[]`
- Modules SHALL only export explicitly published services
- Domain services SHALL NOT depend on infrastructure
- Application services MAY depend on domain services and repositories
- Resolvers SHALL only call application services
- Cross-module communication SHALL use events (not direct imports)

---

# 4. Cross-Module Communication

Modules SHALL NOT import each other directly.

Communication patterns:

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| Domain Events | State propagation | `@nestjs/event-emitter` + Transactional Outbox |
| Published Contracts | Shared types/interfaces | `packages/shared` |
| Engine Invocation | Decision computation | Injectable engine services |

---

# 5. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Module file | `{name}.module.ts` | `patients.module.ts` |
| Entity | `{name}.entity.ts` | `patient.entity.ts` |
| Schema | `{name}.schema.ts` | `patient.schema.ts` |
| Repository | `{name}.repository.ts` | `patient.repository.ts` |
| Resolver | `{name}.resolver.ts` | `patient.resolver.ts` |
| Command handler | `{verb}-{noun}.handler.ts` | `create-patient.handler.ts` |
| Query handler | `get-{noun}.handler.ts` | `get-patient.handler.ts` |
| Event | `{noun}-{past-verb}.event.ts` | `session-completed.event.ts` |
| Guard | `{name}.guard.ts` | `auth.guard.ts` |
| DTO | `{verb}-{noun}.dto.ts` | `create-patient.dto.ts` |

---

# 6. Error Handling

All modules SHALL use a consistent error hierarchy:

```typescript
// Base platform error
export class PlatformError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly field?: string,
  ) {
    super(message);
  }
}

// Domain-specific errors
export class DuplicatePatientEmailError extends PlatformError {
  constructor() {
    super('DUPLICATE_PATIENT_EMAIL', 'A patient with this email already exists in this clinic', 'email');
  }
}
```

GraphQL error formatting SHALL map `PlatformError` to the standard error response format defined in requirements.

---

# 7. Audit Integration

Every command handler that mutates state SHALL:

1. Execute domain logic
2. Persist state change
3. Append audit log entry
4. Write outbox event

All four operations SHALL occur within a single MongoDB transaction.

---
