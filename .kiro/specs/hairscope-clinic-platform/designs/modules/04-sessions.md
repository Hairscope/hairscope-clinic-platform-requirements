# Module: Sessions

> Covers: Session aggregate, session lifecycle, clinical inputs, catalog item recommendations, and cross-module relationships.

---

# 1. Purpose

The Sessions module represents a clinical interaction for a Patient
within a Clinic.

A Session is the central workflow unit that captures the clinical
state of a Patient at a point in time.

The Sessions module owns:

- session lifecycle  
- clinical images  
- annotations  
- questionnaire responses  
- doctor notes  
- session-level references to recommended catalog items  

A Session cannot exist without a valid Patient.

---

# 2. Responsibilities

The Sessions module SHALL:

- create and manage Sessions  
- enforce Session lifecycle rules  
- maintain Session-owned clinical inputs  
- emit domain events for downstream processing  
- support controlled post-completion edits  

The Sessions module SHALL NOT:

- perform AI analysis  
- generate reports  
- manage catalogs  
- manage billing  
- define independent access control  

---

# 3. Aggregate

## 3.1 Session (Aggregate Root)

The Session aggregate represents a complete clinical interaction
for a Patient in a Clinic.

It is the authoritative source of Session state.

---

# 4. Entities

The Session aggregate SHALL contain:

- Session
- GlobalImage
- TrichoscopyImage
- RootPoint (follicle annotation; `source: AI | HUMAN`, soft-deletable)
- HairStrand (strand annotation; `source: AI | HUMAN`, soft-deletable)
- GlobalAnalysisData (structured global-image AI results + `overrides[]`)
- QuestionnaireResponse
- DoctorNote
- CatalogItemRecommendationReference

> Annotation data is modelled as individual `RootPoint` / `HairStrand` documents (matching the implemented schema) rather than a single `Annotation` type. They remain sub-entities of the Session aggregate, not independent aggregates.

---

# 5. Value Objects

The Session aggregate MAY use value objects, including:

- SessionType  
- SessionStatus  
- ImagePosition  
- AnnotationCoordinates  
- Routine  

---

# 6. Invariants

The system SHALL ensure:

- A Session belongs to exactly one Patient  
- A Session belongs to exactly one Clinic  
- A Session cannot exist without a valid Patient reference  
- A Patient may have at most one active `DRAFT` Session per `SessionType` per Clinic  
- A Session may only transition through valid lifecycle states  
- A `DRAFT` Session may be deleted  
- A `SAVED` or `COMPLETED` Session may not be deleted  
- After a Session transitions to `SAVED`, no new images SHALL be added or modified  
- Session comparison SHALL only be allowed:
  - between Sessions of the same `SessionType`
  - between images of the same `ImagePosition`

---

# 7. Lifecycle

The Session lifecycle SHALL be:

```text
DRAFT → SAVED → COMPLETED
DRAFT → DELETED
```

Rules:

- `DRAFT` → editable  
- `SAVED` → images locked, awaiting asynchronous processing  
- `COMPLETED` → finalized clinical record with controlled editable fields  
- `DELETED` → terminal state for draft removal only  

The Sessions module SHALL rely on domain events for transitions
that depend on external processing.

---

# 8. Post-Completion Edits

After completion, the following SHALL remain editable:

- questionnaire responses
- catalog item recommendations
- doctor notes
- AI analysis results — trichoscopy annotations (`RootPoint` / `HairStrand`, via soft-delete + `HUMAN` additions) and global analysis values (via an `overrides[]` audit trail)

AI analysis results are editable because AI accuracy is not guaranteed; staff may correct any AI-produced value.

The original captured image binaries SHALL remain immutable after completion — only their annotations/derived analysis are editable.

Post-completion edits SHALL emit domain events for downstream updates.

---

# 9. Events

## 9.1 Emitted

The Sessions module SHALL emit:

- `SessionSaved`  
- `SessionCompleted`  
- `SessionDeleted`  
- `AnnotationEditSaved`  

## 9.2 Consumed

The Sessions module SHALL consume:

- `AIAnalysisCompleted`  
- `AIAnalysisFailed`  

The Sessions module SHALL handle failed analysis outcomes
through domain-defined recovery flows.

---

# 10. External Processing Boundary

All external processing SHALL occur asynchronously.

This includes:

- AI analysis  
- report generation  
- downstream billing workflows  

The Sessions module SHALL emit domain events
and SHALL NOT directly execute external processing.

---

# 11. Access Control Boundary

Sessions are a sub-resource of Patients.

Access to Sessions SHALL be governed by Patients module permissions.

The Sessions module SHALL NOT define independent access rules.

---

# 12. Cross-Module Relationships

## 12.1 Patients Module

A Session SHALL reference exactly one Patient.

The Patient relationship is mandatory.

---

## 12.2 Appointments Module

A Session MAY reference an Appointment as its originating workflow context.

The Sessions module SHALL NOT depend on the Appointments module
for lifecycle control.

---

## 12.3 Catalog Module

A Session MAY reference CatalogItems by identifier
for recommendation purposes.

The Sessions module SHALL NOT depend on Catalog module behavior.

---

## 12.4 Billing Module

Billing MAY reference completed Sessions
for invoice generation.

The Sessions module SHALL NOT manage billing state.

---

# 13. Data Ownership

The Sessions module owns:

- session state  
- clinical images  
- annotations  
- questionnaire responses  
- doctor notes  
- catalog item recommendation references  

The Sessions module does NOT own:

- patient profile data  
- appointment state  
- catalog data  
- billing state  

---

# 14. Boundaries

The Sessions module SHALL NOT:

- perform AI computation  
- generate reports  
- manage invoices  
- bypass the event system  
- access another module's storage directly  
- bypass Patients module access rules  

---