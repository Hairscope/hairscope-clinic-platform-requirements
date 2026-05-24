# Module: Patients

> Covers: Patient aggregate, patient lifecycle, global identity linkage, medical documents, and cross-module relationships.

---

# 1. Purpose

The Patients module represents a person receiving treatment within a Clinic.

It is the clinical identity anchor for all patient-related activity within the platform.

The Patients module owns:

- patient profile  
- medical documents  
- treatment progress view  
- patient-level access boundary  
- clinic-scoped patient identity  
- clinic-local GDPR erasure state  

Sessions are a sub-resource of Patients
and cannot exist without a valid Patient.

---

# 2. Responsibilities

The Patients module SHALL:

- create and manage Patient records  
- maintain clinic-scoped patient identity  
- enforce Patient invariants  
- manage medical documents associated with a Patient  
- provide treatment progress views derived from completed Sessions  
- support GDPR erasure of personal identifiers  
- define access boundaries for Patient-owned resources, including Sessions  

The Patients module SHALL NOT:

- manage Session lifecycle  
- perform AI analysis  
- generate reports  
- manage appointments  
- manage billing  

---

# 3. Aggregate

## 3.1 Patient (Aggregate Root)

The Patient aggregate represents a person receiving treatment
within a specific Clinic.

A Patient is scoped to exactly one Clinic.

A Patient may represent the same physical person as Patients
in other Clinics through a platform-wide linking identity,
but clinical ownership remains clinic-scoped.

The Patient aggregate is the authoritative source of:

- patient identity within a Clinic  
- patient profile state  
- patient erasure state  
- patient-owned medical documents  

---

# 4. Entities

The Patient aggregate SHALL contain:

- Patient  
- MedicalDocument  

Sessions are related records, but Sessions are owned by the Sessions module.

---

# 5. Value Objects

The Patient aggregate MAY use value objects, including:

- PatientName  
- ContactInformation  
- DateOfBirth  
- Age  
- GenderAssignedAtBirth  
- ExternalPatientIdentifier  
- ErasureState  

---

# 6. Invariants

The system SHALL ensure:

- A Patient belongs to exactly one Clinic  
- A Patient belongs to exactly one Organization through that Clinic  
- A Patient SHALL have an email address
- No two Patients within the same Clinic share the same email  
- A Patient MAY have a phone number
- If a phone number is present, no two Patients within the same Clinic share the same phone number
- The same physical person MAY have Patient records in multiple Clinics or Organizations  
- A Patient record SHALL NOT be deleted or archived through normal operations  
- Removal of personal identifiers SHALL occur only through GDPR erasure  
- Sessions cannot exist without a valid Patient reference  
- Sessions cannot be accessed independently of Patient access  

---

# 7. Identity Model

## 7.1 Clinic-Scoped Identity

Patient access and ownership SHALL be clinic-scoped.

Clinical records SHALL remain isolated to the Clinic that owns the Patient record.

---

## 7.2 Cross-Clinic Linking Identity

A platform-wide linking identity (`globalPatientId`) MAY associate the same physical person across multiple Clinics or Organizations.

This linking identity SHALL:

- support longitudinal patient continuity across the platform  
- NOT grant cross-clinic access  
- NOT override tenant isolation  
- NOT be used by Staff for cross-clinic data access  

Organization-level administrative authority SHALL NOT imply access to Patient records.

Linked Patient records MAY use different local identifiers while representing the same physical person through `globalPatientId`.

---

# 8. Patient Profile

The Patients module SHALL own Patient profile information.

Profile data SHALL include:

- required identifiers  
- optional contact information
- optional demographic information  
- optional external mapping identifiers  

Profile updates SHALL preserve Patient identity invariants.

---

# 9. Medical Documents

The Patients module SHALL own medical documents
associated with a Patient profile.

Medical documents:

- belong to exactly one Patient  
- SHALL remain patient-scoped  
- SHALL be access-controlled by Patient permissions  
- SHALL be auditable  

Medical documents are supporting records,
not separate aggregates.

---

# 10. Treatment Progress

The Patients module SHALL provide a treatment progress view for a Patient.

Treatment progress SHALL be derived from metrics contained in `COMPLETED` Sessions only.

`DRAFT` and `SAVED` Sessions SHALL NOT contribute.

The Patients module SHALL NOT own Session analysis data directly.

---

# 11. GDPR Erasure

The Patients module SHALL support GDPR erasure for Patient personal identifiers.

GDPR erasure SHALL:

- anonymize personal identifiers  
- preserve clinical treatment records  
- preserve Session history  
- be irreversible  
- remain clinic-scoped  

Erasure of a Patient in one Clinic SHALL NOT affect linked Patient records in other Clinics.

---

# 12. Events

## 12.1 Emitted

The Patients module SHALL emit domain events for significant Patient domain actions.

This includes events representing:

- Patient creation
- Patient profile changes
- Medical document changes
- GDPR erasure completion

---

## 12.2 Consumed

The Patients module SHALL consume:

- `LeadConverted`

When `LeadConverted` is consumed, the Patients module SHALL support creation of a Patient record using converted Lead data.

---

# 13. Audit Boundary

Critical Patient domain actions SHALL be auditable.

This includes:

- patient profile changes  
- medical document changes  
- GDPR erasure actions  

---

# 14. Access Control Boundary

Patient access SHALL be governed by Patients module permissions.

Patient permissions SHALL define access to:

- patient profile  
- medical documents  
- treatment progress  
- all Sessions belonging to that Patient  

Sessions SHALL remain a Patient sub-resource.

Sessions SHALL NOT define independent access control.

---

# 15. Cross-Module Relationships

## 15.1 Sessions Module

A Patient MAY own multiple Sessions over time.

Sessions belong to the Sessions module, but SHALL always reference exactly one Patient.

The Patients module SHALL NOT control Session lifecycle.

---

## 15.2 Leads Module

Patients MAY originate from converted Leads.

When a Lead is converted, the Patients module SHALL support creation of a Patient record from the converted Lead outcome.

The Patients module SHALL consume converted Lead outcomes, but SHALL NOT manage Lead lifecycle.

---

## 15.3 Appointments Module

Appointments MAY reference Patients.

The Patients module SHALL NOT manage appointment lifecycle.

---

## 15.4 Billing Module

Billing MAY reference Patient identity through Sessions or Appointment relationships.

The Patients module SHALL NOT manage billing state.

---

# 16. Data Ownership

The Patients module owns:

- patient profile  
- patient identifiers (clinic-scoped)  
- patient erasure state  
- medical documents  
- patient-scoped treatment progress view  

The Patients module does NOT own:

- Session lifecycle  
- Session clinical images  
- Session analysis results  
- appointments  
- billing state  

---

# 17. Boundaries

The Patients module SHALL NOT:

- manage Session lifecycle  
- access another module's storage directly  
- bypass tenant isolation boundaries  
- grant cross-clinic access through linking identity  
- bypass Patients permission boundaries  
- delete clinical history during GDPR erasure  

---