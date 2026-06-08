# Sessions Module Implementation

> Covers: Session lifecycle (DRAFT → SAVED → COMPLETED), questionnaires, image capture, Global Image AI Analysis, Trichoscopy AI Analysis (rootpoints + hairstrands), staff overrides via soft-delete + audit log, and server-side PDF report generation.

---

# 1. Module Structure

```text
packages/api/src/modules/sessions/
├── sessions.module.ts
├── entities/
│   ├── session.schema.ts
│   ├── session-questionnaire.schema.ts
│   ├── session-image.schema.ts
│   ├── global-analysis-data.schema.ts
│   ├── root-point.schema.ts
│   ├── hair-strand.schema.ts
│   ├── report-data.schema.ts
│   ├── treatment-plan.schema.ts
│   └── prescription.schema.ts
├── repositories/
│   ├── session.repository.ts
│   ├── session-questionnaire.repository.ts
│   ├── session-image.repository.ts
│   ├── global-analysis-data.repository.ts
│   ├── root-point.repository.ts
│   ├── hair-strand.repository.ts
│   ├── report-data.repository.ts
│   ├── treatment-plan.repository.ts
│   └── prescription.repository.ts
├── services/
│   ├── session.service.ts
│   ├── session-questionnaire.service.ts
│   ├── session-image.service.ts
│   ├── global-analysis.service.ts
│   ├── trichoscopy-analysis.service.ts
│   ├── report.service.ts
│   ├── treatment-plan.service.ts
│   └── prescription.service.ts
├── resolvers/
│   ├── session.resolver.ts
│   ├── session-image.resolver.ts
│   ├── global-analysis-data.resolver.ts
│   ├── root-point.resolver.ts
│   ├── hair-strand.resolver.ts
│   ├── report-data.resolver.ts
│   ├── treatment-plan.resolver.ts
│   └── prescription.resolver.ts
├── dto/
│   ├── create-session.input.ts
│   ├── save-session.input.ts
│   ├── add-image.input.ts
│   ├── add-root-point.input.ts
│   ├── add-hair-strand.input.ts
│   ├── regenerate-report.input.ts
│   ├── create-treatment-plan.input.ts
│   └── sign-document.input.ts
└── events/
    ├── session-event.handler.ts
    ├── ai-analysis-event.handler.ts
    └── report-event.handler.ts
```

---

# 2. Collection Schemas

## 2.1 Collection: `sessions`

Tracks session lifecycle, metadata, doctor's observation note, and questionnaire results (rootCause, stressScore). Images, AI analysis, annotations, and reports live in their own collections.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `patientId` | ObjectId | ✅ | ✅ | — | Patient this session belongs to |
| `sessionType` | String (enum) | ✅ | — | — | `HAIR_ANALYSIS`, `SKIN_TREATMENT`, `HAIR_REMOVAL`, `SCALP_TREATMENT`, `LASER_TREATMENT`, `CONSULTATION` |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `SAVED`, `COMPLETED`, `DELETED` |
| `assignedTo` | ObjectId | — | — | — | Staff member assigned |
| `appointmentId` | ObjectId | — | — | — | Linked appointment (optional) |
| `doctorsNote` | String | — | — | `''` | Doctor's observations |
| `rootCause` | String | — | — | — | Determined root cause (from questionnaire) |
| `stressScore` | Number | — | — | — | Computed stress score (from questionnaire) |
| `aiAnalysisStatus` | String (enum) | — | — | `PENDING` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `aiAnalysisCompletedAt` | Date | — | — | — | When AI finished for this session |
| `savedAt` | Date | — | — | — | When moved to SAVED |
| `completedAt` | Date | — | — | — | When completed |
| `deletedAt` | Date | — | — | — | When soft-deleted |
| + BaseSchemaFields |

**Indexes:**
- `{ patientId: 1, clinicId: 1, sessionType: 1, status: 1 }` — partial unique on `status: 'DRAFT'`
- `{ clinicId: 1, organizationId: 1, status: 1 }`
- `{ patientId: 1, status: 1 }`

---

## 2.2 Collection: `sessionquestionnaires`

One document per question-answer per session.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient |
| `questionId` | String | ✅ | — | — | Question identifier |
| `patientAnswer` | String | ✅ | — | — | Patient's answer |
| `questionType` | String | — | — | — | Question category/type |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionId: 1, questionId: 1 }` — unique per session per question

---

## 2.3 Collection: `sessionimages`

Stores all captured images — both global (selfie) and trichoscopy. Includes position metadata, capture dimensions, display adjustments, and per-image AI analysis status.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient (denormalized) |
| `sequence` | Number | — | — | `0` | Capture order |
| `imageType` | String (enum) | ✅ | ✅ | — | `GLOBAL`, `TRICHOSCOPY` |
| `imageUrl` | String | ✅ | — | — | GCS storage path |
| `globalPosition` | String (enum) | — | — | — | For GLOBAL: `ANTERIOR`, `FRONTAL`, `RIGHT_LATERAL`, `LEFT_LATERAL`, `POSTERIOR`, `LEFT_TEMPORAL`, `RIGHT_TEMPORAL`, `SUPERIOR`, `TOP_OF_THE_HEAD`, `VERTEX` |
| `headDiagram` | String (enum) | — | — | — | For TRICHOSCOPY: `TOP`, `BACK`, `LEFT`, `RIGHT` |
| `trichoscopyLabel` | String | — | — | — | For TRICHOSCOPY: user-defined label |
| `trichoscopyNote` | String | — | — | — | For TRICHOSCOPY: observation note per image |
| `trichoscopyPositionX` | Number | — | — | — | X% position on head diagram (0-100) |
| `trichoscopyPositionY` | Number | — | — | — | Y% position on head diagram (0-100) |
| `widthInMm` | Number | — | — | — | Physical width in mm (trichoscopy calibration) |
| `heightInMm` | Number | — | — | — | Physical height in mm |
| `brightness` | Number | — | — | `50` | 0-100 brightness adjustment |
| `contrast` | Number | — | — | `50` | 0-100 contrast adjustment |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| `aiAnalysisStatus` | String (enum) | — | — | `PENDING` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `aiAnalysisCompletedAt` | Date | — | — | — | When AI finished for this image |
| `failureReason` | String | — | — | — | Error if AI failed |
| `retriesRemaining` | Number | — | — | `3` | Auto-retry counter |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionId: 1, imageType: 1, sequence: 1 }`
- `{ patientId: 1, imageType: 1, createdAt: -1 }` — progress tracking across sessions

---

## 2.4 Collection: `globalanalysisdata`

One document per global image. Stores the AI analysis result (hair loss scale, stage, coverage metrics, heatmap). No LLM text — only structured values.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient (denormalized) |
| `sessionImageId` | ObjectId | ✅ | ✅ (unique) | — | Reference to `sessionimages._id` (1:1) |
| `model` | String | — | — | — | AI model identifier |
| `hairlossScale` | String | — | — | — | e.g., "Norwood", "Ludwig" |
| `hairlossStage` | String | — | — | — | e.g., "Stage 3", "Type II" |
| `hairCoverage` | Number | — | — | — | Overall hair coverage % |
| `volumeRetained` | Number | — | — | — | Volume retained % |
| `highDensityZonePercent` | Number | — | — | — | High density zone % |
| `midiumDensityZonePercent` | Number | — | — | — | Medium density zone % |
| `lowDensityZonePercent` | Number | — | — | — | Low density zone % |
| `heatmapImagePath` | String | — | — | — | GCS path to heatmap overlay image |
| `overrides` | Array | — | — | — | Staff override audit trail |
| `overrides[].field` | String | ✅ | — | — | Field path overridden |
| `overrides[].previousValue` | Mixed | — | — | — | Value before override |
| `overrides[].newValue` | Mixed | ✅ | — | — | Value after override |
| `overrides[].reason` | String | — | — | — | Staff's reason |
| `overrides[].overriddenBy` | ObjectId | ✅ | — | — | Staff who overrode |
| `overrides[].overriddenAt` | Date | ✅ | — | — | When override happened |
| `aiAnalysisStatus` | String (enum) | — | — | `PENDING` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `aiAnalysisCompletedAt` | Date | — | — | — | When AI finished |
| `failureReason` | String | — | — | — | Error if FAILED |
| `retriesRemaining` | Number | — | — | `3` | Auto-retry counter |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionImageId: 1 }` — **unique**
- `{ sessionId: 1, aiAnalysisStatus: 1 }`
- `{ patientId: 1, aiAnalysisStatus: 1 }`

---

## 2.5 Collection: `rootpoints`

One document per detected/added follicle point. Stored from root detection AI model or added manually by staff. Soft-deleted points preserved for AI training.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | — | — | Patient |
| `sessionImageId` | ObjectId | ✅ | ✅ | — | Reference to `sessionimages._id` |
| `imageType` | String (enum) | ✅ | — | — | `TRICHOSCOPY` (future: `GLOBAL`) |
| `model` | String | — | — | — | AI model identifier |
| `x` | Number | ✅ | — | — | X coordinate (normalized 0-1) |
| `y` | Number | ✅ | — | — | Y coordinate (normalized 0-1) |
| `source` | String (enum) | ✅ | — | — | `AI`, `HUMAN` |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionImageId: 1, status: 1 }`
- `{ sessionId: 1, status: 1 }`

---

## 2.6 Collection: `hairstrands`

One document per detected/added hair strand. Stored from strand detection AI model or added manually by staff. Uses two points (p1, p2) to define the strand segment.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | — | — | Patient |
| `sessionImageId` | ObjectId | ✅ | ✅ | — | Reference to `sessionimages._id` |
| `imageType` | String (enum) | ✅ | — | — | `TRICHOSCOPY` (future: `GLOBAL`) |
| `model` | String | — | — | — | AI model identifier |
| `p1x` | Number | ✅ | — | — | Root point X (normalized 0-1) |
| `p1y` | Number | ✅ | — | — | Root point Y (normalized 0-1) |
| `p2x` | Number | ✅ | — | — | End point X (normalized 0-1) |
| `p2y` | Number | ✅ | — | — | End point Y (normalized 0-1) |
| `source` | String (enum) | ✅ | — | — | `AI`, `HUMAN` |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionImageId: 1, status: 1 }`
- `{ sessionId: 1, status: 1 }`

---

## 2.7 Collection: `reportdata`

One document per session. Tracks report configuration and versioned PDF generation. Old PDFs accessible via GCS path convention: `{org}/{clinic}/reports/{sessionId}/YYYY-MM-DD-v{version}.pdf`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ (unique) | — | Parent session (1:1) |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient |
| `reportUrl` | String | — | — | — | GCS path to latest PDF |
| `reportVersion` | Number | — | — | `0` | Increments on every regeneration |
| `reportGeneratedAt` | Date | — | — | — | When last PDF was generated |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionId: 1 }` — **unique**
- `{ patientId: 1 }`

**PDF Path Convention:**
```
{organizationId}/{clinicId}/reports/{sessionId}/YYYY-MM-DD-v{version}.pdf
```
Previous versions remain in GCS. Only the latest version number is stored in MongoDB. Frontend can construct URLs for any version by replacing `v{N}`.

---

# 3. Session Lifecycle

```text
DRAFT → SAVED → COMPLETED
  ↓
DELETED (soft-delete from DRAFT only)
```

## 3.1 Create Session

```typescript
async create(dto: CreateSessionInput, context: TenantContext): Promise<Session> {
  // One DRAFT per patient per sessionType per clinic
  const existingDraft = await this.sessionRepo.findDraft(
    dto.patientId, dto.sessionType, context,
  );
  if (existingDraft) throw new DraftSessionExistsError();

  return this.sessionRepo.create({
    ...dto,
    status: 'DRAFT',
    aiAnalysisStatus: 'PENDING',
    assignedTo: context.staffId,
    organizationId: context.organizationId,
    clinicId: context.clinicId,
    createdBy: context.staffId,
  });
}
```

## 3.2 Save Session (triggers AI)

```typescript
async save(sessionId: string, context: TenantContext): Promise<Session> {
  const session = await this.sessionRepo.findById(sessionId, context);
  if (session.status !== 'DRAFT') throw new InvalidStateError('Session must be in DRAFT');

  // Atomic: update session + audit + outbox
  const dbSession = await this.connection.startSession();
  dbSession.startTransaction();

  try {
    const updated = await this.sessionRepo.update(sessionId, {
      status: 'SAVED',
      aiAnalysisStatus: 'PROCESSING',
      savedAt: new Date(),
    }, context, { session: dbSession });

    await this.auditService.append('SESSION_SAVED', { sessionId }, context, { session: dbSession });
    await this.outboxRepo.insert({
      eventType: 'SessionSaved',
      aggregateId: sessionId,
      payload: { sessionId, patientId: session.patientId, clinicId: context.clinicId },
    }, { session: dbSession });

    await dbSession.commitTransaction();
    return updated;
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}
```

---

# 4. AI Analysis Flow

## 4.1 Global Image Analysis

```text
SessionSaved event
  → Worker picks up
  → For each global image (parallel):
      - Call model.hairscope.ai global analysis API
      - Store structured results in globalanalysisdata
      - Mark sessionimage.aiAnalysisStatus = COMPLETED
  → When all global images done → emit GlobalAnalysisCompleted
```

## 4.2 Trichoscopy Analysis

```text
SessionSaved event
  → Worker picks up
  → For each trichoscopy image (parallel with concurrency limit):
      - Step 1: Root detection → bulk insert into rootpoints (source: AI)
      - Step 2: Strand detection → bulk insert into hairstrands (source: AI)
      - Mark sessionimage.aiAnalysisStatus = COMPLETED
  → When all trichoscopy images done:
      - Update session.aiAnalysisStatus = COMPLETED
      - Emit TrichoscopyAnalysisCompleted
```

---

# 5. Staff Overrides

**Global analysis overrides:** Use the `overrides[]` array on `globalanalysisdata`. Doctor edits a field value directly; the override records previous value, new value, reason, and who/when.

**Trichoscopy point overrides:** Use `status: DELETED` soft-delete on `rootpoints` / `hairstrands` (preserves data for AI training). Staff can add new points with `source: HUMAN`. The `createdBy`, `updatedBy`, `createdAt`, `updatedAt` fields on each document provide full attribution. Audit log captures all add/delete actions.

---

# 6. Report Generation

- User clicks "Regenerate Report" button
- Backend increments `reportVersion`, generates PDF via Typst
- Uploads to GCS at: `{org}/{clinic}/reports/{sessionId}/YYYY-MM-DD-v{N}.pdf`
- Updates `reportdata.reportUrl` and `reportdata.reportGeneratedAt`
- Previous versions remain accessible in GCS (no DB history array needed)

---

# 7. Frontend Metrics (Computed Client-Side)

The frontend computes all metrics from raw points already loaded for annotation rendering:

- **Hair count** = `count(rootpoints WHERE status=ACTIVE AND sessionImageId=X)`
- **Strand count** = `count(hairstrands WHERE status=ACTIVE AND sessionImageId=X)`
- **Average thickness** = computed from strand lengths
- **Density** = hairCount / calibrated area (from widthInMm × heightInMm)
- **Coverage** = from `globalanalysisdata.hairCoverage`

No backend aggregation needed for these — the data is always queried for the annotation view anyway.

---

# 8. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Session', schema: SessionSchema },
      { name: 'SessionQuestionnaire', schema: SessionQuestionnaireSchema },
      { name: 'SessionImage', schema: SessionImageSchema },
      { name: 'GlobalAnalysisData', schema: GlobalAnalysisDataSchema },
      { name: 'RootPoint', schema: RootPointSchema },
      { name: 'HairStrand', schema: HairStrandSchema },
      { name: 'ReportData', schema: ReportDataSchema },
      { name: 'TreatmentPlan', schema: TreatmentPlanSchema },
      { name: 'Prescription', schema: PrescriptionSchema },
    ]),
    BullModule.registerQueue(
      { name: 'global-analysis' },
      { name: 'trichoscopy-analysis' },
      { name: 'report-generation' },
    ),
  ],
  providers: [
    // Services
    SessionService,
    SessionQuestionnaireService,
    SessionImageService,
    GlobalAnalysisService,
    TrichoscopyAnalysisService,
    ReportService,
    TreatmentPlanService,
    PrescriptionService,
    // Workers
    GlobalAnalysisWorker,
    TrichoscopyAnalysisWorker,
    ReportGenerationWorker,
    // Resolvers
    SessionResolver,
    SessionImageResolver,
    GlobalAnalysisDataResolver,
    RootPointResolver,
    HairStrandResolver,
    ReportDataResolver,
    TreatmentPlanResolver,
    PrescriptionResolver,
    // Repositories
    SessionRepository,
    SessionQuestionnaireRepository,
    SessionImageRepository,
    GlobalAnalysisDataRepository,
    RootPointRepository,
    HairStrandRepository,
    ReportDataRepository,
    TreatmentPlanRepository,
    PrescriptionRepository,
  ],
  exports: [SessionService, SessionRepository, SessionImageRepository],
})
export class SessionsModule {}
```
