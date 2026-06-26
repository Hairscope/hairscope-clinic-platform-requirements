# Module 3: Patients — Frontend Tasks

> Implementation tasks for the Patients module frontend (patient CRUD, search, medical documents, treatment progress, GDPR erasure).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/patients`

### Task 1: Patient Service
- 1.1 Create `src/services/patient.service.ts`
- 1.2 Add PATIENTS_LIST query (pagination, search, filters)
- 1.3 Add GET_PATIENT query (full profile by ID)
- 1.4 Add CREATE_PATIENT mutation
- 1.5 Add UPDATE_PATIENT mutation
- 1.6 Add GDPR_ERASE_PATIENT mutation

### Task 2: Medical Documents Service
- 2.1 Create `src/services/medical-documents.service.ts`
- 2.2 Add GET_MEDICAL_DOCUMENTS query (by patientId)
- 2.3 Add UPLOAD_MEDICAL_DOCUMENT mutation (uses uploadFile)
- 2.4 Add DELETE_MEDICAL_DOCUMENT mutation

### Task 3: Treatment Progress Service
- 3.1 Add GET_TREATMENT_PROGRESS query to patient service (metrics over time)
- 3.2 Add GET_PATIENT_SESSIONS query (all sessions for a patient)

---

## Section 2: Custom Hooks

**Branch:** `feature/patients`

### Task 4: Patient List Hook
- 4.1 Create `src/hooks/usePatientList.ts`
- 4.2 Apollo useQuery with PATIENTS_LIST, page size 20
- 4.3 Cursor-based pagination (loadMore via fetchMore)
- 4.4 300ms debounced search by name
- 4.5 Return `{ patients, loading, error, hasNextPage, loadMore, setSearch, refetch }`

### Task 5: Patient Detail Hook
- 5.1 Create `src/hooks/usePatient.ts`
- 5.2 Fetch single patient by ID with useQuery
- 5.3 Return `{ patient, loading, error, refetch }`

### Task 6: Treatment Progress Hook
- 6.1 Create `src/hooks/useTreatmentProgress.ts`
- 6.2 Fetch progress metrics (hairCount, thickness, coverage over time)
- 6.3 Transform data for chart consumption
- 6.4 Return `{ chartData, loading, error }`

---

## Section 3: Pages

**Branch:** `feature/patients`

### Task 7: Patients List Page
- 7.1 Create `src/app/(dashboard)/patients/page.tsx`
- 7.2 Search bar with debounced input
- 7.3 Patient table with columns: Name, Email, Phone, Age, Gender, Actions
- 7.4 Create Patient button (opens modal)
- 7.5 Load More pagination button
- 7.6 Wrap in PermissionGate module="patients" action="view"

### Task 8: Patient Detail Page
- 8.1 Create `src/app/(dashboard)/patients/[id]/page.tsx`
- 8.2 Patient profile header (name, contact, age, gender, externalPatientId)
- 8.3 Tab navigation: Overview, Sessions, Documents
- 8.4 Overview tab: profile details + treatment progress graph
- 8.5 Sessions tab: session history list (all statuses)
- 8.6 Documents tab: medical documents grid
- 8.7 Edit profile button (opens edit form)

---

## Section 4: Module Components

**Branch:** `feature/patients`

### Task 9: Patient Table
- 9.1 Create `src/components/modules/patients/PatientTable.tsx`
- 9.2 @tanstack/react-table with columns: Name, Email, Phone, Age, Gender, Actions
- 9.3 Row click navigates to patient detail page
- 9.4 Actions dropdown: Edit, GDPR Erasure (admin only)

### Task 10: Create Patient Modal
- 10.1 Create `src/components/modules/patients/CreatePatientModal.tsx`
- 10.2 react-hook-form + zod: firstName, lastName, email required; genderAssignedAtBirth required
- 10.3 Optional fields: dateOfBirth, age, phone, externalPatientId
- 10.4 Auto-calculate age from dateOfBirth when provided
- 10.5 Call CREATE_PATIENT mutation
- 10.6 Error mapping: DUPLICATE_PATIENT_EMAIL, DUPLICATE_PATIENT_PHONE
- 10.7 On success: close modal, navigate to new patient page

### Task 11: Edit Patient Form
- 11.1 Create `src/components/modules/patients/EditPatientForm.tsx`
- 11.2 Pre-populated form with current patient data
- 11.3 Same validation as create (email, phone uniqueness handled by backend)
- 11.4 Call UPDATE_PATIENT mutation
- 11.5 Wrap in PermissionGate module="patients" action="edit"

### Task 12: Treatment Progress Graph
- 12.1 Create `src/components/modules/patients/TreatmentProgressGraph.tsx`
- 12.2 Time-series line chart (hairCount, thickness, coverage)
- 12.3 Only COMPLETED sessions plotted, chronological order
- 12.4 Tooltip with session date and metric values
- 12.5 Empty state when no completed sessions exist

### Task 13: Medical Documents Section
- 13.1 Create `src/components/modules/patients/MedicalDocuments.tsx`
- 13.2 Grid display of uploaded documents (thumbnail + title)
- 13.3 Upload button with file picker (all common modern image types incl. iPhone HEIC/HEIF, plus PDF; max 10MB)
- 13.4 Upload form: title (required), description (optional)
- 13.5 Delete document with confirmation dialog
- 13.6 Click to preview/download document

### Task 14: Session History List
- 14.1 Create `src/components/modules/patients/SessionHistoryList.tsx`
- 14.2 List all sessions: date, type, status badge, assigned staff
- 14.3 Status badges: DRAFT=warning, SAVED=info, COMPLETED=success
- 14.4 Click navigates to session detail page
- 14.5 Create Session button (for patients with no active draft)

### Task 15: GDPR Erasure Dialog
- 15.1 Create `src/components/modules/patients/GDPRErasureDialog.tsx`
- 15.2 Warning message: irreversible, anonymizes personal data
- 15.3 Explicit confirmation checkbox required
- 15.4 Call GDPR_ERASE_PATIENT mutation with `confirmed: true`
- 15.5 On success: redirect to patients list
- 15.6 Wrap trigger in PermissionGate (ClinicAdmin/OrgAdmin only)

---

## Section 5: Integration

**Branch:** `feature/patients`

### Task 16: Sidebar Navigation
- 16.1 Add Patients link to sidebar (/patients)
- 16.2 Wrap in PermissionGate module="patients" action="view"
- 16.3 Use Users icon for Patients
