# Sessions

> Covers: Session lifecycle, session types, image capture, AI analysis, annotation editing, questionnaires, product recommendations, and report generation.
> Sessions are a sub-resource of Patients. A Session cannot exist without a Patient. Access to sessions requires `patients` module permission.
> Events emitted: `SessionSaved`, `SessionCompleted`, `SessionDeleted`, `AnnotationEditSaved`
> Events consumed: `AIAnalysisCompleted`, `AIAnalysisFailed`

---

## Glossary

- **Session**: A clinical treatment session for a Patient. Always belongs to exactly one Patient and one Clinic. Cannot exist without a Patient.
- **SessionType**: The type of treatment session. Determines the image capture requirements, questionnaire categories, AI analysis models, and report structure. Currently: `HAIR_ANALYSIS`. Future types may include `SKIN_TREATMENT`, `HAIR_REMOVAL`, etc.
- **SessionStatus**: `DRAFT` | `SAVED` | `COMPLETED` | `DELETED` - see `shared/enums.md`.
- **GlobalImage**: A standard photograph taken from a predefined position. Used for overall assessment (e.g., hair loss stage).
- **TrichoscopyImage**: A high-magnification scalp image captured with a trichoscope device. Used for detailed per-image analysis.
- **HeadDiagram**: One of four predefined scalp diagrams (`FRONT`, `LEFT`, `RIGHT`, `BACK`) used to mark the capture position of a TrichoscopyImage.
- **Annotation**: A Follicle or Strand marking placed on a TrichoscopyImage, either by AI or by a Staff member.
- **Follicle**: A hair follicle unit represented as a circle on a TrichoscopyImage.
- **Strand**: A hair strand drawn using a 3-point rectangle tool on a TrichoscopyImage.
- **QuestionnaireCategory**: A structured group of questions asked during a session. Categories vary by SessionType.
- **StressQuestionnaire**: A separate set of ~10 questions used to calculate the StressOMeter score. Applicable to `HAIR_ANALYSIS` sessions.
- **RootCause**: Automatically determined cause derived from questionnaire answers via a defined formula. Specific to `HAIR_ANALYSIS` sessions.
- **StressOMeter**: A calculated stress score derived from the StressQuestionnaire. Specific to `HAIR_ANALYSIS` sessions.
- **Routine**: A recommended usage schedule for a Product included in a Session recommendation.
- **CompareView**: Side-by-side display of two Sessions of the same type for the same Patient, matching images by position.
- **Prescription**: A formal medication order included in the Report when Medical Products are recommended.

---

## Session Type Architecture

Sessions are designed to be extensible. Each `sessionType` defines its own:
- Image capture requirements (positions, counts, mandatory positions)
- Questionnaire categories and question counts
- AI analysis models and output fields
- Report structure and content
- Progress tracking metrics

This document currently specifies the `HAIR_ANALYSIS` session type in full. Future session types (`SKIN_TREATMENT`, `HAIR_REMOVAL`, etc.) will be added as separate sections without modifying the core session lifecycle requirements (SES-1 through SES-4).

```
Session
  └── SessionType (HAIR_ANALYSIS | SKIN_TREATMENT | HAIR_REMOVAL | ...)
        └── Image Capture (type-specific positions and counts)
        └── Questionnaire (type-specific categories)
        └── AI Analysis (type-specific models)
        └── Report (type-specific structure)
```

---

## Permission Model

Sessions are a sub-resource of Patients. The `patients` module permission covers session access:

| Permission | What it covers |
|-----------|---------------|
| `patients.view` | View all sessions for a patient |
| `patients.create` | Create new sessions for a patient |
| `patients.edit` | Edit session content (questionnaire, products, doctor's note) after completion |
| `patients.delete` | Delete DRAFT sessions only |

Sessions cannot be accessed independently of a Patient. OrganizationAdmins do NOT have access to sessions in any Clinic (GI-8).

---

## Requirements

### SES-1: Session Lifecycle

**User Story:** As a Staff member with session create permission, I want to create and manage clinical sessions for patients so that each visit is fully documented.

#### Acceptance Criteria

1. THE Platform SHALL allow any Staff member with session create permission to create a Session for a Patient, either independently or from an Appointment.
2. WHEN creating a Session, THE Platform SHALL require a `sessionType` field specifying the type of treatment session.
3. WHEN a Session is created for a Patient who already has an active (`DRAFT`) Session of the same `sessionType` in the same Clinic, THE Platform SHALL reject the creation.
4. THE Platform SHALL persist Session data across logins until the Session is explicitly saved or deleted.
5. WHEN a Staff member saves a Session, THE Platform SHALL:
   - Run all save validations defined for the SessionType (see type-specific requirements below)
   - Lock the Session images (no new images can be added after save)
   - Set status to `SAVED`
   - Emit a `SessionSaved` event
6. WHEN `AIAnalysisCompleted` event is received for a `SAVED` Session, THE Platform SHALL set status to `COMPLETED` and emit `SessionCompleted`.
7. WHEN a Session is in `COMPLETED` status, THE Platform SHALL allow editing of: questionnaire answers, product recommendations, and doctor's notes.
8. WHEN a Staff member deletes a `DRAFT` Session, THE Platform SHALL permanently remove all Session data and emit `SessionDeleted`.
9. IF a Staff member attempts to delete a `SAVED` or `COMPLETED` Session, THE Platform SHALL reject the deletion (GI-14).
10. WHEN a Session is created, saved, completed, or deleted, THE Platform SHALL record the action in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Patient already has active DRAFT Session of same type | `ACTIVE_SESSION_EXISTS` |
| Delete attempted on SAVED or COMPLETED Session | `SESSION_NOT_DELETABLE` |
| Adding image to SAVED or COMPLETED Session | `SESSION_LOCKED` |
| Session not found | `SESSION_NOT_FOUND` |
| Invalid `sessionType` value | `VALIDATION_ERROR` (field: `sessionType`) |

#### Correctness Properties

- For any Patient P in Clinic C: count of Sessions with status `DRAFT` per `sessionType` ≤ 1 at any time.
- Valid status transitions: `DRAFT → SAVED`, `SAVED → COMPLETED`, `DRAFT → DELETED`.
- After a Session is deleted, no associated data SHALL be retrievable.
- After `DRAFT → SAVED`, the count of images in that Session SHALL NOT change.
- A Session SHALL always reference a valid Patient record. Sessions cannot exist without a Patient.

---

### SES-2: Session Products and Doctor's Note

**User Story:** As a Doctor, I want to recommend products and add clinical notes to a session so that the patient receives a complete treatment plan in their report.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to link Products from the clinic's Product catalog to a Session as recommendations.
2. THE Platform SHALL allow Staff to associate a Routine (usage schedule) with each recommended Product.
3. WHEN a Medical Product is included in a Session, THE Platform SHALL include a Prescription in the generated Report.
4. WHEN only Cosmetic Products are included, THE Platform SHALL NOT include a Prescription.
5. THE Platform SHALL provide a plain text editor for the Doctor to add a doctor's note to the Session.
6. THE Platform SHALL include the doctor's note in the generated Report.
7. WHEN a Session is in `COMPLETED` status, THE Platform SHALL allow editing of product recommendations and the doctor's note.
8. WHEN product recommendations or the doctor's note are edited after completion, THE Platform SHALL emit `AnnotationEditSaved` (with trigger `PRODUCT_EDIT` or `DOCTOR_NOTE_EDIT`) to trigger Report regeneration.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Product not found in Clinic catalog | `NOT_FOUND` |
| Editing products/notes on a DELETED Session | `SESSION_NOT_FOUND` |

#### Correctness Properties

- For any Session S containing at least one Medical Product: the generated Report SHALL include a Prescription section.
- For any Session S containing only Cosmetic Products: the generated Report SHALL NOT include a Prescription section.

---

### SES-3: Session Report Generation

**User Story:** As a Doctor, I want a PDF report to be automatically generated after each session so that I can share a professional summary with the patient.

#### Acceptance Criteria

1. WHEN a `SessionCompleted` event is received, THE Report Module SHALL generate a PDF Report on the server.
2. THE Report SHALL include: patient details, doctor details, clinic details, session date/time, all captured images with positions, questionnaire summary, AI analysis results, doctor's note, product recommendations with Routines, and Prescription (if Medical Products are included).
3. THE Platform SHALL allow Staff to download the Report as a PDF.
4. THE Platform SHALL allow Staff to share the Report with the Patient via email.
5. THE Platform SHALL allow Staff to share the Report with the Patient via WhatsApp.
6. THE Platform SHALL generate a shareable link to the Report accessible within the platform.
7. WHEN `AnnotationEditSaved` is received, THE Report Module SHALL regenerate the Report to reflect the latest data.
8. THE Platform SHALL allow Staff to compare any two Sessions of the same `sessionType` for the same Patient in a CompareView.
9. WHEN comparing images in the CompareView, THE Platform SHALL only allow comparison of images from the same position.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Report generation service unavailable | `SERVICE_UNAVAILABLE` (async - retried) |
| Report generation fails after max retries | `ASYNC_OPERATION_FAILED` |
| Comparing images from different positions | `VALIDATION_ERROR` |
| Session not found | `SESSION_NOT_FOUND` |
| Comparing sessions of different types | `VALIDATION_ERROR` |

#### Correctness Properties

- For any COMPLETED Session S, the generated Report SHALL contain non-empty values for all mandatory fields.
- For any Session comparison, every paired image comparison SHALL satisfy `image1.position = image2.position`.
- After any permitted post-completion edit E to Session S, the regenerated Report SHALL reflect the updated values from E.
- The shareable link for Report R SHALL resolve to the same content as the downloaded PDF for S.
- Sessions of different `sessionType` values SHALL NOT be compared in a CompareView.

---

### SES-4: AI Analysis (Asynchronous)

**User Story:** As a Doctor, I want to be notified when AI analysis is ready so that I can review and edit the results without waiting at the screen.

#### Acceptance Criteria

1. WHEN a `SessionSaved` event is emitted, THE AI Analysis Service SHALL asynchronously process all Session images using the models appropriate for the SessionType.
2. WHEN AI analysis is complete, THE Platform SHALL emit `AIAnalysisCompleted` and notify the relevant Staff member via:
   - In-app toaster notification (web)
   - Push notification (mobile)
3. THE Platform SHALL allow Staff to manually poll the Session status via the `asyncOperationStatus` query.
4. WHEN AI analysis is complete, THE Platform SHALL allow authorized Staff to review and edit the AI analysis results.
5. IF the AI analysis service fails after 3 retries, THE Platform SHALL emit `AIAnalysisFailed`, mark affected images with `FAILED` status, and notify the Staff member.
6. THE Platform SHALL allow Staff to manually resubmit a failed image for AI analysis.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| AI analysis service unavailable | `SERVICE_UNAVAILABLE` (async - notified via event) |
| AI analysis fails after max retries | `ASYNC_OPERATION_FAILED` (async - notified via event) |

#### Correctness Properties

- For any Session S where AI analysis completes, the Staff member who saved S SHALL receive at least one notification (in-app or push).
- Resubmitting an image for AI analysis SHALL produce a result equivalent to the original submission for the same image content.

---

## HAIR_ANALYSIS Session Type

> The following requirements (SES-HA-*) are specific to `sessionType = HAIR_ANALYSIS`. Future session types will have their own equivalent sections.

---

### SES-HA-1: Global Image Capture (Hair Analysis)

**User Story:** As a Doctor, I want to capture standard hair photographs from predefined positions so that the AI can assess the patient's overall hair loss stage.

#### Acceptance Criteria

1. THE Platform SHALL support the following `GlobalImagePosition` values for Hair Analysis sessions: `ANTERIOR`, `FRONTAL`, `RIGHT_LATERAL`, `LEFT_LATERAL`, `POSTERIOR`, `LEFT_TEMPORAL`, `RIGHT_TEMPORAL`, `SUPERIOR`, `TOP_OF_THE_HEAD`, `VERTEX` - see `shared/enums.md`.
2. THE Platform SHALL require at least one `FRONTAL` GlobalImage before a Hair Analysis Session can be saved (GI-16).
3. THE Platform SHALL allow exactly one GlobalImage per position per Session. If a position already has an image, the new image replaces the existing one.
4. WHEN GlobalImages are submitted for AI analysis, THE AI analysis SHALL produce a single overall hair loss stage classification based on all GlobalImages combined, using the `HAIRFALL_STAGE_MODEL`.
5. THE Platform SHALL display each GlobalImage with its associated position label.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Save attempted without FRONTAL image | `FRONTAL_IMAGE_REQUIRED` |

#### Correctness Properties

- For any saved Hair Analysis Session S: `count(S.globalImages where position = FRONTAL) = 1` (exactly one Frontal image required).
- For any saved Hair Analysis Session S: each position SHALL have at most one GlobalImage.
- For any GlobalImage G with position label L, L SHALL equal the position selected at capture time.

---

### SES-HA-2: Trichoscopy Image Capture (Hair Analysis)

**User Story:** As a Doctor, I want to capture trichoscopy images from all mandatory positions so that the AI can perform detailed per-image hair analysis and generate a complete hair score.

#### Acceptance Criteria

1. THE Platform SHALL require a minimum of 6 TrichoscopyImages per Hair Analysis Session before the Session can be saved, one from each of the following mandatory positions (GI-15):
   - **P1 - Frontal**
   - **P2 - Left Temporal**
   - **P3 - Right Temporal**
   - **P4 - Top of the Head**
   - **P5 - Crown**
   - **P6 - Occipital**
2. THE Platform SHALL allow Doctors to capture additional TrichoscopyImages beyond the 6 mandatory positions at their discretion.
3. WHEN capturing a TrichoscopyImage, THE Platform SHALL present one of 4 predefined HeadDiagrams (`FRONT`, `LEFT`, `RIGHT`, `BACK`) and allow the user to place a single positional point on the diagram.
4. THE Platform SHALL store the `(x, y)` positional point coordinates for each TrichoscopyImage.
5. WHEN the Report is generated, THE Platform SHALL include the positional point for each TrichoscopyImage.
6. WHEN TrichoscopyImages are submitted for AI analysis, THE AI analysis SHALL produce `hairCount`, `density`, and `thickness` values per image using the `HAIR_ROOT_MODEL`, `HAIR_STRAND_MODEL`, and `TRICHO_COVERAGE_MODEL`.
7. All 6 mandatory position images are required to generate the hair score in the report. IF any mandatory position is missing, THE Platform SHALL reject the session save.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Save attempted with fewer than 6 TrichoscopyImages | `TRICHOSCOPY_COUNT_INVALID` |
| One or more mandatory positions (P1–P6) missing | `TRICHOSCOPY_MANDATORY_POSITION_MISSING` |
| Missing positional point on a TrichoscopyImage | `VALIDATION_ERROR` (field: `position`) |

#### Correctness Properties

- For any saved Hair Analysis Session S: `count(S.trichoscopyImages) ≥ 6`.
- For any saved Hair Analysis Session S: all 6 mandatory positions (P1–P6) SHALL each have at least one TrichoscopyImage.
- For every TrichoscopyImage T in a saved Session: `T.positionCoordinates` is non-null.
- For every TrichoscopyImage T in a COMPLETED Session: `T.hairCount`, `T.density`, `T.thickness` are non-null.

---

### SES-HA-3: Trichoscopy Image Annotation Editing (Hair Analysis)

**User Story:** As a Doctor, I want to manually edit trichoscopy image annotations so that I can correct or supplement the AI-generated hair analysis.

#### Acceptance Criteria

1. THE Platform SHALL provide an edit page per TrichoscopyImage accessible after AI analysis is complete.
2. THE Platform SHALL provide a **Follicle tool**: click to place a circle (Follicle) at the clicked position.
3. THE Platform SHALL provide a **Strand tool**: 3-point rectangle - point 1 (root), point 2 (direction), point 3 (thickness). Strand is rendered at root position only.
4. THE Platform SHALL provide a **Delete mode**: when active, clicking any Follicle or Strand (AI-generated or human-drawn) removes it.
5. THE Platform SHALL allow brightness and contrast adjustment per TrichoscopyImage and SHALL persist those settings per image.
6. THE Platform SHALL support zoom and pan on the edit page.
7. THE Platform SHALL NOT provide undo or redo functionality.
8. THE Platform SHALL NOT visually differentiate AI-generated Annotations from human-drawn Annotations on the edit page.
9. THE Platform SHALL record in the backend whether each Follicle and Strand is `AI` or `HUMAN` sourced (see `shared/enums.md` `AnnotationSource`).
10. WHEN the Staff member saves edits, THE Platform SHALL emit `AnnotationEditSaved` and navigate the user to the view analysis page.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Editing annotations before AI analysis is complete | `FORBIDDEN` |
| Session not in COMPLETED status | `FORBIDDEN` |

#### Correctness Properties

- For every Follicle F and Strand S: `F.source ∈ {AI, HUMAN}` and `S.source ∈ {AI, HUMAN}`.
- After a Follicle or Strand is deleted, it SHALL NOT appear in subsequent renders of that TrichoscopyImage.
- For any TrichoscopyImage T with saved brightness B and contrast C, loading T on any subsequent view SHALL display B and C as the active values.
- For any Strand drawn with points P1, P2, P3: rendered at P1 (root), oriented toward P2, width proportional to distance defined by P3.

---

### SES-HA-4: Session Questionnaire (Hair Analysis)

**User Story:** As a Doctor, I want to administer a structured questionnaire during each hair analysis session so that the platform can automatically determine the root cause of hair loss and calculate the patient's stress level.

#### Acceptance Criteria

1. THE Platform SHALL present questions organized into 5 `QuestionnaireCategory` values for Hair Analysis: `DAILY_HABITS`, `MEDICAL_CONDITIONS`, `PHYSICAL_OR_EMOTIONAL_SHOCK`, `HAIRSTYLING_AND_TREATMENTS`, `GENETICS` - see `shared/enums.md`.
2. THE Platform SHALL maintain exactly 5 active questions per category per Clinic at all times (GI-18).
3. THE Platform SHALL present a separate `STRESS_TEST` questionnaire of ~10 questions per Hair Analysis Session.
4. WHEN all questionnaire answers are submitted, THE Platform SHALL automatically calculate `RootCause` using the defined formula.
5. WHEN all StressQuestionnaire answers are submitted, THE Platform SHALL calculate and display the `StressOMeter` score using the defined formula.
6. THE Platform SHALL allow ClinicAdmins to add custom questions to any category.
7. THE Platform SHALL allow ClinicAdmins to toggle platform-provided default questions on/off per category.
8. WHEN a ClinicAdmin adds or removes questions, THE Platform SHALL enforce that the total active questions per category remains exactly 5.
9. WHEN the StressOMeter score meets the defined threshold, THE Platform SHALL trigger product suggestions relevant to stress-related hair loss.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Adding question that would exceed 5 active per category | `VALIDATION_ERROR` |
| Toggling off question that would leave < 5 active per category | `VALIDATION_ERROR` |

#### Correctness Properties

- For any Clinic C and any Hair Analysis category K: `count(active questions for C in K) = 5` at all times.
- For any two Sessions with identical questionnaire answers, the calculated `RootCause` SHALL be identical.
- For any two Sessions with identical StressQuestionnaire answers, the calculated `StressOMeter` score SHALL be identical.
