# Leads Module Implementation

> Covers: Lead lifecycle (NEW → CONTACTED → QUALIFIED → CONVERTED/LOST), lead sources, assignment, distribution engine, and conversion to patient.

---

# 1. Module Structure

```text
packages/api/src/modules/leads/
├── leads.module.ts
├── entities/
│   └── lead.schema.ts
├── repositories/
│   └── lead.repository.ts
├── services/
│   ├── lead.service.ts
│   └── lead-distribution.service.ts
├── resolvers/
│   └── lead.resolver.ts
├── dto/
│   ├── create-lead.input.ts
│   ├── update-lead.input.ts
│   └── convert-lead.input.ts
└── events/
    └── lead-event.handler.ts
```

---

# 2. Lead Schema

```typescript
const LeadSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
  source: { type: String, enum: ['MANUAL', 'WEBHOOK', 'SELFIE_ANALYSIS'], required: true },
  status: {
    type: String,
    enum: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'],
    default: 'NEW',
  },
  assignedTo: { type: Schema.Types.ObjectId, index: true },
  notes: { type: String },
  lostReason: { type: String },
  convertedToPatientId: { type: Schema.Types.ObjectId },
  convertedAt: { type: Date },
  selfieAnalysisData: { type: Schema.Types.Mixed },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

LeadSchema.index({ clinicId: 1, assignedTo: 1, status: 1 });
LeadSchema.index({ clinicId: 1, email: 1 });
```

---

# 3. Lead Service

```typescript
@Injectable()
export class LeadService {
  async create(dto: CreateLeadDto, context: TenantContext): Promise<Lead> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Auto-assign via Lead Distribution Engine
      const assignedTo = dto.assignedTo ??
        await this.leadDistributionService.assignLead(context);

      const lead = await this.leadRepo.create({
        ...dto,
        assignedTo,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        createdBy: context.staffId,
      }, { session });

      await this.auditService.append('LEAD_CREATED', { leadId: lead.id }, { session });
      await this.outboxRepo.insert({
        eventType: 'LeadCreated',
        aggregateId: lead.id,
        aggregateType: 'Lead',
        payload: { leadId: lead.id, clinicId: context.clinicId, assignedTo },
      }, { session });

      await session.commitTransaction();
      return lead;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async convert(leadId: string, context: TenantContext): Promise<Lead> {
    const lead = await this.leadRepo.findById(leadId, context);
    if (!lead) throw new NotFoundError('Lead');
    if (lead.status === 'CONVERTED') throw new LeadAlreadyConvertedError();
    if (lead.status === 'LOST') throw new LeadLostError();

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updated = await this.leadRepo.update(leadId, {
        status: 'CONVERTED',
        convertedAt: new Date(),
      }, context, { session });

      await this.auditService.append('LEAD_CONVERTED', { leadId }, { session });
      await this.outboxRepo.insert({
        eventType: 'LeadConverted',
        aggregateId: leadId,
        aggregateType: 'Lead',
        payload: {
          leadId,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          gender: lead.gender,
          convertedBy: context.staffId,
          organizationId: context.organizationId,
          clinicId: context.clinicId,
        },
      }, { session });

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async markLost(leadId: string, reason: string, context: TenantContext): Promise<Lead> {
    const lead = await this.leadRepo.findById(leadId, context);
    if (!lead) throw new NotFoundError('Lead');

    const updated = await this.leadRepo.update(leadId, {
      status: 'LOST',
      lostReason: reason,
    }, context);

    // Cancel any pending appointments for this lead
    await this.appointmentService.cancelByLead(leadId, context);

    await this.auditService.append('LEAD_LOST', { leadId, reason });
    return updated;
  }
}
```

---

# 4. Lead Distribution Engine

```typescript
@Injectable()
export class LeadDistributionService {
  async assignLead(context: TenantContext): Promise<string> {
    // Round-robin among active staff with leads.create permission
    const eligibleStaff = await this.staffRepo.findActiveWithPermission(
      'leads', 'create', context,
    );

    if (eligibleStaff.length === 0) return null;

    // Get current assignment counts
    const counts = await this.leadRepo.getAssignmentCounts(
      eligibleStaff.map(s => s.id), context,
    );

    // Assign to staff with fewest active leads
    const sorted = eligibleStaff.sort((a, b) =>
      (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0),
    );

    return sorted[0].id;
  }
}
```

---

# 5. Webhook Lead Creation

```typescript
@Controller('webhooks')
export class LeadWebhookController {
  @Post('leads')
  @UseGuards(ApiKeyGuard)
  async createFromWebhook(
    @Body() dto: WebhookLeadDto,
    @ApiKeyContext() apiKeyContext: { organizationId: string; clinicId: string },
  ): Promise<{ leadId: string }> {
    // Organization and clinic are resolved from the validated API key, not from headers
    const lead = await this.leadService.create({
      ...dto,
      source: 'WEBHOOK',
    }, {
      organizationId: apiKeyContext.organizationId,
      clinicId: apiKeyContext.clinicId,
      staffId: 'SYSTEM',
    });

    return { leadId: lead.id };
  }
}
```

The `ApiKeyGuard` validates the API key and resolves the associated organization and clinic. Org/clinic identity is never trusted from request headers.

---

# 6. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
    ]),
  ],
  providers: [
    LeadService,
    LeadDistributionService,
    LeadRepository,
    LeadResolver,
    LeadWebhookController,
    LeadEventHandler,
  ],
  exports: [LeadService, LeadRepository],
})
export class LeadsModule {}
```

---
