# Database

> Covers: MongoDB setup, Mongoose schema patterns, indexing strategy, transaction handling, repository pattern, data migration, backup strategy, and rollback strategy.

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
  status: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
  updatedBy: { type: Schema.Types.ObjectId },
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
| patients | `{ clinicId: 1, email: 1 }` | Compound | Per-clinic email lookup (uniqueness enforced at application level) |
| patients | `{ clinicId: 1, phone: 1 }` | Compound (partial, non-null) | Per-clinic phone lookup (uniqueness enforced at application level) |
| sessions | `{ patientId: 1, sessionType: 1, status: 1 }` | Compound | One DRAFT per type check |
| appointments | `{ clinicId: 1, slotStart: 1, slotEnd: 1 }` | Compound | Slot availability queries |
| leads | `{ clinicId: 1, assignedStaffId: 1 }` | Compound | Lead assignment queries |
| audit_logs | `{ organizationId: 1, timestamp: -1 }` | Compound | Audit queries |
| outbox_events | `{ status: 1, createdAt: 1 }` | Compound | Outbox dispatcher polling |

Patient email and phone uniqueness per clinic SHALL be enforced at the application level (service layer validation), not via database unique constraints.

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

## 5.1 Base Repository

All module repositories SHALL extend a base repository that provides common CRUD operations with tenant isolation:

```typescript
@Injectable()
export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  async findById(id: string, context: TenantContext): Promise<T | null> {
    return this.model.findOne({
      _id: id,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
  }

  async findAll(
    filter: FilterQuery<T>,
    context: TenantContext,
    options?: { sort?: Record<string, 1 | -1>; limit?: number; skip?: number },
  ): Promise<T[]> {
    return this.model
      .find({ ...filter, organizationId: context.organizationId, clinicId: context.clinicId })
      .sort(options?.sort)
      .limit(options?.limit)
      .skip(options?.skip)
      .exec();
  }

  async create(data: Partial<T>, options?: { session?: ClientSession }): Promise<T> {
    const [doc] = await this.model.create([data], options);
    return doc;
  }

  async update(
    id: string,
    data: Partial<T>,
    context: TenantContext,
    options?: { session?: ClientSession },
  ): Promise<T | null> {
    return this.model.findOneAndUpdate(
      { _id: id, organizationId: context.organizationId, clinicId: context.clinicId },
      { ...data, updatedAt: new Date(), updatedBy: context.staffId },
      { new: true, session: options?.session },
    );
  }

  async count(filter: FilterQuery<T>, context: TenantContext): Promise<number> {
    return this.model.countDocuments({
      ...filter,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
  }
}
```

## 5.2 Module Repository

Each module extends the base repository with domain-specific queries:

```typescript
@Injectable()
export class PatientRepository extends BaseRepository<PatientDocument> {
  constructor(@InjectModel(Patient.name) model: Model<PatientDocument>) {
    super(model);
  }

  async findByEmail(email: string, context: TenantContext): Promise<Patient | null> {
    return this.model.findOne({
      email,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
  }

  async findByPhone(phone: string, context: TenantContext): Promise<Patient | null> {
    return this.model.findOne({
      phone,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
  }

  async search(query: string, context: TenantContext): Promise<Patient[]> {
    return this.model.find({
      $text: { $search: query },
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
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

# 8. Backup Strategy

## 8.1 Database Backups

MongoDB Atlas SHALL be configured with:

- **Continuous backups** with point-in-time recovery (PITR)
- **Snapshot schedule**: Every 6 hours, retained for 7 days
- **Daily snapshots**: Retained for 30 days
- **Weekly snapshots**: Retained for 12 weeks
- **Monthly snapshots**: Retained for 12 months

## 8.2 Object Storage Backups

GCS object versioning SHALL be enabled on the production bucket.

Deleted objects SHALL be retained for 30 days via lifecycle rules.

## 8.3 Redis

Redis data is ephemeral (cache + job queues).

Redis SHALL NOT require backup — data is reconstructable from MongoDB state.

BullMQ jobs that fail permanently are stored in MongoDB (dead letter) and do not depend on Redis persistence.

---

# 9. Rollback Strategy

## 9.1 Application Rollback

Application rollback is handled by deploying a previous version from source control.

Since all code is in git, any previous version can be redeployed with a fresh build from that commit. Old Docker images are not retained.

## 9.2 Database Rollback

Database migrations SHALL be forward-compatible.

Rollback SHALL NOT require schema reversal.

New fields SHALL be nullable or have defaults so that old application code can run against the new schema.

## 9.3 Rollback Constraints

- Rollback SHALL NOT violate tenant isolation
- Rollback SHALL NOT lose audit log entries (append-only)
- Rollback SHALL NOT break event ordering (outbox events are idempotent)

---
