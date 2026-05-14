# Audit Module Implementation

> Covers: Append-only audit log, immutable attribution, structured audit entries, query interface, and retention policy.

---

# 1. Module Structure

```text
packages/api/src/modules/audit/
├── audit.module.ts
├── entities/
│   └── audit-log.schema.ts
├── repositories/
│   └── audit-log.repository.ts
├── services/
│   └── audit.service.ts
├── resolvers/
│   └── audit.resolver.ts
└── dto/
    └── query-audit-log.input.ts
```

---

# 2. Audit Log Schema

```typescript
const AuditLogSchema = new Schema({
  action: { type: String, required: true, index: true },
  entityId: { type: String },
  entityType: { type: String },
  staffId: { type: Schema.Types.ObjectId, required: true },
  staffName: { type: String, required: true }, // Immutable snapshot at time of action
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, index: true },
  metadata: { type: Schema.Types.Mixed }, // Action-specific data (before/after values)
  ipAddress: { type: String },
  userAgent: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
});

AuditLogSchema.index({ organizationId: 1, timestamp: -1 });
AuditLogSchema.index({ organizationId: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ entityId: 1, entityType: 1, timestamp: -1 });
AuditLogSchema.index({ staffId: 1, timestamp: -1 });
```

---

# 3. Audit Service

```typescript
@Injectable()
export class AuditService {
  constructor(
    private readonly auditLogRepo: AuditLogRepository,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async append(
    action: string,
    metadata: Record<string, any> & { entityId?: string; entityType?: string },
    options?: { session?: ClientSession; context?: TenantContext },
  ): Promise<void> {
    const context = options?.context ?? this.request['identity'];
    const staff = await this.getStaffSnapshot(context.staffId);

    await this.auditLogRepo.create({
      action,
      entityId: metadata.entityId ?? null,
      entityType: metadata.entityType ?? this.resolveEntityType(action),
      staffId: context.staffId,
      staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'SYSTEM',
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      metadata,
      ipAddress: this.request?.ip,
      userAgent: this.request?.headers?.['user-agent'],
      timestamp: new Date(),
    }, options?.session ? { session: options.session } : undefined);
  }

  private resolveEntityType(action: string): string {
    const mapping: Record<string, string> = {
      PATIENT_CREATED: 'Patient',
      PATIENT_UPDATED: 'Patient',
      SESSION_COMPLETED: 'Session',
      APPOINTMENT_BOOKED: 'Appointment',
      APPOINTMENT_CANCELLED: 'Appointment',
      LEAD_CREATED: 'Lead',
      LEAD_CONVERTED: 'Lead',
      INVOICE_FINALIZED: 'Invoice',
      STAFF_DEACTIVATED: 'Staff',
      LOGIN_SUCCESS: 'AuthSession',
      LOGIN_FAILED: 'AuthSession',
      // ... all other actions
    };
    return mapping[action] ?? 'Unknown';
  }
}
```

---

# 4. Immutability Guarantees

The audit log SHALL be append-only:

- No update operations are exposed
- No delete operations are exposed
- The `staffName` field is a snapshot at the time of action — it never changes even if the staff member's name is later updated
- MongoDB collection SHALL have no update/delete indexes or TTL

```typescript
// Repository enforces append-only
@Injectable()
export class AuditLogRepository {
  constructor(@InjectModel(AuditLog.name) private model: Model<AuditLogDocument>) {}

  async create(entry: AuditLogEntry, options?: SaveOptions): Promise<AuditLog> {
    return this.model.create([entry], options);
  }

  // NO update method
  // NO delete method

  async query(filters: AuditQueryFilters, pagination: PaginationArgs): Promise<AuditLogConnection> {
    const query: FilterQuery<AuditLog> = {
      organizationId: filters.organizationId,
    };

    if (filters.clinicId) query.clinicId = filters.clinicId;
    if (filters.action) query.action = filters.action;
    if (filters.staffId) query.staffId = filters.staffId;
    if (filters.entityId) query.entityId = filters.entityId;
    if (filters.from) query.timestamp = { $gte: filters.from };
    if (filters.to) query.timestamp = { ...query.timestamp, $lte: filters.to };

    const total = await this.model.countDocuments(query);
    const entries = await this.model
      .find(query)
      .sort({ timestamp: -1 })
      .skip(pagination.offset)
      .limit(pagination.first)
      .exec();

    return { entries, totalCount: total };
  }
}
```

---

# 5. Audit Actions

| Action | Entity Type | Metadata |
|--------|-------------|----------|
| `LOGIN_SUCCESS` | AuthSession | `{ staffId }` |
| `LOGIN_FAILED` | AuthSession | `{ email }` |
| `LOGOUT` | AuthSession | `{ staffId }` |
| `INVITE_SENT` | Staff | `{ staffId, email }` |
| `STAFF_DEACTIVATED` | Staff | `{ staffId }` |
| `STAFF_REACTIVATED` | Staff | `{ staffId }` |
| `ROLE_CREATED` | Role | `{ roleId, name }` |
| `ROLE_UPDATED` | Role | `{ roleId, changes }` |
| `PATIENT_CREATED` | Patient | `{ patientId }` |
| `PATIENT_UPDATED` | Patient | `{ patientId, changes }` |
| `GDPR_ERASURE` | Patient | `{ patientId }` |
| `SESSION_COMPLETED` | Session | `{ sessionId }` |
| `TREATMENT_PLAN_SIGNED` | TreatmentPlan | `{ planId }` |
| `PRESCRIPTION_SIGNED` | Prescription | `{ prescriptionId }` |
| `APPOINTMENT_BOOKED` | Appointment | `{ appointmentId }` |
| `APPOINTMENT_CANCELLED` | Appointment | `{ appointmentId, reason }` |
| `APPOINTMENT_RESCHEDULED` | Appointment | `{ appointmentId }` |
| `LEAD_CREATED` | Lead | `{ leadId }` |
| `LEAD_CONVERTED` | Lead | `{ leadId }` |
| `LEAD_LOST` | Lead | `{ leadId, reason }` |
| `INVOICE_FINALIZED` | Invoice | `{ invoiceId }` |
| `PAYMENT_RECORDED` | Invoice | `{ invoiceId, amount }` |
| `CLINIC_PROFILE_UPDATED` | Clinic | `{ clinicId, changes }` |
| `PASSWORD_RESET_REQUESTED` | Staff | `{ staffId }` |
| `PASSWORD_RESET_COMPLETED` | Staff | `{ staffId }` |

---

# 6. GraphQL Resolver

```typescript
@Resolver()
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class AuditResolver {
  @RequirePermission('audit', 'view')
  @Query(() => AuditLogConnection)
  async auditLogs(
    @Args() args: AuditQueryArgs,
    @CurrentUser() user: TenantContext,
  ): Promise<AuditLogConnection> {
    return this.auditLogRepo.query({
      organizationId: user.organizationId,
      clinicId: args.clinicId ?? user.clinicId,
      action: args.action,
      staffId: args.staffId,
      entityId: args.entityId,
      from: args.from,
      to: args.to,
    }, args);
  }
}
```

---

# 7. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [
    AuditService,
    AuditLogRepository,
    AuditResolver,
  ],
  exports: [AuditService],
})
export class AuditModule {}
```

---
