# Sessions Module Implementation

> Covers: Trichoscopy session lifecycle (DRAFT → SAVED → COMPLETED), image capture, AI analysis integration, treatment plans, prescriptions, and digital signatures.

---

# 1. Module Structure

```text
packages/api/src/modules/sessions/
├── sessions.module.ts
├── entities/
│   ├── session.schema.ts
│   ├── treatment-plan.schema.ts
│   └── prescription.schema.ts
├── repositories/
│   ├── session.repository.ts
│   ├── treatment-plan.repository.ts
│   └── prescription.repository.ts
├── services/
│   ├── session.service.ts
│   ├── treatment-plan.service.ts
│   └── prescription.service.ts
├── resolvers/
│   ├── session.resolver.ts
│   ├── treatment-plan.resolver.ts
│   └── prescription.resolver.ts
├── dto/
│   ├── create-session.input.ts
│   ├── save-session.input.ts
│   ├── create-treatment-plan.input.ts
│   └── sign-document.input.ts
└── events/
    └── session-event.handler.ts
```

---

# 2. Session Schema

```typescript
const SessionSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, required: true, index: true },
  sessionType: { type: String, enum: ['HAIR_ANALYSIS', 'SELFIE_ANALYSIS'], required: true },
  status: {
    type: String,
    enum: ['DRAFT', 'SAVED', 'COMPLETED'],
    default: 'DRAFT',
  },
  doctorId: { type: Schema.Types.ObjectId, required: true },
  assignedTo: { type: Schema.Types.ObjectId, required: true, index: true },
  observations: { type: String },
  images: [{
    filePath: { type: String, required: true },
    region: { type: String },
    caption: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  }],
  aiAnalysis: {
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'] },
    findings: [{ type: String }],
    severity: { type: String },
    confidence: { type: Number },
    completedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },
  },
  reportUrl: { type: String },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  savedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

SessionSchema.index({ patientId: 1, sessionType: 1, status: 1 });
SessionSchema.index({ clinicId: 1, status: 1 });
```

---

# 3. Session Lifecycle

```typescript
@Injectable()
export class SessionService {
  async create(dto: CreateSessionDto, context: TenantContext): Promise<Session> {
    // Validate: only one DRAFT per patient per session type
    const existingDraft = await this.sessionRepo.findDraft(
      dto.patientId, dto.sessionType, context,
    );
    if (existingDraft) throw new DraftSessionExistsError();

    return this.sessionRepo.create({
      ...dto,
      status: 'DRAFT',
      doctorId: context.staffId,
      assignedTo: context.staffId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.staffId,
    });
  }

  async save(sessionId: string, dto: SaveSessionDto, context: TenantContext): Promise<Session> {
    const session = await this.sessionRepo.findById(sessionId, context);
    if (!session) throw new NotFoundError('Session');
    if (session.status !== 'DRAFT') throw new InvalidStateError('Session must be in DRAFT');

    const updated = await this.sessionRepo.update(sessionId, {
      ...dto,
      status: 'SAVED',
      savedAt: new Date(),
    }, context);

    // Emit SessionSaved → triggers AI analysis
    await this.outboxRepo.insert({
      eventType: 'SessionSaved',
      aggregateId: sessionId,
      aggregateType: 'Session',
      payload: {
        sessionId,
        patientId: session.patientId,
        imageUrls: updated.images.map(i => i.filePath),
        organizationId: context.organizationId,
        clinicId: context.clinicId,
      },
    });

    return updated;
  }

  async complete(sessionId: string, context: TenantContext): Promise<Session> {
    const session = await this.sessionRepo.findById(sessionId, context);
    if (!session) throw new NotFoundError('Session');
    if (session.status !== 'SAVED') throw new InvalidStateError('Session must be in SAVED');

    const session_tx = await this.connection.startSession();
    session_tx.startTransaction();

    try {
      const updated = await this.sessionRepo.update(sessionId, {
        status: 'COMPLETED',
        completedAt: new Date(),
      }, context, { session: session_tx });

      await this.auditService.append('SESSION_COMPLETED', { sessionId }, { session: session_tx });
      await this.outboxRepo.insert({
        eventType: 'SessionCompleted',
        aggregateId: sessionId,
        aggregateType: 'Session',
        payload: {
          sessionId,
          patientId: session.patientId,
          doctorId: session.doctorId,
          organizationId: context.organizationId,
          clinicId: context.clinicId,
        },
      }, { session: session_tx });

      await session_tx.commitTransaction();
      return updated;
    } catch (error) {
      await session_tx.abortTransaction();
      throw error;
    } finally {
      session_tx.endSession();
    }
  }
}
```

---

# 4. Treatment Plan Schema

The Treatment Plan is generated by the Recommendation Engine using AI analysis clinical findings. The flow is:

```text
AI Analysis Service → clinical findings → Recommendation Engine → treatment recommendations → TreatmentPlan → authorized staff verifies/signs
```

AI analysis does NOT directly recommend treatments. It provides clinical findings (severity, hair metrics, scalp conditions). The Recommendation Engine uses those findings to suggest a treatment plan.

```typescript
const TreatmentPlanSchema = new Schema({
  sessionId: { type: Schema.Types.ObjectId, required: true, index: true },
  patientId: { type: Schema.Types.ObjectId, required: true },
  diagnosis: { type: String, required: true },
  goals: [{ type: String }],
  lineItems: [{
    catalogItemId: { type: Schema.Types.ObjectId, required: true },
    itemName: { type: String, required: true },
    type: { type: String, enum: ['SERVICE', 'MEDICATION', 'COSMETIC', 'SUPPLEMENT'] },
    routine: {
      dosage: { type: String },
      frequency: { type: String },
      duration: { type: String },
      timeSlots: [{ type: String }],
      instructions: { type: String },
    },
  }],
  kits: [{
    kitId: { type: Schema.Types.ObjectId },
    name: { type: String },
    items: [{ type: Schema.Types.ObjectId }],
  }],
  nextReviewDate: { type: Date },
  status: { type: String, enum: ['DRAFT', 'SIGNED'], default: 'DRAFT' },
  signedAt: { type: Date },
  signedBy: { type: Schema.Types.ObjectId },
  pdfUrl: { type: String },
  editHistory: [{
    field: { type: String },
    previousValue: { type: String },
    newValue: { type: String },
    editedAt: { type: Date },
    editedBy: { type: Schema.Types.ObjectId },
  }],
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});
```

Each line item has its own `routine` (dosage, frequency, duration, timeSlots, instructions) — routines are per-item, not plan-level.

---

# 5. Digital Signature

```typescript
@Injectable()
export class TreatmentPlanService {
  async sign(planId: string, context: TenantContext): Promise<TreatmentPlan> {
    const plan = await this.treatmentPlanRepo.findById(planId, context);
    if (!plan) throw new NotFoundError('TreatmentPlan');
    if (plan.status === 'SIGNED') throw new AlreadySignedError();

    const session_tx = await this.connection.startSession();
    session_tx.startTransaction();

    try {
      const signed = await this.treatmentPlanRepo.update(planId, {
        status: 'SIGNED',
        signedAt: new Date(),
        signedBy: context.staffId,
      }, context, { session: session_tx });

      await this.auditService.append('TREATMENT_PLAN_SIGNED', { planId }, { session: session_tx });
      await this.outboxRepo.insert({
        eventType: 'TreatmentPlanSigned',
        aggregateId: planId,
        aggregateType: 'TreatmentPlan',
        payload: {
          planId,
          sessionId: plan.sessionId,
          patientId: plan.patientId,
          organizationId: context.organizationId,
          clinicId: context.clinicId,
        },
      }, { session: session_tx });

      await session_tx.commitTransaction();
      return signed;
    } catch (error) {
      await session_tx.abortTransaction();
      throw error;
    } finally {
      session_tx.endSession();
    }
  }
}
```

---

# 6. AI Analysis Event Handler

```typescript
@Injectable()
export class SessionEventHandler {
  @OnEvent('AIAnalysisCompleted')
  async handleAICompleted(event: AIAnalysisCompletedEvent): Promise<void> {
    if (await this.idempotencyStore.isDuplicate(event.eventId)) return;

    await this.sessionRepo.updateAIAnalysis(event.payload.sessionId, {
      status: 'COMPLETED',
      findings: event.payload.results.findings,
      severity: event.payload.results.severity,
      confidence: event.payload.confidence,
      completedAt: new Date(),
    });

    await this.idempotencyStore.markProcessed(event.eventId);
  }

  @OnEvent('AIAnalysisFailed')
  async handleAIFailed(event: AIAnalysisFailedEvent): Promise<void> {
    if (await this.idempotencyStore.isDuplicate(event.eventId)) return;

    await this.sessionRepo.updateAIAnalysis(event.payload.sessionId, {
      status: 'FAILED',
      failedAt: new Date(),
      failureReason: event.payload.reason,
    });

    await this.idempotencyStore.markProcessed(event.eventId);
  }
}
```

---

# 7. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: TreatmentPlan.name, schema: TreatmentPlanSchema },
      { name: Prescription.name, schema: PrescriptionSchema },
    ]),
  ],
  providers: [
    SessionService,
    TreatmentPlanService,
    PrescriptionService,
    SessionEventHandler,
    SessionRepository,
    TreatmentPlanRepository,
    PrescriptionRepository,
    SessionResolver,
    TreatmentPlanResolver,
    PrescriptionResolver,
  ],
  exports: [SessionService, SessionRepository],
})
export class SessionsModule {}
```

---
