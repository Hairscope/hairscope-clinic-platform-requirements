# Module 4: Sessions — Backend Tasks (Rework)

**Branch:** `feature/sessions-rework`

> Reworked schema: separate collections for questionnaires, images, global analysis, rootpoints, hairstrands, and report data. No inline AI results on images. The frontend computes metrics from raw points for on-screen display; the backend (Report Generation worker) computes the same metrics from raw points when rendering the PDF report. AI-produced data is editable (points/strands soft-delete + `HUMAN` additions; global values via `overrides[]`). The AI model identifier field is named **`aiModel`** (avoids Mongoose `Document.model` conflict).

---

### Task 1: Remove old session schemas
- 1.1 Remove `image-data.schema.ts` (replaced by `session-image.schema.ts`)
- 1.2 Remove inline `questionnaireAnswers` from session schema
- 1.3 Remove `reportUrl`, `reportGeneratedAt` from session schema
- 1.4 Remove AI result fields from image schema (`hairCount`, `density`, `thickness`, `coveragePercent`, `hairLossStage`)

### Task 2: Session schema update
- 2.1 Update `session.schema.ts` — keep only lifecycle fields (patientId, sessionType, status, assignedTo, appointmentId, doctorsNote, rootCause, stressScore, aiAnalysisStatus, aiAnalysisCompletedAt, savedAt, completedAt, deletedAt)
- 2.2 Verify existing indexes still apply
- 2.3 Update Session interface

### Task 3: Session questionnaire schema
- 3.1 Create `session-questionnaire.schema.ts` (sessionId, patientId, questionId, patientAnswer, questionType + base)
- 3.2 Add unique index `{ sessionId: 1, questionId: 1 }`
- 3.3 Create `SessionQuestionnaireRepository`

### Task 4: Session image schema (rework)
- 4.1 Create `session-image.schema.ts` with full field set (sessionId, patientId, sequence, imageType, imageUrl, globalPosition, headDiagram, trichoscopyLabel, trichoscopyNote, trichoscopyPositionX/Y, widthInMm, heightInMm, brightness, contrast, status, aiAnalysisStatus, aiAnalysisCompletedAt, failureReason, retriesRemaining)
- 4.2 Add indexes: `{ sessionId: 1, imageType: 1, sequence: 1 }`, `{ patientId: 1, imageType: 1, createdAt: -1 }`
- 4.3 Create `SessionImageRepository`

### Task 5: Global analysis data schema
- 5.1 Create `global-analysis-data.schema.ts` (sessionId, patientId, sessionImageId, aiModel, hairlossScale, hairlossStage, hairCoverage, volumeRetained, highDensityZonePercent, midiumDensityZonePercent, lowDensityZonePercent, heatmapImagePath, overrides[], aiAnalysisStatus, aiAnalysisCompletedAt, failureReason, retriesRemaining, status)
- 5.2 Add unique index `{ sessionImageId: 1 }`
- 5.3 Create `GlobalAnalysisDataRepository`

### Task 6: Root points schema
- 6.1 Create `root-point.schema.ts` (sessionId, patientId, sessionImageId, imageType, aiModel, x, y, source, status)
- 6.2 Add indexes: `{ sessionImageId: 1, status: 1 }`, `{ sessionId: 1, status: 1 }`
- 6.3 Create `RootPointRepository`

### Task 7: Hair strands schema
- 7.1 Create `hair-strand.schema.ts` (sessionId, patientId, sessionImageId, imageType, aiModel, p1x, p1y, p2x, p2y, source, status)
- 7.2 Add indexes: `{ sessionImageId: 1, status: 1 }`, `{ sessionId: 1, status: 1 }`
- 7.3 Create `HairStrandRepository`

### Task 8: Report data schema
- 8.1 Create `report-data.schema.ts` (sessionId, patientId, reportUrl, reportVersion, reportGeneratedAt)
- 8.2 Add unique index `{ sessionId: 1 }`
- 8.3 Create `ReportDataRepository`

### Task 9: Module registration
- 9.1 Update `sessions.module.ts` to register all new schemas
- 9.2 Wire repositories into providers
- 9.3 Export necessary services

### Task 10: Update session service
- 10.1 Remove questionnaire logic from session service (now separate collection)
- 10.2 Create `SessionQuestionnaireService` (CRUD per question)
- 10.3 Create `SessionImageService` (add/remove/update adjustments)
- 10.4 Update session lifecycle (create/save/complete/delete) to work with new schema

### Task 11: Resolvers
- 11.1 Update `SessionResolver` to resolve images, questionnaires, analysis from new collections
- 11.2 Create `SessionImageResolver`
- 11.3 Create `GlobalAnalysisDataResolver`
- 11.4 Create `RootPointResolver` (query by sessionImageId, bulk add, soft delete)
- 11.5 Create `HairStrandResolver` (query by sessionImageId, bulk add, soft delete)
- 11.6 Create `ReportDataResolver`

### Task 12: AI analysis services
- 12.1 Create `GlobalAnalysisService` (store structured AI values per global image; no LLM text)
- 12.2 Create `TrichoscopyAnalysisService` (bulk-insert AI `rootpoints` + `hairstrands` with `source: AI`)
- 12.3 Consume `AIAnalysisCompleted` / `AIAnalysisFailed`; update per-image and session `aiAnalysisStatus`

### Task 13: AI result editability (staff overrides)
- 13.1 Allow editing AI results after COMPLETED (AI accuracy is not guaranteed)
- 13.2 Points/strands: soft-delete (`status: DELETED`) + add new with `source: HUMAN` (preserve deleted for training)
- 13.3 Global analysis: append to `overrides[]` (field, previousValue, newValue, reason, overriddenBy, overriddenAt)
- 13.4 Record all edits in the AuditLog

### Task 14: Report generation
- 14.1 `ReportService` — manual "Generate Report" action (and regenerate); increments `reportVersion`
- 14.2 Report Generation worker computes metrics (hair count, density, thickness, coverage) from raw `rootpoints`/`hairstrands` server-side and renders the PDF (Typst)
- 14.3 Upload PDF to GCS via path convention `{org}/{clinic}/reports/{sessionId}/YYYY-MM-DD-v{N}.pdf`; update `reportdata.reportUrl`/`reportVersion`/`reportGeneratedAt`
- 14.4 Frontend fetches and displays the backend-generated PDF (no client-side report rendering)

### Task 15: Recommendations, Treatment Plan & Prescription
- 15.1 Store session recommendation references (catalog items / kits) with per-line-item routines
- 15.2 Treatment Plan / Prescription generation via the Catalog module (digital signature required) — see Module 7
- 15.3 Recommendation content/matching is produced by the Recommendation Engine (CustomTreatmentData + org `treatmentRecommendationMode`) — see Module 2 / engine design
