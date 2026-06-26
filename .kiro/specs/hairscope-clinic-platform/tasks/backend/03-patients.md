# Module 3: Patients — Backend Tasks

**Branch:** `feature/patients-module`

### Task 1: Patient Schema and Repository
- 1.1–1.3 Create schema and repository with indexes
- 1.4 Write property test: clinic isolation

### Task 2: Patient Error Codes
- 2.1–2.2 Add error codes and domain errors

### Task 3: Patient Service
- 3.1–3.5 Implement CRUD, `globalPatientId` assignment (new id per record — NO automatic cross-clinic linking by email/phone; verified manual linking is **TBD**, see PAT-2), age calculation, search
- 3.6–3.7 Write unit tests
- 3.8–3.9 Write property tests: duplicate prevention, age calculation, and that distinct records receive distinct `globalPatientId` (no auto-link)

### Task 4: GDPR Erasure
- 4.1–4.2 Implement gdprErase with confirmation requirement
- 4.3 Write property test: no personal identifiers after erasure

### Task 5: Medical Document Schema and Service
- 5.1–5.4 Create schema, repository, service, and unit tests

### Task 6: Treatment Progress Service
- 6.1–6.3 Create service querying COMPLETED sessions only
- 6.4 Write property test: excludes DRAFT/SAVED sessions

### Task 7: Lead Conversion Event Handler
- 7.1–7.3 Create @OnEvent handler with idempotency and unit tests

### Task 8: Patient Resolver
- 8.1–8.5 Create resolvers, DTOs, integration tests

### Task 9: Patients Module Registration
- 9.1–9.4 Create module, wire into AppModule, barrel export
