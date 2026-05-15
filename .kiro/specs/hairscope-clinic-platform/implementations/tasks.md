# Implementation Tasks — All Modules

> Complete list of all implementation tasks executed per module for the Hairscope Clinic Platform backend.

---

## Module 1: Infrastructure Setup

**Branch:** `feature/infra-setup`

### Task 1: PlatformError Base Class and Error Codes
- [x] 1.1 Create PlatformError class (code, message, optional field)
- [x] 1.2 Create shared error code constants
- [x] 1.3 Create domain error subclasses (UnauthorizedError, ForbiddenError, SessionRevokedError, NotFoundError)
- [x] 1.4 Write unit tests for PlatformError construction and inheritance

### Task 2: GraphQL Error Formatter
- [x] 2.1 Create formatPlatformError function
- [x] 2.2 Implement PlatformError mapping (code, message, field, traceId)
- [x] 2.3 Implement generic fallback for non-PlatformError exceptions
- [x] 2.4–2.5 Write unit tests for error formatter
- [x] 2.6 Write property test: output always contains non-empty message, code, traceId
- [x] 2.7 Write property test: multiple calls produce unique traceIds

### Task 3: Interfaces and Types
- [x] 3.1 Create TenantContext interface
- [x] 3.2 Create RequestWithIdentity interface
- [x] 3.3 Create JwtPayload interface

### Task 4: Decorators
- [x] 4.1 Create @Public() decorator
- [x] 4.2 Create @RequirePermission(module, action) decorator
- [x] 4.3 Create @CurrentUser param decorator
- [x] 4.4 Write unit tests for @CurrentUser

### Task 5: Auth Guard
- [x] 5.1–5.5 Create AuthGuard with JWT verification, session liveness check, @Public() bypass
- [x] 5.6–5.10 Write unit tests for all auth guard scenarios

### Task 6: Tenant Guard
- [x] 6.1–6.2 Create TenantGuard with organizationId check
- [x] 6.3–6.4 Write unit tests

### Task 7: Permission Guard
- [x] 7.1–7.4 Create PermissionGuard with Access Resolution Engine invocation
- [x] 7.5–7.8 Write unit tests and integration test for guard chain

### Task 8: GraphQL Context and Module Setup
- [x] 8.1 Create context builder
- [x] 8.2 Configure GraphQLModule in AppModule
- [x] 8.3 Register global guards
- [x] 8.4 Write integration test for @CurrentUser in resolver

### Task 9: Base Repository
- [x] 9.1 Create BaseSchemaFields
- [x] 9.2–9.7 Create abstract BaseRepository with tenant-scoped CRUD
- [x] 9.8 Write property test: tenant isolation
- [x] 9.9 Write unit tests for update

### Task 10: OutboxEvent Schema and Repository
- [x] 10.1–10.5 Create OutboxEvent schema and repository with status transitions
- [x] 10.6 Write unit tests
- [x] 10.7 Write property test: valid state machine transitions

### Task 11: Outbox Dispatcher
- [x] 11.1–11.5 Create dispatcher with cron polling, distributed lock, Redis Streams
- [x] 11.6–11.8 Write unit tests
- [x] 11.9 Write property test: retry boundary at 10 attempts

### Task 12: Outbox Module Registration
- [x] 12.1–12.2 Create OutboxModule with exports

### Task 13: AuditLog Schema and Repository
- [x] 13.1–13.3 Create append-only AuditLog schema and repository
- [x] 13.4 Write unit tests verifying no update/delete methods
- [x] 13.5 Write property test: append-only invariant

### Task 14: Audit Service
- [x] 14.1–14.6 Create request-scoped AuditService with auto-context extraction
- [x] 14.7–14.9 Write unit tests

### Task 15: Audit Module Registration
- [x] 15.1–15.2 Create AuditModule with exports

### Task 16: Idempotency Store
- [x] 16.1–16.2 Create IdempotencyStore with Redis (7-day TTL)
- [x] 16.3 Write property test: markProcessed/isDuplicate correctness
- [x] 16.4 Write unit test for Redis SET with TTL

### Task 17: Rate Limiting Setup
- [x] 17.1 Install throttler dependencies
- [x] 17.2–17.3 Configure ThrottlerModule with burst/sustained limits
- [x] 17.4–17.5 Write integration tests for 429 response and headers

### Task 18: App Module Integration
- [x] 18.1–18.4 Wire all modules, verify guard chain end-to-end

---

## Module 2: Auth & IAM

**Branch:** `feature/auth-iam`

### Task 1: IAM Error Codes and Domain Errors
- [x] 1.1 Add 18 IAM-specific error codes
- [x] 1.2 Create 14 domain error subclasses
- [x] 1.3 Write unit tests

### Task 2: AuthSession Schema and Repository
- [x] 2.1–2.2 Create AuthSession schema and repository
- [x] 2.3 Write unit tests
- [x] 2.4 Write property test: revokeAllForStaff leaves no ACTIVE sessions

### Task 3: PasswordResetToken Schema and Repository
- [x] 3.1–3.3 Create schema, repository, and unit tests

### Task 4: Password Hashing Utilities
- [x] 4.1 Create hashPassword/verifyPassword with argon2id
- [x] 4.2–4.3 Write unit and property tests

### Task 5: JWT Service
- [x] 5.1–5.3 Create JwtService with RS256 sign/verify
- [x] 5.4–5.5 Write unit tests including algorithm enforcement

### Task 6: Auth Service - Login
- [x] 6.1–6.4 Implement login with audit, failure cases, no user enumeration
- [x] 6.5–6.6 Write unit tests
- [x] 6.7 Write property test: never returns tokens for non-ACTIVE staff

### Task 7: Auth Service - Refresh
- [x] 7.1–7.4 Implement refresh with token rotation, stolen token detection, staff status check
- [x] 7.5–7.7 Write unit tests
- [x] 7.8 Write property test: old refresh token invalid after rotation

### Task 8: Auth Service - Logout
- [x] 8.1–8.5 Implement logout with single-session revocation, unit tests

### Task 9: Auth Service - Password Reset
- [x] 9.1–9.3 Implement requestPasswordReset and resetPassword
- [x] 9.4–9.5 Write unit tests
- [x] 9.6 Write property test: all sessions revoked after reset

### Task 10: Auth Resolver
- [x] 10.1–10.4 Create GraphQL resolver with HTTP-only cookies, DTOs
- [x] 10.5–10.6 Write integration tests

### Task 11: Auth Module Registration
- [x] 11.1–11.3 Create AuthModule with exports and barrel

### Task 12: Staff Schema and Repository
- [x] 12.1–12.3 Create Staff schema and repository
- [x] 12.4 Write property test: tenant scoping

### Task 13: Role Schema and Repository
- [x] 13.1–13.3 Create Role schema and repository with unit tests

### Task 14: InviteToken Schema and Repository
- [x] 14.1–14.3 Create InviteToken schema and repository with unit tests

### Task 15: Password Policy Service
- [x] 15.1–15.2 Create PasswordPolicyService with validation rules
- [x] 15.3 Write property test: validation correctness

### Task 16: Invite Service
- [x] 16.1–16.5 Implement sendInvite, acceptInvite, resendInvite, cancelInvite
- [x] 16.6–16.8 Write unit tests
- [x] 16.9–16.10 Write property tests: PENDING_REGISTRATION status, 7-day expiry

### Task 17: Staff Service
- [x] 17.1–17.4 Implement staff CRUD, deactivation, reactivation
- [x] 17.5–17.7 Write unit tests

### Task 18: Last Admin Guard
- [x] 18.1–18.3 Create LastAdminGuard with unit tests
- [x] 18.4 Write property test: blocked when count is 1

### Task 19: Role Service
- [x] 19.1–19.4 Implement role CRUD with system role protection, OrgAdmin scope violation
- [x] 19.5–19.7 Write unit tests

### Task 20: Access Resolution Engine
- [x] 20.1–20.6 Implement permission resolution, OrgAdmin restrictions, dual-role, deny-by-default
- [x] 20.7–20.9 Write unit tests
- [x] 20.10–20.11 Write property tests: always returns ALLOWED/DENIED, effective permissions = union

### Task 21: Plan Gate Service
- [x] 21.1–21.3 Create stub PlanGateService with unit tests

### Task 22: Visibility Interceptor
- [x] 22.1–22.3 Create VisibilityInterceptor with unit tests

### Task 23: IAM Resolvers
- [x] 23.1–23.6 Create Staff, Role, Invite resolvers with DTOs and @RequirePermission
- [x] 23.7–23.8 Write integration tests

### Task 24: Self-Registration
- [x] 24.1–24.4 Create RegistrationService and resolver
- [x] 24.5 Write unit tests
- [x] 24.6 Write property test: creates exactly 1 org + 1 clinic + 1 staff

### Task 25: IAM Module Registration
- [x] 25.1–25.4 Create IamModule, wire into AppModule, barrel export

### Task 26: Seed Data
- [x] 26.1–26.3 Create system roles seed (OrgAdmin, ClinicAdmin) + default roles (Doctor, Receptionist, Nurse, Sales, Marketing, Frontdesk)
- [x] 26.4 Write unit tests verifying idempotency

---

## Module 3: Organization

**Branch:** `feature/organization-module`

### Task 1: Organization Schema and Repository
- [x] 1.1 Expand Organization schema with full fields
- [x] 1.2–1.3 Create repository and unit tests

### Task 2: Clinic Schema and Repository
- [x] 2.1 Expand Clinic schema with full fields
- [x] 2.2–2.3 Create repository and unit tests
- [x] 2.4 Write property test: org isolation

### Task 3: Staff Availability Schema and Repository
- [x] 3.1–3.3 Create schema, repository, and unit tests

### Task 4: Organization Service
- [x] 4.1–4.4 Create service with settings management and unit tests

### Task 5: Clinic Service
- [x] 5.1–5.5 Create service with CRUD, currency enforcement, deactivation
- [x] 5.6–5.8 Write unit tests
- [x] 5.9 Write property test: last clinic guard

### Task 6: Staff Availability Service
- [x] 6.1–6.4 Create service with validation and unit tests

### Task 7: Visibility Mode Service
- [x] 7.1–7.4 Create service with org override logic and unit tests
- [x] 7.5 Write property test: org RESTRICTED overrides clinic OPEN

### Task 8: Organization Resolvers
- [x] 8.1–8.7 Create resolvers, DTOs, ObjectTypes, integration tests

### Task 9: Organization Module Registration
- [x] 9.1–9.4 Create module, wire into AppModule, barrel export

---

## Module 4: Patients

**Branch:** `feature/patients-module`

### Task 1: Patient Schema and Repository
- [x] 1.1–1.3 Create schema and repository with indexes
- [x] 1.4 Write property test: clinic isolation

### Task 2: Patient Error Codes
- [x] 2.1–2.2 Add error codes and domain errors

### Task 3: Patient Service
- [x] 3.1–3.5 Implement CRUD, globalPatientId resolution, age calculation, search
- [x] 3.6–3.7 Write unit tests
- [x] 3.8–3.9 Write property tests: duplicate prevention, age calculation

### Task 4: GDPR Erasure
- [x] 4.1–4.2 Implement gdprErase with confirmation requirement
- [x] 4.3 Write property test: no personal identifiers after erasure

### Task 5: Medical Document Schema and Service
- [x] 5.1–5.4 Create schema, repository, service, and unit tests

### Task 6: Treatment Progress Service
- [x] 6.1–6.3 Create service querying COMPLETED sessions only
- [x] 6.4 Write property test: excludes DRAFT/SAVED sessions

### Task 7: Lead Conversion Event Handler
- [x] 7.1–7.3 Create @OnEvent handler with idempotency and unit tests

### Task 8: Patient Resolver
- [x] 8.1–8.5 Create resolvers, DTOs, integration tests

### Task 9: Patients Module Registration
- [x] 9.1–9.4 Create module, wire into AppModule, barrel export

---

## Module 5: Sessions

**Branch:** `feature/sessions-module`

### Task 1: Session Schema and Repository
- [x] 1.1–1.3 Create schema and repository
- [x] 1.4 Write property test: one DRAFT per patient per sessionType

### Task 2: Session Error Codes
- [x] 2.1–2.2 Add error codes and domain errors

### Task 3: Session Service - Lifecycle
- [x] 3.1–3.5 Implement create, save, complete, delete with status transitions
- [x] 3.6–3.9 Write unit tests
- [x] 3.10 Write property test: valid status transitions only

### Task 4: Treatment Plan Schema and Service
- [x] 4.1–4.5 Create schema, repository, service with sign functionality and unit tests

### Task 5: Prescription Schema and Service
- [x] 5.1–5.4 Create schema, repository, service and unit tests

### Task 6: AI Analysis Event Handler
- [x] 6.1–6.4 Create event handlers for AIAnalysisCompleted/Failed with unit tests

### Task 7: Session Resolvers
- [x] 7.1–7.6 Create resolvers, DTOs, integration tests

### Task 8: Sessions Module Registration
- [x] 8.1–8.4 Create module, wire into AppModule, barrel export

---

## Module 6: Leads

**Branch:** `feature/leads-module`

### Task 1: Lead Schema and Repository
- [x] 1.1–1.3 Create schema and repository with unit tests

### Task 2: Lead Error Codes
- [x] 2.1–2.2 Add error codes and domain errors

### Task 3: Lead Service
- [x] 3.1–3.5 Implement CRUD, convert, markLost, status transitions
- [x] 3.6 Write unit tests
- [x] 3.7 Write property test: CONVERTED only via convert()

### Task 4: Lead Distribution Service
- [x] 4.1–4.3 Implement round-robin assignment with unit tests

### Task 5: Lead Resolver
- [x] 5.1–5.4 Create resolver, DTOs, integration tests

### Task 6: Leads Module Registration
- [x] 6.1–6.4 Create module, wire into AppModule, barrel export

---

## Module 7: Appointments

**Branch:** `feature/appointments-module`

### Task 1: Appointment Schema and Repository
- [x] 1.1–1.3 Create schema and repository with unit tests

### Task 2: Appointment Error Codes
- [x] 2.1–2.2 Add error codes and domain errors

### Task 3: Appointment Service
- [x] 3.1–3.5 Implement book, reschedule, cancel, complete, markNoShow
- [x] 3.6 Write unit tests
- [x] 3.7 Write property test: valid status transitions

### Task 4: Slot Availability Service
- [x] 4.1–4.3 Implement slot checking with unit tests

### Task 5: Smart Scheduling Service
- [x] 5.1–5.3 Implement least-busy assignment with unit tests

### Task 6: Appointment Resolver
- [x] 6.1–6.4 Create resolver, DTOs, integration tests

### Task 7: Appointments Module Registration
- [x] 7.1–7.4 Create module, wire into AppModule, barrel export

---

## Module 8: Catalog

**Branch:** `feature/catalog-module`

### Task 1: Catalog Item Schema and Repository
- [x] 1.1–1.3 Create schema and repository with unit tests

### Task 2: Treatment Kit Schema and Repository
- [x] 2.1–2.3 Create schema and repository with unit tests

### Task 3: Catalog Item Service
- [x] 3.1–3.4 Implement CRUD with currency validation, deactivation, unit tests

### Task 4: Treatment Kit Service
- [x] 4.1–4.3 Implement CRUD with price calculation, unit tests

### Task 5: Catalog Resolvers
- [x] 5.1–5.5 Create resolvers, DTOs, integration tests

### Task 6: Catalog Module Registration
- [x] 6.1–6.4 Create module, wire into AppModule, barrel export

---

## Module 9: Billing

**Branch:** `feature/billing-module`

### Task 1: Invoice Schema and Repository
- [x] 1.1–1.3 Create schema and repository with unit tests

### Task 2: Payment Schema and Repository
- [x] 2.1–2.3 Create schema and repository with unit tests

### Task 3: Invoice Service
- [x] 3.1–3.5 Implement createFromSession, addLineItem, finalize, void, totals recalculation
- [x] 3.6 Write unit tests

### Task 4: Payment Service
- [x] 4.1–4.3 Implement recordPayment with status updates, unit tests

### Task 5: Billing Event Handler
- [x] 5.1–5.3 Create @OnEvent('TreatmentPlanSigned') handler with unit tests

### Task 6: Billing Resolvers
- [x] 6.1–6.5 Create resolvers, DTOs, integration tests

### Task 7: Billing Module Registration
- [x] 7.1–7.4 Create module, wire into AppModule, barrel export
