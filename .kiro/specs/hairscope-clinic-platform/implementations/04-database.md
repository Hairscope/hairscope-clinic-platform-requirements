# Database

> Covers: MongoDB setup, Mongoose schema patterns, indexing strategy, transaction handling, and data migration approach.

---

# 1. Connection

MongoDB connection SHALL be configured via `@nestjs/mongoose`:

```typescript
MongooseModule.forRootAsync({
  useFactory: (config: ConfigService) => ({
    uri: config.get('MONGODB_URI'),
    retryAttempts: 5,
    retryDelay: 3000,
  }),
  inject: [ConfigService],
})
```

---

# 2. Schema Patterns

### Base Schema

All entities SHALL extend a base schema:

```typescript
export const BaseSchemaFields = {
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
};
```

### Tenant Isolation

Every query SHALL include `organizationId` in the filter.

Clinic-scoped queries SHALL also include `clinicId`.

A global query middleware SHALL enforce tenant isolation:

```typescript
schema.pre(/^find/, function() {
  // Inject organizationId from request context
  this.where({ organizationId: requestContext.organizationId });
});
```

---

# 3. Indexing Strategy

| Collection | Index | Type | Purpose |
|-----------|-------|------|---------|
| staff | `{ organizationId: 1, clinicId: 1, email: 1 }` | Unique | Staff lookup, duplicate prevention |
| patients | `{ clinicId: 1, email: 1 }` | Unique | Per-clinic email uniqueness |
| patients | `{ clinicId: 1, phone: 1 }` | Unique (partial, non-null) | Per-clinic phone uniqueness |
| sessions | `{ patientId: 1, sessionType: 1, status: 1 }` | Compound | One DRAFT per type check |
| appointments | `{ clinicId: 1, slotStart: 1, slotEnd: 1 }` | Compound | Slot availability queries |
| leads | `{ clinicId: 1, assignedStaffId: 1 }` | Compound | Lead assignment queries |
| audit_logs | `{ organizationId: 1, timestamp: -1 }` | Compound | Audit queries |
| outbox_events | `{ status: 1, createdAt: 1 }` | Compound | Outbox dispatcher polling |

---

# 4. Transactions

State-changing operations that emit events SHALL use MongoDB transactions:

```typescript
const session = await this.connection.startSession();
session.startTransaction();

try {
  // 1. Domain mutation
  await this.patientRepo.save(patient, { session });
  
  // 2. Audit log
  await this.auditRepo.append(auditEntry, { session });
  
  // 3. Outbox event
  await this.outboxRepo.insert(outboxEvent, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

# 5. Repository Pattern

Each module SHALL implement its own repository:

```typescript
@Injectable()
export class PatientRepository {
  constructor(
    @InjectModel(Patient.name) private model: Model<PatientDocument>,
  ) {}

  async findById(id: string, context: TenantContext): Promise<Patient | null> {
    return this.model.findOne({
      _id: id,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
  }

  async save(patient: Patient, options?: SaveOptions): Promise<Patient> {
    // Upsert with tenant scoping
  }
}
```

---

# 6. Data Migration

Schema changes SHALL be managed through versioned migration scripts.

Migrations SHALL:

- be idempotent
- be reversible where possible
- run before application startup
- be tracked in a `migrations` collection

---

# 7. Replica Set

MongoDB SHALL run as a replica set (even single-node in development) to support transactions.

Docker Compose SHALL configure a single-node replica set for local development.

---
