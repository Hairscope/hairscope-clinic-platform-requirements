# Module 0: Infrastructure Setup — Backend Tasks

**Branch:** `feature/infra-setup`

### Task 1: PlatformError Base Class and Error Codes
- 1.1 Create PlatformError class (code, message, optional field)
- 1.2 Create shared error code constants
- 1.3 Create domain error subclasses (UnauthorizedError, ForbiddenError, SessionRevokedError, NotFoundError)
- 1.4 Write unit tests for PlatformError construction and inheritance

### Task 2: GraphQL Error Formatter
- 2.1 Create formatPlatformError function
- 2.2 Implement PlatformError mapping (code, message, field, traceId)
- 2.3 Implement generic fallback for non-PlatformError exceptions
- 2.4–2.5 Write unit tests for error formatter
- 2.6 Write property test: output always contains non-empty message, code, traceId
- 2.7 Write property test: multiple calls produce unique traceIds

### Task 3: Interfaces and Types
- 3.1 Create TenantContext interface
- 3.2 Create RequestWithIdentity interface
- 3.3 Create JwtPayload interface

### Task 4: Decorators
- 4.1 Create @Public() decorator
- 4.2 Create @RequirePermission(module, action) decorator
- 4.3 Create @CurrentUser param decorator
- 4.4 Write unit tests for @CurrentUser

### Task 5: Auth Guard
- 5.1–5.5 Create AuthGuard with JWT verification, session liveness check, @Public() bypass
- 5.6–5.10 Write unit tests for all auth guard scenarios

### Task 6: Tenant Guard
- 6.1–6.2 Create TenantGuard with organizationId check
- 6.3–6.4 Write unit tests

### Task 7: Permission Guard
- 7.1–7.4 Create PermissionGuard with Access Resolution Engine invocation
- 7.5–7.8 Write unit tests and integration test for guard chain

### Task 8: GraphQL Context and Module Setup
- 8.1 Create context builder
- 8.2 Configure GraphQLModule in AppModule
- 8.3 Register global guards
- 8.4 Write integration test for @CurrentUser in resolver

### Task 9: Base Repository
- 9.1 Create BaseSchemaFields
- 9.2–9.7 Create abstract BaseRepository with tenant-scoped CRUD
- 9.8 Write property test: tenant isolation
- 9.9 Write unit tests for update

### Task 10: OutboxEvent Schema and Repository
- 10.1–10.5 Create OutboxEvent schema and repository with status transitions
- 10.6 Write unit tests
- 10.7 Write property test: valid state machine transitions

### Task 11: Outbox Dispatcher
- 11.1–11.5 Create dispatcher with cron polling, distributed lock, Redis Streams
- 11.6–11.8 Write unit tests
- 11.9 Write property test: retry boundary at 10 attempts

### Task 12: Outbox Module Registration
- 12.1–12.2 Create OutboxModule with exports

### Task 13: AuditLog Schema and Repository
- 13.1–13.3 Create append-only AuditLog schema and repository
- 13.4 Write unit tests verifying no update/delete methods
- 13.5 Write property test: append-only invariant

### Task 14: Audit Service
- 14.1–14.6 Create request-scoped AuditService with auto-context extraction
- 14.7–14.9 Write unit tests

### Task 15: Audit Module Registration
- 15.1–15.2 Create AuditModule with exports

### Task 16: Idempotency Store
- 16.1–16.2 Create IdempotencyStore with Redis (7-day TTL)
- 16.3 Write property test: markProcessed/isDuplicate correctness
- 16.4 Write unit test for Redis SET with TTL

### Task 17: Rate Limiting Setup
- 17.1 Install throttler dependencies
- 17.2–17.3 Configure ThrottlerModule with burst/sustained limits
- 17.4–17.5 Write integration tests for 429 response and headers

### Task 18: App Module Integration
- 18.1–18.4 Wire all modules, verify guard chain end-to-end
