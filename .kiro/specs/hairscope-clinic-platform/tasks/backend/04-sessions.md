# Module 4: Sessions — Backend Tasks (Rework)

**Branch:** `feature/sessions-rework`

> Reworked schema: separate collections for questionnaires, images, global analysis, rootpoints, hairstrands, and report data. No inline AI results on images. Frontend computes metrics from raw points.

---

### Task 1: Remove old session schemas
- [ ] 1.1 Remove `image-data.schema.ts` (replaced by `session-image.schema.ts`)
- [ ] 1.2 Remove inline `questionnaireAnswers` from session schema
- [ ] 1.3 Remove `reportUrl`, `reportGeneratedAt` from session schema
- [ ] 1.4 Remove AI result fields from image schema (`hairCount`, `density`, `thickness`, `coveragePercent`, `hairLossStage`)

### Task 2: Session schema update
- [ ] 2.1 Update `session.schema.ts` — keep only lifecycle fields (patientId, sessionType, status, assignedTo, appointmentId, doctorsNote, rootCause, stressScore, aiAnalysisStatus, aiAnalysisCompletedAt, savedAt, completedAt, deletedAt)
- [ ] 2.2 Verify existing indexes still apply
- [ ] 2.3 Update Session interface

### Task 3: Session questionnaire schema
- [ ] 3.1 Create `session-questionnaire.schema.ts` (sessionId, patientId, questionId, patientAnswer, questionType + base)
- [ ] 3.2 Add unique index `{ sessionId: 1, questionId: 1 }`
- [ ] 3.3 Create `SessionQuestionnaireRepository`

### Task 4: Session image schema (rework)
- [ ] 4.1 Create `session-image.schema.ts` with full field set (sessionId, patientId, sequence, imageType, imageUrl, globalPosition, headDiagram, trichoscopyLabel, trichoscopyNote, trichoscopyPositionX/Y, widthInMm, heightInMm, brightness, contrast, status, aiAnalysisStatus, aiAnalysisCompletedAt, failureReason, retriesRemaining)
- [ ] 4.2 Add indexes: `{ sessionId: 1, imageType: 1, sequence: 1 }`, `{ patientId: 1, imageType: 1, createdAt: -1 }`
- [ ] 4.3 Create `SessionImageRepository`

### Task 5: Global analysis data schema
- [ ] 5.1 Create `global-analysis-data.schema.ts` (sessionId, patientId, sessionImageId, model, hairlossScale, hairlossStage, hairCoverage, volumeRetained, highDensityZonePercent, midiumDensityZonePercent, lowDensityZonePercent, heatmapImagePath, overrides[], aiAnalysisStatus, aiAnalysisCompletedAt, failureReason, retriesRemaining, status)
- [ ] 5.2 Add unique index `{ sessionImageId: 1 }`
- [ ] 5.3 Create `GlobalAnalysisDataRepository`

### Task 6: Root points schema
- [ ] 6.1 Create `root-point.schema.ts` (sessionId, patientId, sessionImageId, imageType, model, x, y, source, status)
- [ ] 6.2 Add indexes: `{ sessionImageId: 1, status: 1 }`, `{ sessionId: 1, status: 1 }`
- [ ] 6.3 Create `RootPointRepository`

### Task 7: Hair strands schema
- [ ] 7.1 Create `hair-strand.schema.ts` (sessionId, patientId, sessionImageId, imageType, model, p1x, p1y, p2x, p2y, source, status)
- [ ] 7.2 Add indexes: `{ sessionImageId: 1, status: 1 }`, `{ sessionId: 1, status: 1 }`
- [ ] 7.3 Create `HairStrandRepository`

### Task 8: Report data schema
- [ ] 8.1 Create `report-data.schema.ts` (sessionId, patientId, reportUrl, reportVersion, reportGeneratedAt)
- [ ] 8.2 Add unique index `{ sessionId: 1 }`
- [ ] 8.3 Create `ReportDataRepository`

### Task 9: Module registration
- [ ] 9.1 Update `sessions.module.ts` to register all new schemas
- [ ] 9.2 Wire repositories into providers
- [ ] 9.3 Export necessary services

### Task 10: Update session service
- [ ] 10.1 Remove questionnaire logic from session service (now separate collection)
- [ ] 10.2 Create `SessionQuestionnaireService` (CRUD per question)
- [ ] 10.3 Create `SessionImageService` (add/remove/update adjustments)
- [ ] 10.4 Update session lifecycle (create/save/complete/delete) to work with new schema

### Task 11: Resolvers
- [ ] 11.1 Update `SessionResolver` to resolve images, questionnaires, analysis from new collections
- [ ] 11.2 Create `SessionImageResolver`
- [ ] 11.3 Create `GlobalAnalysisDataResolver`
- [ ] 11.4 Create `RootPointResolver` (query by sessionImageId, bulk add, soft delete)
- [ ] 11.5 Create `HairStrandResolver` (query by sessionImageId, bulk add, soft delete)
- [ ] 11.6 Create `ReportDataResolver`
