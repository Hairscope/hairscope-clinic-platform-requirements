# Module 2: Organization — Backend Tasks

**Branch:** `feature/organization-module`

### Task 1: Organization Schema and Repository
- 1.1 Expand Organization schema with full fields, incl. enums per code: `currencyEnforcementPolicy` `STRICT`/`FLEXIBLE`, org `recordVisibilityMode` `CLINIC_ONLY`/`ORGANIZATION_WIDE`, `leadAssignmentMode` `MANUAL`/`ROUND_ROBIN`, `termsEnforcementPolicy`, `termsType`, `subscriptionAccountId`, `billingAddress`, and `treatmentRecommendationMode` `STAGE_SCALE`/`HAIRSCORE`
- 1.2–1.3 Create repository and unit tests

### Task 2: Clinic Schema and Repository
- 2.1 Expand Clinic schema with full fields
- 2.2–2.3 Create repository and unit tests
- 2.4 Write property test: org isolation

### Task 3: Staff Availability Schema and Repository
- 3.1–3.3 Create schema, repository, and unit tests

### Task 4: Organization Service
- 4.1–4.4 Create service with settings management and unit tests

### Task 5: Clinic Service
- 5.1–5.5 Create service with CRUD, currency enforcement, deactivation
- 5.6–5.8 Write unit tests
- 5.9 Write property test: last clinic guard

### Task 6: Staff Availability Service
- 6.1–6.4 Create service with validation and unit tests

### Task 7: Visibility Mode Service (two axes)
- 7.1–7.4 Implement the **clinic-level** per-staff visibility (`recordVisibilityMode` `OPEN`/`RESTRICTED`, assignment-based; ClinicAdmins bypass) with unit tests
- 7.5 Write property test: RESTRICTED limits non-admins to assigned records
- 7.6 Implement the **org-level** cross-clinic visibility (`recordVisibilityMode` `CLINIC_ONLY`/`ORGANIZATION_WIDE`, ORG-11): cross-clinic read of non-clinical clinic details is **permission-driven, not role-driven**; never exposes patient sessions/clinical data (GI-8)

### Task 8: Organization Resolvers
- 8.1–8.7 Create resolvers, DTOs, ObjectTypes, integration tests

### Task 9: Organization Module Registration
- 9.1–9.4 Create module, wire into AppModule, barrel export

### Task 10: Clinic Closure Schema and Service
- 10.1 Create `clinic-closure.schema.ts` (date, reason, recurring, status; unique `{ clinicId, date }`)
- 10.2 Repository + service (used by slot availability to block closed dates)

### Task 11: Custom Treatment Data (Recommendation Engine input)
- 11.1 Create `custom-treatment-data.schema.ts` (org-scoped, per-language treatment content keyed by `hairlossScale`+`hairlossStage` or hair-score range; `matchingStrategy` `STAGE_SCALE`/`HAIRSCORE`; unique `{ organizationId, language, hairlossScale, hairlossStage }`)
- 11.2 Repository + CRUD service
- 11.3 Consumed by the Recommendation Engine (with org `treatmentRecommendationMode`) to assemble stage descriptions and treatment copy during report/recommendation generation
