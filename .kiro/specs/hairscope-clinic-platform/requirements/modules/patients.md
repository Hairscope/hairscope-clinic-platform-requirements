# Patients Management

> Covers: Patient profiles, medical documents, analysis session lifecycle, image capture, AI analysis, annotation editing, questionnaires, product recommendations, and report generation.
> Events emitted: `SessionSaved`, `SessionCompleted`, `SessionDeleted`, `AnnotationEditSaved`
> Events consumed: `AIAnalysisCompleted`, `AIAnalysisFailed`, `LeadConverted`

---

## Glossary

- **Patient_Page**: The dedicated view for a single Patient showing profile, analysis history, medical documents, and treatment progress graph.
- **Treatment_Progress_Graph**: A time-series chart plotting hair count, thickness, and coverage metrics across all completed Sessions for a Patient.
- **Session**: An analysis session for a Patient containing images, questionnaire answers, AI analysis results, and a generated report.
- **Session_Status**: `DRAFT` | `SAVED` | `COMPLETED` | `DELETED` — see `shared/enums.md`.
- **Global_Image**: A standard hair photograph taken from a predefined position (Frontal, Crown, Occipital, Left, Right).
- **Trichoscopy_Image**: A high-magnification scalp image captured with a trichoscope device.
- **Head_Diagram**: One of four predefined scalp diagrams (Front, Left, Right, Back) used to mark the capture position of a Trichoscopy_Image.
- **Annotation**: A Follicle or Strand marking placed on a Trichoscopy_Image, either by AI or by a Staff member.
- **Follicle**: A hair follicle unit represented as a circle on a Trichoscopy_Image.
- **Strand**: A hair strand drawn using a 3-point rectangle tool on a Trichoscopy_Image.
- **Questionnaire_Category**: One of five structured question groups: `HABITS`, `MEDICAL_CONDITIONS`, `PHYSICAL_SHOCK`, `HAIR_STYLING`, `GENETICS`.
- **Stress_Questionnaire**: A separate set of ~10 questions used to calculate the Stress_O_Meter score.
- **Root_Cause**: Automatically determined hair-loss cause derived from questionnaire answers via a defined formula.
- **Stress_O_Meter**: A calculated stress score derived from the Stress_Questionnaire, displayed visually in the Session.
- **Routine**: A recommended usage schedule for a Product included in a Session recommendation.
- **Compare_View**: Side-by-side display of two Sessions for the same Patient, matching Trichoscopy_Images by head position.
- **Prescription**: A formal medication order included in the Report when Medical Products are recommended.

---

## Requirements

### PAT-1: Patient Profile

**User Story:** As a Staff member with patient create permission, I want to create and manage patient profiles so that the clinic maintains accurate records for every patient.

#### Acceptance Criteria

1. THE Platform SHALL require the following fields when creating a Patient: `firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `genderAssignedAtBirth`.
2. THE Platform SHALL accept an optional `externalPatientId` (alphanumeric) for mapping to external clinic systems.
3. WHEN a Patient record is created or updated, THE Platform SHALL auto-calculate and store `age` from `dateOfBirth`.
4. WHEN a Staff member attempts to create a Patient with an `email` that already exists for another Patient in the same Clinic, THE Platform SHALL reject the creation.
5. WHEN a Staff member attempts to create a Patient with a `phone` that already exists for another Patient in the same Clinic, THE Platform SHALL reject the creation.
6. THE Platform SHALL NOT expose a delete or archive mutation for Patient records.
7. WHEN a `LeadConverted` event is received, THE Platform SHALL auto-populate the Patient profile fields from the Lead's data without requiring manual re-entry.
8. THE Platform SHALL allow Staff to search Patients by name (first name, last name, or full name).
9. WHEN a Patient profile is created or updated, THE Platform SHALL record the action in the Audit_Log.
10. THE Platform SHALL allow the same physical person to have Patient records at multiple Clinics, including across different Organizations. There is no global uniqueness constraint on email or phone across Clinics.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing required field | `VALIDATION_ERROR` (field: specific field name) |
| Duplicate email within the same Clinic | `DUPLICATE_PATIENT_EMAIL` |
| Duplicate phone within the same Clinic | `DUPLICATE_PATIENT_PHONE` |
| Attempt to delete a Patient | `PATIENT_DELETE_NOT_ALLOWED` |
| Invalid date format for `dateOfBirth` | `INVALID_DATE_FORMAT` |

#### Correctness Properties

- For any Patient P with `dateOfBirth` D, stored `age` = `floor((current_date − D) / 365.25)` at time of creation or update.
- For any two distinct Patients P1 and P2 in the same Clinic: `P1.email ≠ P2.email` and `P1.phone ≠ P2.phone`.
- Two Patients in different Clinics MAY share the same email or phone — this is permitted and expected.
- For any Patient P created at time T, P SHALL remain retrievable at all times T' > T unless a GDPR erasure is processed.

---

### PAT-2: Patient Page and Treatment Progress

**User Story:** As a Doctor, I want to view a patient's full history on a single page so that I can assess treatment progress over time.

#### Acceptance Criteria

1. THE Patient_Page SHALL display: analysis history list, medical documents, and Treatment_Progress_Graph.
2. THE Treatment_Progress_Graph SHALL plot `hairCount`, `thickness`, and `coverage` metrics across all `SAVED` and `COMPLETED` Sessions in chronological order. `DRAFT` Sessions are excluded from the graph.
3. WHEN a new Session reaches `SAVED` or `COMPLETED` status, THE Treatment_Progress_Graph SHALL include its metrics on the next load.
4. THE Platform SHALL allow Staff to navigate from the Patient_Page to any individual Session in the history.

#### Correctness Properties

- Data points on the Treatment_Progress_Graph for metric M = count of `SAVED` or `COMPLETED` Sessions for that Patient containing a value for M. `DRAFT` Sessions are never included.
- For any two Sessions S1 and S2 where S1.date < S2.date, S1 SHALL appear to the left of S2 on the time axis.

---

### PAT-3: Medical Documents

**User Story:** As a Staff member with document upload permission, I want to upload medical documents to a patient's profile so that all clinical records are stored in one place.

#### Acceptance Criteria

1. THE Platform SHALL accept `image/jpeg`, `image/png`, and `application/pdf` files as medical document uploads via the file upload endpoint (see `shared/api-contracts.md` Section 8).
2. IF a file upload exceeds 10 MB, THE Platform SHALL reject the upload.
3. WHEN a document is uploaded, THE Platform SHALL require a `title` field and accept an optional `description` field.
4. THE Platform SHALL store uploaded documents associated with the Patient's profile.
5. THE Platform SHALL allow Staff with the appropriate permission to delete a medical document.
6. WHEN a medical document is uploaded or deleted, THE Platform SHALL record the action in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| File exceeds 10MB | `FILE_TOO_LARGE` |
| Invalid file type | `INVALID_FILE_TYPE` |
| Missing `title` | `VALIDATION_ERROR` (field: `title`) |
| Patient not found | `PATIENT_NOT_FOUND` |

#### Correctness Properties

- For any file F: if `size(F) > 10MB` → upload rejected; if `size(F) ≤ 10MB` and format valid → upload succeeds.
- For any document D associated with Patient P, D SHALL appear on P's page and SHALL NOT appear on any other Patient's page.

---

### PAT-4: Analysis Session Lifecycle

**User Story:** As a Staff member with session create permission, I want to create and manage analysis sessions for patients so that each clinical visit is fully documented.

#### Acceptance Criteria

1. THE Platform SHALL allow any Staff member with session create permission to create a Session for a Patient, either independently or from an Appointment.
2. WHEN a Session is created for a Patient who already has an active (`DRAFT` or `SAVED`) Session in the same Clinic, THE Platform SHALL reject the creation.
3. THE Platform SHALL persist Session data across logins until the Session is explicitly saved or deleted.
4. WHEN a Staff member saves a Session, THE Platform SHALL:
   - Validate that exactly 6 Trichoscopy_Images are present (GI-13)
   - Validate that at least one Frontal Global_Image is present (GI-14)
   - Lock the Session images (no new images can be added)
   - Set status to `SAVED`
   - Emit a `SessionSaved` event
5. WHEN `AIAnalysisCompleted` event is received for a `SAVED` Session, THE Platform SHALL set status to `COMPLETED` and emit `SessionCompleted`.
6. WHEN a Session is in `COMPLETED` status, THE Platform SHALL allow editing of: questionnaire answers, product recommendations, and doctor's notes.
7. WHEN a Staff member deletes a `DRAFT` Session, THE Platform SHALL permanently remove all Session data and emit `SessionDeleted`.
8. IF a Staff member attempts to delete a `SAVED` or `COMPLETED` Session, THE Platform SHALL reject the deletion.
9. WHEN a Session is created, saved, completed, or deleted, THE Platform SHALL record the action in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Patient already has active Session | `ACTIVE_SESSION_EXISTS` |
| Save attempted with ≠ 6 Trichoscopy_Images | `TRICHOSCOPY_COUNT_INVALID` |
| Save attempted without Frontal Global_Image | `FRONTAL_IMAGE_REQUIRED` |
| Delete attempted on SAVED or COMPLETED Session | `SESSION_NOT_DELETABLE` |
| Adding image to SAVED or COMPLETED Session | `SESSION_LOCKED` |
| Session not found | `SESSION_NOT_FOUND` |

#### Correctness Properties

- For any Patient P in Clinic C at any time: count of Sessions with status `DRAFT` or `SAVED` for P in C ≤ 1.
- Valid status transitions: `DRAFT → SAVED`, `SAVED → COMPLETED`, `DRAFT → DELETED`.
- After a Session is deleted, no associated data SHALL be retrievable.
- After `DRAFT → SAVED`, the count of images in that Session SHALL NOT change.

---

### PAT-5: Global Image Capture

**User Story:** As a Doctor, I want to capture standard hair photographs from predefined positions so that the AI can assess the patient's overall hair loss stage.

#### Acceptance Criteria

1. THE Platform SHALL support the following `GlobalImagePosition` values: `FRONTAL`, `CROWN`, `OCCIPITAL`, `LEFT`, `RIGHT`, `OTHER` — see `shared/enums.md`.
2. THE Platform SHALL require at least one `FRONTAL` Global_Image before a Session can be saved (GI-14).
3. THE Platform SHALL allow multiple Global_Images per position per Session.
4. WHEN Global_Images are submitted for AI analysis, THE AI analysis SHALL produce a hair loss stage classification per image.
5. THE Platform SHALL display each Global_Image with its associated position label.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Save attempted without FRONTAL image | `FRONTAL_IMAGE_REQUIRED` |
| Invalid position value | `VALIDATION_ERROR` (field: `position`) |

#### Correctness Properties

- For any saved Session S: `count(S.globalImages where position = FRONTAL) ≥ 1`.
- For any Global_Image G with position label L, L SHALL equal the position selected at capture time.

---

### PAT-6: Trichoscopy Image Capture

**User Story:** As a Doctor, I want to capture exactly six trichoscopy images with positional markers so that the AI can perform detailed per-image hair analysis.

#### Acceptance Criteria

1. THE Platform SHALL require exactly 6 Trichoscopy_Images per Session before the Session can be saved (GI-13).
2. WHEN capturing a Trichoscopy_Image, THE Platform SHALL present one of 4 predefined Head_Diagrams (`FRONT`, `LEFT`, `RIGHT`, `BACK`) and allow the user to place a single positional point on the diagram.
3. THE Platform SHALL store the `(x, y)` positional point coordinates for each Trichoscopy_Image.
4. WHEN the Report is generated, THE Platform SHALL include the positional point for each Trichoscopy_Image.
5. WHEN Trichoscopy_Images are submitted for AI analysis, THE AI analysis SHALL produce `hairCount`, `density`, and `thickness` values per image.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Save attempted with ≠ 6 Trichoscopy_Images | `TRICHOSCOPY_COUNT_INVALID` |
| Missing positional point on a Trichoscopy_Image | `VALIDATION_ERROR` (field: `position`) |

#### Correctness Properties

- For any saved Session S: `count(S.trichoscopyImages) = 6`.
- For every Trichoscopy_Image T in a saved Session: `T.positionCoordinates` is non-null.
- For every Trichoscopy_Image T in a COMPLETED Session: `T.hairCount`, `T.density`, `T.thickness` are non-null.

---

### PAT-7: AI Analysis (Asynchronous)

**User Story:** As a Doctor, I want to be notified when AI analysis is ready so that I can review and edit the results without waiting at the screen.

#### Acceptance Criteria

1. WHEN a `SessionSaved` event is emitted, THE AI Analysis Service SHALL asynchronously process all Session images.
2. WHEN AI analysis is complete, THE Platform SHALL emit `AIAnalysisCompleted` and notify the relevant Staff member via:
   - In-app toaster notification (web)
   - Push notification (mobile)
3. THE Platform SHALL allow Staff to manually poll the Session status via the `asyncOperationStatus` query.
4. WHEN AI analysis is complete, THE Platform SHALL allow authorized Staff to review and edit the AI analysis results per Trichoscopy_Image.
5. IF the AI analysis service fails after 3 retries, THE Platform SHALL emit `AIAnalysisFailed`, mark affected images with `FAILED` status, and notify the Staff member.
6. THE Platform SHALL allow Staff to manually resubmit a failed image for AI analysis.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| AI analysis service unavailable | `SERVICE_UNAVAILABLE` (async — notified via event) |
| AI analysis fails after max retries | `ASYNC_OPERATION_FAILED` (async — notified via event) |

#### Correctness Properties

- For any Session S where AI analysis completes, the Staff member who saved S SHALL receive at least one notification (in-app or push).
- Resubmitting an image for AI analysis SHALL produce a result equivalent to the original submission for the same image content.

---

### PAT-8: Trichoscopy Image Annotation Editing

**User Story:** As a Doctor, I want to manually edit trichoscopy image annotations so that I can correct or supplement the AI-generated hair analysis.

#### Acceptance Criteria

1. THE Platform SHALL provide an edit page per Trichoscopy_Image accessible after AI analysis is complete.
2. THE Platform SHALL provide a **Follicle tool**: click to place a circle (Follicle) at the clicked position.
3. THE Platform SHALL provide a **Strand tool**: 3-point rectangle — point 1 (root), point 2 (direction), point 3 (thickness). Strand is rendered at root position only.
4. THE Platform SHALL provide a **Delete mode**: when active, clicking any Follicle or Strand (AI-generated or human-drawn) removes it.
5. THE Platform SHALL allow brightness and contrast adjustment per Trichoscopy_Image and SHALL persist those settings per image.
6. THE Platform SHALL support zoom and pan on the edit page.
7. THE Platform SHALL NOT provide undo or redo functionality.
8. THE Platform SHALL NOT visually differentiate AI-generated Annotations from human-drawn Annotations on the edit page.
9. THE Platform SHALL record in the backend whether each Follicle and Strand is `AI` or `HUMAN` sourced (see `shared/enums.md` `AnnotationSource`).
10. WHEN the Staff member saves edits, THE Platform SHALL emit `AnnotationEditSaved` and navigate the user to the view analysis page.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Editing annotations before AI analysis is complete | `SESSION_NOT_FOUND` or `FORBIDDEN` |
| Session not in COMPLETED status | `FORBIDDEN` |

#### Correctness Properties

- For every Follicle F and Strand S: `F.source ∈ {AI, HUMAN}` and `S.source ∈ {AI, HUMAN}`.
- After a Follicle or Strand is deleted, it SHALL NOT appear in subsequent renders of that Trichoscopy_Image.
- For any Trichoscopy_Image T with saved brightness B and contrast C, loading T on any subsequent view SHALL display B and C as the active values.
- For any Strand drawn with points P1, P2, P3: rendered at P1 (root), oriented toward P2, width proportional to distance defined by P3.

---

### PAT-9: Session Questionnaire

**User Story:** As a Doctor, I want to administer a structured questionnaire during each session so that the platform can automatically determine the root cause of hair loss and calculate the patient's stress level.

#### Acceptance Criteria

1. THE Platform SHALL present questions organized into 5 `Questionnaire_Category` values: `HABITS`, `MEDICAL_CONDITIONS`, `PHYSICAL_SHOCK`, `HAIR_STYLING`, `GENETICS`.
2. THE Platform SHALL maintain exactly 5 active questions per category per Clinic at all times (GI-16).
3. THE Platform SHALL present a separate `STRESS` questionnaire of ~10 questions per Session.
4. WHEN all questionnaire answers are submitted, THE Platform SHALL automatically calculate `Root_Cause` using the defined formula.
5. WHEN all Stress_Questionnaire answers are submitted, THE Platform SHALL calculate and display the `Stress_O_Meter` score using the defined formula.
6. THE Platform SHALL allow Clinic_Admins to add custom questions to any category.
7. THE Platform SHALL allow Clinic_Admins to toggle platform-provided default questions on/off per category.
8. WHEN a Clinic_Admin adds or removes questions, THE Platform SHALL enforce that the total active questions per category remains exactly 5.
9. WHEN the Stress_O_Meter score meets the defined threshold, THE Platform SHALL trigger product suggestions relevant to stress-related hair loss.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Adding question that would exceed 5 active per category | `VALIDATION_ERROR` |
| Toggling off question that would leave < 5 active per category | `VALIDATION_ERROR` |

#### Correctness Properties

- For any Clinic C and any category K: `count(active questions for C in K) = 5` at all times.
- For any two Sessions with identical questionnaire answers, the calculated `Root_Cause` SHALL be identical.
- For any two Sessions with identical Stress_Questionnaire answers, the calculated `Stress_O_Meter` score SHALL be identical.

---

### PAT-10: Session Products and Doctor's Note

**User Story:** As a Doctor, I want to recommend products and add clinical notes to a session so that the patient receives a complete treatment plan in their report.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to link Products from the clinic's Product catalog to a Session as recommendations.
2. THE Platform SHALL allow Staff to associate a Routine (usage schedule) with each recommended Product.
3. WHEN a Medical Product is included in a Session, THE Platform SHALL include a Prescription in the generated Report.
4. WHEN only Cosmetic Products are included, THE Platform SHALL NOT include a Prescription.
5. THE Platform SHALL provide a rich text editor for the Doctor to add a doctor's note to the Session.
6. THE Platform SHALL include the doctor's note in the generated Report.
7. WHEN a Session is in `COMPLETED` status, THE Platform SHALL allow editing of product recommendations and the doctor's note.
8. WHEN product recommendations or the doctor's note are edited after completion, THE Platform SHALL emit `AnnotationEditSaved` (with trigger `PRODUCT_EDIT` or `DOCTOR_NOTE_EDIT`) to trigger Report regeneration.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Product not found in Clinic catalog | `NOT_FOUND` |
| Editing products/notes on non-COMPLETED Session | `FORBIDDEN` |

#### Correctness Properties

- For any Session S containing at least one Medical Product: the generated Report SHALL include a Prescription section.
- For any Session S containing only Cosmetic Products: the generated Report SHALL NOT include a Prescription section.

---

### PAT-11: Session Report Generation

**User Story:** As a Doctor, I want a PDF report to be automatically generated after each session so that I can share a professional summary with the patient.

#### Acceptance Criteria

1. WHEN a `SessionCompleted` event is received, THE Report Module SHALL generate a PDF Report on the server.
2. THE Report SHALL include: patient details, doctor details, clinic details, session date/time, all captured images with positions, questionnaire summary, AI analysis results, doctor's note, product recommendations with Routines, and Prescription (if Medical Products are included).
3. THE Platform SHALL allow Staff to download the Report as a PDF.
4. THE Platform SHALL allow Staff to share the Report with the Patient via email.
5. THE Platform SHALL allow Staff to share the Report with the Patient via WhatsApp.
6. THE Platform SHALL generate a shareable link to the Report accessible within the platform.
7. WHEN `AnnotationEditSaved` is received, THE Report Module SHALL regenerate the Report to reflect the latest data.
8. THE Platform SHALL allow Staff to compare any two Sessions for the same Patient in a Compare_View.
9. WHEN comparing Trichoscopy_Images in the Compare_View, THE Platform SHALL only allow comparison of images from the same `HeadDiagram` position.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Report generation service unavailable | `SERVICE_UNAVAILABLE` (async — retried) |
| Report generation fails after max retries | `ASYNC_OPERATION_FAILED` |
| Comparing images from different head positions | `VALIDATION_ERROR` |
| Session not found | `SESSION_NOT_FOUND` |

#### Correctness Properties

- For any COMPLETED Session S, the generated Report SHALL contain non-empty values for all mandatory fields.
- For any Session comparison, every paired Trichoscopy_Image comparison SHALL satisfy `image1.position = image2.position`.
- After any permitted post-completion edit E to Session S, the regenerated Report SHALL reflect the updated values from E.
- The shareable link for Report R SHALL resolve to the same content as the downloaded PDF for S.
