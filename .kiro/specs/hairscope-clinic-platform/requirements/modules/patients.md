# Patients

> Covers: Patient profile management, medical documents, treatment progress graph, global patient identity, and the patient-session relationship.
> Sessions are defined separately in `modules/sessions.md`. Sessions cannot exist without a Patient.
> Events emitted: none (patient module emits no domain events directly)
> Events consumed: `LeadConverted`

> **Out of scope:** Patient-facing features - including patient login, viewing reports, prescriptions, treatment history, and the Hairscope Care App - are NOT in scope for this document. These will be elaborated in a separate specification for the **Hairscope Care App**. The `globalPatientId` defined here is the linking key that will enable the Hairscope Care App to aggregate a patient's full cross-clinic treatment journey.

---

## Glossary

- **Patient**: A person receiving or having received treatment at a Clinic. Scoped to the Clinic where the record was created.
- **Patient_Page**: The dedicated view for a single Patient showing profile, analysis history, medical documents, and treatment progress graph.
- **Treatment_Progress_Graph**: A time-series chart plotting hair count, thickness, and coverage metrics across all `COMPLETED` Sessions for a Patient. Only `COMPLETED` Sessions contribute - `DRAFT` and `SAVED` Sessions are excluded.
- **globalPatientId**: A platform-wide UUID assigned to each unique physical person at Patient creation time, determined by email or phone lookup. Enables the **Hairscope Care App** to aggregate a patient's full cross-clinic treatment history. Never used for cross-clinic data access by Staff.
- **Medical_Document**: An image or PDF file uploaded to a Patient's profile with a title and optional description.
- **GDPR_Erasure**: The process of anonymizing a Patient's personal identifiers in response to a verified right-to-erasure request. Does not delete clinical data.

---

## Permission Model

Sessions are a sub-resource of Patients. A permission on the `patients` module implicitly covers session access within that patient's record. Sessions cannot be accessed without patient-level access.

| Permission | What it covers |
|-----------|---------------|
| `patients.view` | View patient profiles, medical documents, treatment progress graph, and all sessions for that patient |
| `patients.create` | Create new patient records |
| `patients.edit` | Edit patient profile fields |
| `patients.delete` | Not applicable - patients cannot be deleted (GDPR erasure only) |

Organization_Admins do NOT have access to the `patients` module in any Clinic (GI-8).

---

## Requirements

### PAT-1: Patient Profile

**User Story:** As a Staff member with patient create permission, I want to create and manage patient profiles so that the clinic maintains accurate records for every patient.

#### Acceptance Criteria

1. THE Platform SHALL require the following fields when creating a Patient: `firstName`, `lastName`, `email`, `phone`.
2. THE Platform SHALL accept the following optional fields: `dateOfBirth`, `age`, `genderAssignedAtBirth`, `externalPatientId` (alphanumeric, for mapping to external clinic systems).
3. WHEN `dateOfBirth` is provided, THE Platform SHALL auto-calculate and store `age` from `dateOfBirth`, overriding any manually entered `age` value.
4. WHEN `dateOfBirth` is not provided, THE Platform SHALL accept a manually entered `age` value.
5. WHEN neither `dateOfBirth` nor `age` is provided, both fields SHALL remain null on the Patient record.
6. WHEN a Staff member attempts to create a Patient with an `email` that already exists for another Patient in the same Clinic, THE Platform SHALL reject the creation.
7. WHEN a Staff member attempts to create a Patient with a `phone` that already exists for another Patient in the same Clinic, THE Platform SHALL reject the creation.
8. THE Platform SHALL NOT expose a delete or archive mutation for Patient records. Removal is only possible via GDPR erasure.
9. WHEN a `LeadConverted` event is received, THE Platform SHALL auto-populate the Patient profile fields from the Lead's data without requiring manual re-entry.
10. THE Platform SHALL allow Staff to search Patients by name (first name, last name, or full name).
11. WHEN a Patient profile is created or updated, THE Platform SHALL record the action in the Audit_Log.
12. THE Platform SHALL allow the same physical person to have Patient records at multiple Clinics, including across different Organizations. There is no global uniqueness constraint on email or phone across Clinics.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing required field | `VALIDATION_ERROR` (field: specific field name) |
| Duplicate email within the same Clinic | `DUPLICATE_PATIENT_EMAIL` |
| Duplicate phone within the same Clinic | `DUPLICATE_PATIENT_PHONE` |
| Attempt to delete a Patient | `PATIENT_DELETE_NOT_ALLOWED` |
| Invalid date format for `dateOfBirth` | `INVALID_DATE_FORMAT` |
| Staff attempting cross-clinic access via `globalPatientId` | `FORBIDDEN` |

#### Correctness Properties

- For any Patient P where `dateOfBirth` is provided: stored `age` = `floor((current_date − dateOfBirth) / 365.25)` at time of creation or update, overriding any manually entered value.
- For any Patient P where `dateOfBirth` is not provided: `age` reflects the manually entered value, or null if not entered.
- For any two distinct Patients P1 and P2 in the same Clinic: `P1.email ≠ P2.email` and `P1.phone ≠ P2.phone`.
- Two Patients in different Clinics MAY share the same email or phone - this is permitted and expected.
- For any Patient P created at time T, P SHALL remain retrievable at all times T' > T unless a GDPR erasure is processed.

---

### PAT-2: Global Patient Identity

**User Story:** As a patient, I want my complete treatment history across all clinics to be accessible in one place so that any clinic I visit has context about my full hair treatment journey.

#### Acceptance Criteria

1. THE Platform SHALL assign a `globalPatientId` (UUID v4) to every Patient record at creation time.
2. WHEN a new Patient is being created, THE Platform SHALL perform a global lookup by `email` and `phone` to check if a `globalPatientId` already exists for that person across any Clinic or Organization.
3. IF a matching `globalPatientId` is found, THE Platform SHALL assign it to the new Patient record.
4. IF no matching `globalPatientId` is found, THE Platform SHALL generate a new `globalPatientId` and assign it.
5. THE `globalPatientId` SHALL be stored on every Patient record but SHALL NOT be exposed in any Staff-facing GraphQL query that could be used to access records from other Clinics.
6. THE Platform SHALL reserve the `globalPatientId` exclusively for the **Hairscope Care App**, which will use it to aggregate the patient's full cross-clinic treatment journey. Patient-facing features are out of scope for this document.
7. WHEN a GDPR erasure is processed for a Patient record, THE Platform SHALL anonymize the personal identifiers on that specific Clinic's Patient record only. Records in other Clinics sharing the same `globalPatientId` are unaffected unless separate erasure requests are submitted.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Staff querying cross-clinic data via `globalPatientId` | `FORBIDDEN` |

#### Correctness Properties

- For any two Patient records P1 and P2 where `P1.email = P2.email` (across any Clinics): `P1.globalPatientId = P2.globalPatientId`.
- For any two Patient records P1 and P2 where `P1.phone = P2.phone` (across any Clinics): `P1.globalPatientId = P2.globalPatientId`.
- For any Staff member S in Clinic C, no GraphQL query SHALL return Patient records from Clinic C' (C ≠ C') regardless of shared `globalPatientId`.
- The `globalPatientId` lookup at creation time SHALL be atomic - concurrent Patient creations with the same email SHALL result in both records sharing the same `globalPatientId`, not two different ones.

---

### PAT-3: Patient Page and Treatment Progress

**User Story:** As a Doctor, I want to view a patient's full history on a single page so that I can assess treatment progress over time.

#### Acceptance Criteria

1. THE Patient_Page SHALL display: the patient profile, analysis history list (all Sessions), medical documents, and Treatment_Progress_Graph.
2. THE Treatment_Progress_Graph SHALL plot `hairCount`, `thickness`, and `coverage` metrics across all `COMPLETED` Sessions only, in chronological order. `DRAFT` and `SAVED` Sessions are excluded from the graph.
3. WHEN a new Session reaches `COMPLETED` status, THE Treatment_Progress_Graph SHALL include its metrics on the next load.
4. THE Platform SHALL allow Staff to navigate from the Patient_Page to any individual Session in the history.
5. THE Platform SHALL display all Sessions for a Patient regardless of status (DRAFT, SAVED, COMPLETED) in the analysis history list, but only COMPLETED Sessions contribute to the Treatment_Progress_Graph.

#### Correctness Properties

- Data points on the Treatment_Progress_Graph for metric M = count of `COMPLETED` Sessions for that Patient containing a value for M.
- For any two Sessions S1 and S2 where `S1.date < S2.date`, S1 SHALL appear to the left of S2 on the time axis.

---

### PAT-4: Medical Documents

**User Story:** As a Staff member with document upload permission, I want to upload medical documents to a patient's profile so that all clinical records are stored in one place.

#### Acceptance Criteria

1. THE Platform SHALL accept `image/jpeg`, `image/png`, and `application/pdf` files as medical document uploads via the file upload endpoint (see `shared/api-contracts.md` Section 8).
2. IF a file upload exceeds 10 MB, THE Platform SHALL reject the upload.
3. WHEN a document is uploaded, THE Platform SHALL require a `title` field and accept an optional `description` field.
4. THE Platform SHALL store uploaded documents associated with the Patient's profile and display them on the Patient_Page.
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

### PAT-5: GDPR Erasure

**User Story:** As a Clinic_Admin or Organization_Admin, I want to process a patient's right-to-erasure request so that the platform complies with GDPR obligations.

#### Acceptance Criteria

1. THE Platform SHALL allow a Clinic_Admin or Organization_Admin to trigger GDPR erasure for a specific Patient record within their Clinic or Organization.
2. WHEN erasure is triggered, THE Platform SHALL anonymize the following personal identifiers: `firstName`, `lastName`, `email`, `phone`, `dateOfBirth`, `age`, replacing them with anonymized placeholders.
3. Erasure SHALL NOT delete Session clinical data (images, AI analysis results, reports) - only personal identifiers are anonymized.
4. Erasure SHALL NOT affect Patient records in other Clinics that share the same `globalPatientId`. Each Clinic handles its own erasure independently.
5. THE Platform SHALL require explicit confirmation (`confirmed: true`) before proceeding with erasure.
6. Erasure is irreversible. THE Platform SHALL NOT provide an undo mechanism.
7. WHEN erasure is completed, THE Platform SHALL record the action in the Audit_Log with actor and timestamp.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Erasure attempted without confirmation | `CONFIRMATION_REQUIRED` |
| Patient not found | `PATIENT_NOT_FOUND` |
| Non-admin attempting erasure (regular Staff) | `FORBIDDEN` |

#### Correctness Properties

- After erasure, no query SHALL return the original personal identifiers for the erased Patient.
- Clinical data (sessions, images, reports) SHALL remain intact after erasure.
- Erasure of Patient P in Clinic C SHALL NOT affect any Patient record in Clinic C' (C ≠ C') even if they share the same `globalPatientId`.
