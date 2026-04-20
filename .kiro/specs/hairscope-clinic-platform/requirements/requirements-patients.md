# Requirements Document — Patients Management

## Introduction

The Patients Management module covers the full lifecycle of patient records within the Hairscope Clinic Platform. It includes patient profile creation and management, medical document storage, analysis session lifecycle, image capture (global and trichoscopy), AI analysis, manual annotation editing, session questionnaires, product recommendations, and report generation. All patient data is subject to GDPR and HIPAA compliance requirements defined in the master requirements.

---

## Glossary

Refer to the master requirements glossary for platform-wide terms. Additional terms specific to this module:

- **Patient_Page**: The dedicated view for a single Patient, displaying their profile, analysis history, medical documents, and treatment progress graph.
- **Treatment_Progress_Graph**: A time-series chart plotting hair count, thickness, and coverage metrics across all completed Sessions for a Patient.
- **Session_Status**: The lifecycle state of a Session: Draft, Saved, Completed, or Deleted.
- **Global_Image_Position**: A predefined photographic angle for capturing hair photographs: Frontal, Crown, Occipital, Left, Right, or other positions from the predefined set.
- **Head_Diagram**: One of four predefined scalp diagrams (Front, Left, Right, Back) used to mark the capture position of a Trichoscopy_Image.
- **Annotation**: A Follicle or Strand marking placed on a Trichoscopy_Image, either by AI or by a Staff member.
- **Questionnaire_Category**: One of five structured groups of questions: Habits, Medical_Conditions, Physical_Shock, Hair_Styling, Genetics.
- **Stress_Questionnaire**: A separate set of approximately 10 questions used to calculate the Stress_O_Meter score.
- **Routine**: A recommended usage schedule for Products included in a Session recommendation.
- **Compare_View**: A side-by-side display of two Sessions for the same Patient, matching Trichoscopy_Images by head position.

---

## Requirements

### Requirement PAT-1: Patient Profile Creation and Management

**User Story:** As a Staff member with patient create permission, I want to create and manage patient profiles so that the clinic maintains accurate records for every patient.

#### Acceptance Criteria

1. THE Platform SHALL require the following fields when creating a Patient: First Name, Last Name, Email, Phone, Date of Birth, and Gender Assigned at Birth.
2. THE Platform SHALL accept an optional alphanumeric Patient ID field for mapping to external clinic systems.
3. WHEN a Patient record is created or updated, THE Platform SHALL auto-calculate and store the Patient's Age from the Date of Birth.
4. WHEN a Staff member attempts to create a Patient with an Email that already exists for another Patient in the same Clinic, THE Platform SHALL reject the creation and return a duplicate-patient error.
5. WHEN a Staff member attempts to create a Patient with a Phone number that already exists for another Patient in the same Clinic, THE Platform SHALL reject the creation and return a duplicate-patient error.
6. THE Platform SHALL NOT provide a delete or archive function for Patient records.
7. WHEN a Lead is converted to a Patient, THE Platform SHALL auto-populate the Patient profile fields with the corresponding Lead fields without requiring manual re-entry.
8. THE Platform SHALL allow Staff to search Patients by name on the patients list page.
9. WHEN a Patient profile is created or updated, THE Platform SHALL record the action in the Audit_Log.

#### Correctness Properties

- **Age consistency**: For any Patient P with Date of Birth D, the stored Age SHALL equal floor((current_date − D) / 365.25) at the time of record creation or update.
- **Email uniqueness per clinic**: For any two distinct Patient records P1 and P2 within the same Clinic, P1.email ≠ P2.email.
- **Phone uniqueness per clinic**: For any two distinct Patient records P1 and P2 within the same Clinic, P1.phone ≠ P2.phone.
- **Lead conversion completeness**: For any Lead L converted to Patient P, every field present in L that maps to a Patient field SHALL be present and equal in P immediately after conversion.
- **No deletion invariant**: For any Patient record P created at time T, P SHALL remain retrievable at all times T' > T unless a GDPR erasure request is processed.

---

### Requirement PAT-2: Patient Page and Treatment Progress

**User Story:** As a Doctor, I want to view a patient's full history on a single page so that I can assess treatment progress over time.

#### Acceptance Criteria

1. THE Patient_Page SHALL display the Patient's analysis history list, medical documents, and Treatment_Progress_Graph.
2. THE Treatment_Progress_Graph SHALL plot hair count, thickness, and coverage metrics across all completed Sessions for that Patient over time.
3. WHEN a new Session is completed for a Patient, THE Treatment_Progress_Graph SHALL include the new Session's metrics on the next load of the Patient_Page.
4. THE Treatment_Progress_Graph SHALL display Sessions in chronological order on the time axis.
5. THE Platform SHALL allow Staff to navigate from the Patient_Page to any individual Session in the analysis history.

#### Correctness Properties

- **Graph completeness**: The number of data points on the Treatment_Progress_Graph for metric M SHALL equal the number of completed Sessions for that Patient that contain a value for metric M.
- **Chronological order**: For any two Sessions S1 and S2 where S1.date < S2.date, S1 SHALL appear to the left of S2 on the Treatment_Progress_Graph time axis.

---

### Requirement PAT-3: Medical Documents

**User Story:** As a Staff member with document upload permission, I want to upload medical documents to a patient's profile so that all clinical records are stored in one place.

#### Acceptance Criteria

1. THE Platform SHALL accept image files (JPEG, PNG) and PDF files as medical document uploads.
2. IF a file upload exceeds 10 MB, THEN THE Platform SHALL reject the upload and return a file-size error.
3. WHEN a document is uploaded, THE Platform SHALL require a Title field and accept an optional Description field.
4. THE Platform SHALL store uploaded documents associated with the Patient's profile and display them on the Patient_Page.
5. THE Platform SHALL allow Staff with the appropriate permission to delete a medical document from a Patient's profile.
6. WHEN a medical document is uploaded or deleted, THE Platform SHALL record the action in the Audit_Log.

#### Correctness Properties

- **Size enforcement**: For any uploaded file F, if size(F) > 10 MB then the upload SHALL be rejected; if size(F) ≤ 10 MB and format is valid then the upload SHALL succeed.
- **Association invariant**: For any uploaded document D associated with Patient P, D SHALL appear on P's Patient_Page and SHALL NOT appear on any other Patient's page.

---

### Requirement PAT-4: Analysis Session Lifecycle

**User Story:** As a Staff member with session create permission, I want to create and manage analysis sessions for patients so that each clinical visit is fully documented.

#### Acceptance Criteria

1. THE Platform SHALL allow any Staff member with session create permission to create a Session for a Patient, either independently or from an Appointment.
2. WHEN a Session is created for a Patient who already has an active (Draft or Saved) Session, THE Platform SHALL reject the creation and return an error indicating an active Session already exists.
3. THE Platform SHALL persist Session data across logins until the Session is explicitly saved or deleted.
4. THE Platform SHALL support the following Session statuses: Draft, Saved, Completed, and Deleted.
5. WHEN a Staff member saves a Session, THE Platform SHALL lock the Session images and submit them for AI_Analysis, setting the status to Saved.
6. WHEN AI_Analysis is complete for a Saved Session, THE Platform SHALL set the Session status to Completed and generate the Report.
7. WHEN a Session is in Completed status, THE Platform SHALL prevent addition of new images to that Session.
8. WHEN a Session is in Completed status, THE Platform SHALL allow editing of questionnaire answers, product recommendations, and doctor's notes.
9. WHEN a Staff member deletes a Session that is in Draft status, THE Platform SHALL permanently remove all Session data.
10. IF a Staff member attempts to delete a Session that is in Saved or Completed status, THEN THE Platform SHALL reject the deletion.
11. WHEN a Session is created, saved, completed, or deleted, THE Platform SHALL record the action in the Audit_Log.

#### Correctness Properties

- **Single active session invariant**: For any Patient P at any point in time, the count of Sessions for P with status Draft or Saved SHALL be ≤ 1.
- **Deletion permanence**: After a Session is deleted, no Session data (images, answers, notes) SHALL be retrievable for that Session.
- **Status transition validity**: The only valid status transitions are: Draft → Saved, Saved → Completed, Draft → Deleted.
- **Image lock on save**: After a Session transitions from Draft to Saved, the count of images in that Session SHALL not change.

---

### Requirement PAT-5: Global Image Capture

**User Story:** As a Doctor, I want to capture standard hair photographs from predefined positions so that the AI can assess the patient's overall hair loss stage.

#### Acceptance Criteria

1. THE Platform SHALL support the following Global_Image positions: Frontal, Crown, Occipital, Left, Right, and additional positions from a predefined set.
2. THE Platform SHALL require at least one Frontal Global_Image before a Session can be saved.
3. THE Platform SHALL allow multiple Global_Images per position per Session.
4. WHEN Global_Images are submitted for AI_Analysis, THE AI_Analysis SHALL produce a hair loss stage classification for those images.
5. IF a Staff member attempts to save a Session without at least one Frontal Global_Image, THEN THE Platform SHALL reject the save and return a validation error.
6. THE Platform SHALL display each Global_Image with its associated position label on the Session page.

#### Correctness Properties

- **Frontal mandatory**: For any saved Session S, count(S.global_images where position = Frontal) ≥ 1.
- **Position label accuracy**: For any Global_Image G with position label L, L SHALL equal the position selected by the Staff member when G was captured.

---

### Requirement PAT-6: Trichoscopy Image Capture

**User Story:** As a Doctor, I want to capture exactly six trichoscopy images with positional markers so that the AI can perform detailed per-image hair analysis.

#### Acceptance Criteria

1. THE Platform SHALL require exactly 6 Trichoscopy_Images per Session before the Session can be saved.
2. WHEN capturing a Trichoscopy_Image, THE Platform SHALL present one of 4 predefined Head_Diagrams (Front, Left, Right, Back) and allow the user to place a single positional point on the diagram.
3. THE Platform SHALL store the positional point coordinates for each Trichoscopy_Image.
4. WHEN the Report is generated, THE Platform SHALL include the positional point for each Trichoscopy_Image.
5. WHEN Trichoscopy_Images are submitted for AI_Analysis, THE AI_Analysis SHALL produce hair count, density, and thickness values per image.
6. IF a Staff member attempts to save a Session with fewer or more than 6 Trichoscopy_Images, THEN THE Platform SHALL reject the save and return a validation error.

#### Correctness Properties

- **Trichoscopy count invariant**: For any saved Session S, count(S.trichoscopy_images) = 6.
- **Position stored**: For every Trichoscopy_Image T in a saved Session, T.position_coordinates SHALL be non-null.
- **AI output completeness**: For every Trichoscopy_Image T in a Completed Session, T SHALL have non-null values for hair_count, density, and thickness.

---

### Requirement PAT-7: AI Analysis (Asynchronous)

**User Story:** As a Doctor, I want to be notified when AI analysis is ready so that I can review and edit the results without waiting at the screen.

#### Acceptance Criteria

1. WHEN a Session is saved, THE Platform SHALL asynchronously submit all Session images to the AI_Analysis service.
2. WHEN AI_Analysis is complete, THE Platform SHALL notify the relevant Staff member via an in-app toaster notification on the web application.
3. WHEN AI_Analysis is complete, THE Platform SHALL notify the relevant Staff member via a push notification on the mobile application.
4. THE Platform SHALL allow Staff to manually refresh the Session page to check AI_Analysis status.
5. WHEN AI_Analysis is complete, THE Platform SHALL allow authorized Staff to review and edit the AI_Analysis results per Trichoscopy_Image.
6. IF the AI_Analysis service returns an error for a specific image, THEN THE Platform SHALL display an error indicator for that image and allow the Staff member to resubmit.

#### Correctness Properties

- **Notification delivery**: For any Session S where AI_Analysis completes, the Staff member who saved S SHALL receive at least one notification (in-app or push) within the platform's defined SLA.
- **Idempotent resubmission**: Resubmitting an image for AI_Analysis SHALL produce a result equivalent to the original submission for the same image content.

---

### Requirement PAT-8: Trichoscopy Image Annotation Editing

**User Story:** As a Doctor, I want to manually edit trichoscopy image annotations so that I can correct or supplement the AI-generated hair analysis.

#### Acceptance Criteria

1. THE Platform SHALL provide an edit page per Trichoscopy_Image accessible after AI_Analysis is complete.
2. THE Platform SHALL provide a Follicle tool that places a circle representing a Follicle on the image at the clicked position.
3. THE Platform SHALL provide a Strand tool that accepts three click points: point 1 (root), point 2 (direction), point 3 (thickness), and renders the Strand at the root position only.
4. THE Platform SHALL provide a Delete mode that, when active, removes any Follicle or Strand (AI-generated or human-drawn) clicked by the user.
5. THE Platform SHALL allow brightness and contrast adjustment per Trichoscopy_Image and SHALL persist those settings per image.
6. THE Platform SHALL support zoom and pan on the Trichoscopy_Image edit page.
7. THE Platform SHALL NOT provide undo or redo functionality on the edit page.
8. THE Platform SHALL NOT visually differentiate AI-generated Annotations from human-drawn Annotations on the edit page.
9. THE Platform SHALL record in the backend whether each Follicle and Strand is AI-generated or human-drawn for analytics purposes.
10. WHEN the Staff member saves edits on the edit page, THE Platform SHALL trigger Report regeneration and navigate the user to the view analysis page.

#### Correctness Properties

- **Annotation provenance**: For every Follicle F and Strand S stored in the backend, F.source ∈ {AI, Human} and S.source ∈ {AI, Human}.
- **Delete completeness**: After a Follicle or Strand is deleted in Delete mode, it SHALL NOT appear in subsequent renders of that Trichoscopy_Image.
- **Brightness/contrast persistence**: For any Trichoscopy_Image T with saved brightness B and contrast C, loading T on any subsequent session SHALL display B and C as the active values.
- **Strand geometry**: For any Strand drawn with points P1, P2, P3, the rendered Strand SHALL be positioned at P1 (root), oriented toward P2, with width proportional to the distance defined by P3.

---

### Requirement PAT-9: Session Questionnaire

**User Story:** As a Doctor, I want to administer a structured questionnaire during each session so that the platform can automatically determine the root cause of hair loss and calculate the patient's stress level.

#### Acceptance Criteria

1. THE Platform SHALL present questionnaire questions organized into 5 Questionnaire_Categories: Habits, Medical_Conditions, Physical_Shock, Hair_Styling, and Genetics.
2. THE Platform SHALL maintain exactly 5 active questions per Questionnaire_Category at all times.
3. THE Platform SHALL present a separate Stress_Questionnaire of approximately 10 questions per Session.
4. WHEN all questionnaire answers are submitted, THE Platform SHALL automatically calculate the Root_Cause of hair loss using the defined formula.
5. WHEN all Stress_Questionnaire answers are submitted, THE Platform SHALL calculate and display the Stress_O_Meter score using the defined formula.
6. THE Platform SHALL allow Clinic Admins to add custom questions to any Questionnaire_Category.
7. THE Platform SHALL allow Clinic Admins to toggle platform-provided default questions on or off per Questionnaire_Category.
8. WHEN a Clinic Admin adds or removes questions, THE Platform SHALL enforce that the total active questions per Questionnaire_Category remains exactly 5.
9. IF a Clinic Admin attempts to set the active question count for a Questionnaire_Category to a value other than 5, THEN THE Platform SHALL reject the change and return a validation error.
10. WHEN the Stress_O_Meter score meets the defined threshold, THE Platform SHALL trigger product suggestions relevant to stress-related hair loss.

#### Correctness Properties

- **Category count invariant**: For any Clinic C and any Questionnaire_Category K, count(active questions for C in K) = 5 at all times.
- **Root cause determinism**: For any two Sessions with identical questionnaire answers, the calculated Root_Cause SHALL be identical.
- **Stress score determinism**: For any two Sessions with identical Stress_Questionnaire answers, the calculated Stress_O_Meter score SHALL be identical.
- **Custom question toggle**: After a Clinic Admin toggles a default question off for category K, that question SHALL NOT appear in new Sessions for that Clinic, and the active count for K SHALL remain 5.

---

### Requirement PAT-10: Session Products and Doctor's Note

**User Story:** As a Doctor, I want to recommend products and add clinical notes to a session so that the patient receives a complete treatment plan in their report.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to link Products from the clinic's Product catalog to a Session as recommendations.
2. THE Platform SHALL allow Staff to associate a Routine (usage schedule) with each recommended Product.
3. THE Platform SHALL classify each recommended Product as either Cosmetic (no prescription required) or Medical (prescription required).
4. WHEN a Medical Product is included in a Session, THE Platform SHALL include a Prescription in the generated Report.
5. THE Platform SHALL provide a rich text editor for the Doctor to add a doctor's note to the Session.
6. THE Platform SHALL include the doctor's note in the generated Report.
7. WHEN a Session is in Completed status, THE Platform SHALL allow editing of product recommendations and the doctor's note.
8. WHEN product recommendations or the doctor's note are edited after Session completion, THE Platform SHALL trigger Report regeneration.

#### Correctness Properties

- **Prescription trigger**: For any Session S containing at least one Medical Product, the generated Report for S SHALL include a Prescription section.
- **Cosmetic no prescription**: For any Session S containing only Cosmetic Products (no Medical Products), the generated Report for S SHALL NOT include a Prescription section.

---

### Requirement PAT-11: Session Report Generation

**User Story:** As a Doctor, I want a PDF report to be automatically generated after each session so that I can share a professional summary with the patient.

#### Acceptance Criteria

1. WHEN a Session is saved and AI_Analysis is complete, THE Platform SHALL automatically generate a Report as a PDF on the server.
2. THE Report SHALL include: patient details, doctor details, clinic details, session date and time, all captured images with their positions, a summary of answered questionnaire questions, AI_Analysis results, doctor's note, product recommendations with Routine, and Prescription (if Medical Products are included).
3. THE Platform SHALL allow Staff to download the Report as a PDF.
4. THE Platform SHALL allow Staff to share the Report with the Patient via email.
5. THE Platform SHALL allow Staff to share the Report with the Patient via WhatsApp.
6. THE Platform SHALL generate a shareable link to the Report accessible within the platform.
7. WHEN any of the following are updated after Report generation — doctor's note, product recommendations, or trichoscopy annotations — THE Platform SHALL regenerate the Report to reflect the latest data.
8. THE Platform SHALL allow Staff to compare any two Sessions for the same Patient in a Compare_View.
9. WHEN comparing Trichoscopy_Images in the Compare_View, THE Platform SHALL only allow comparison of images from the same Head_Diagram position.

#### Correctness Properties

- **Report completeness**: For any completed Session S, the generated Report SHALL contain a non-empty value for each mandatory field (patient details, clinic details, session date, at least one image, AI analysis results).
- **Comparison position constraint**: For any Session comparison, every paired Trichoscopy_Image comparison SHALL satisfy image_1.position = image_2.position.
- **Report regeneration**: After any permitted post-completion edit E to Session S, the Report for S regenerated after E SHALL reflect the updated values from E.
- **Round-trip report link**: For any Report R generated for Session S, the shareable link for R SHALL resolve to the same Report content as the downloaded PDF for S.
