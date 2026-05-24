# Frontend Implementation Tasks — IAM Module

> Complete list of all implementation tasks executed for the Hairscope Clinic Platform frontend IAM module (Next.js 16 + Apollo Client + Zustand).

---

## Module 1: Apollo Client Setup with Auth Link Chain

**Branch:** `feature/auth-iam`

### Task 1: Install Dependencies
- [x] 1.1 Verify `@apollo/client` and `graphql` are installed in package.json

### Task 2: Apollo Client with Error Link
- [x] 2.1 Create `src/lib/apollo-client.ts` with HttpLink (credentials: include)
- [x] 2.2 Implement ErrorLink intercepting UNAUTHENTICATED errors
- [x] 2.3 Implement request queuing during token refresh
- [x] 2.4 Implement failed-refresh redirect to /login with auth store clear
- [x] 2.5 Skip refresh for RefreshToken operation (infinite loop prevention)

### Task 3: Apollo Provider
- [x] 3.1 Create `src/providers/ApolloProvider.tsx` with 'use client' directive
- [x] 3.2 Add ApolloProvider to root layout (`src/app/layout.tsx`)

### Task 4: Auth Service GraphQL Documents
- [x] 4.1 Create `src/services/auth.service.ts` with ME query
- [x] 4.2 Add REFRESH_TOKEN mutation document
- [x] 4.3 Add LOGIN mutation document
- [x] 4.4 Add LOGOUT mutation document
- [x] 4.5 Add REQUEST_PASSWORD_RESET mutation document
- [x] 4.6 Add RESET_PASSWORD mutation document

### Task 5: Link Chain Tests
- [x] 5.1 Create `src/lib/apollo-client.test.ts` with vitest
- [x] 5.2 Test: non-UNAUTHENTICATED errors pass through without refresh
- [x] 5.3 Test: UNAUTHENTICATED triggers refresh and retries original request
- [x] 5.4 Test: concurrent requests queued during refresh and replayed after success
- [x] 5.5 Test: failed refresh redirects to /login
- [x] 5.6 Test: RefreshToken operation skipped to avoid infinite loops

---

## Module 2: Auth Store and Route Protection

**Branch:** `feature/auth-iam`

### Task 6: Auth Store (Zustand)
- [x] 6.1 Create `src/stores/auth.store.ts` with staff identity, status, clearAuth, hasPermission

### Task 7: Auth Hook
- [x] 7.1 Create `src/hooks/useAuth.ts` with useQuery(ME) on mount
- [x] 7.2 Set status to loading/authenticated/unauthenticated based on query result
- [x] 7.3 Return { staff, status, isAuthenticated, isLoading }

### Task 8: Permission Hook
- [x] 8.1 Create `src/hooks/usePermission.ts` wrapping auth store hasPermission
- [x] 8.2 Return { hasPermission, can } for inline permission checks

### Task 9: Next.js Middleware
- [x] 9.1 Create `src/middleware.ts` with public routes (/login, /forgot-password, /reset-password, /invite/accept)
- [x] 9.2 Redirect unauthenticated users to /login?redirect=pathname
- [x] 9.3 Redirect authenticated users away from /login to /
- [x] 9.4 Configure matcher to exclude _next, api, favicon

### Task 10: Permission Gate Component
- [x] 10.1 Create `src/components/modules/iam/PermissionGate.tsx`
- [x] 10.2 Props: module, action, children, fallback
- [x] 10.3 Conditional render based on useAuthStore.hasPermission

### Task 11: Access Denied Component
- [x] 11.1 Create `src/components/modules/iam/AccessDenied.tsx`
- [x] 11.2 Full-page fallback with ShieldX icon, message, and dashboard link
- [x] 11.3 Style with theme tokens (status-danger-bg, t-title, t-secondary, btn-primary)

---

## Module 3: Login Page

**Branch:** `feature/auth-iam`

### Task 12: Login Form
- [x] 12.1 Create `src/components/modules/iam/LoginForm.tsx`
- [x] 12.2 Implement react-hook-form + zod validation (email format, password required)
- [x] 12.3 Call LOGIN mutation via useMutation
- [x] 12.4 On success: store staff in auth store, redirect to ?redirect param or /
- [x] 12.5 Loading state with spinner on submit button
- [x] 12.6 Error mapping: INVALID_CREDENTIALS, ACCOUNT_DEACTIVATED, ACCOUNT_NOT_ACTIVATED, network error

### Task 13: Login Page
- [x] 13.1 Create `src/app/(auth)/login/page.tsx`
- [x] 13.2 Centered card layout with logo, heading, LoginForm, forgot password link
- [x] 13.3 Wrapped in Suspense for useSearchParams compatibility
- [x] 13.4 Style with theme tokens (no hardcoded colors)

---

## Module 4: Password Reset Pages

**Branch:** `feature/auth-iam`

### Task 14: Forgot Password Form
- [x] 14.1 Create `src/components/modules/iam/ForgotPasswordForm.tsx`
- [x] 14.2 Email input with zod validation
- [x] 14.3 Call REQUEST_PASSWORD_RESET mutation
- [x] 14.4 On success: show CheckCircle icon + "Check your email" message
- [x] 14.5 Handle RATE_LIMIT_EXCEEDED error
- [x] 14.6 Link back to login

### Task 15: Forgot Password Page
- [x] 15.1 Create `src/app/(auth)/forgot-password/page.tsx`
- [x] 15.2 Logo, heading "Reset Password", description, ForgotPasswordForm

### Task 16: Reset Password Form
- [x] 16.1 Create `src/components/modules/iam/ResetPasswordForm.tsx`
- [x] 16.2 Two password fields (new + confirm) with zod validation + refine for match
- [x] 16.3 Inline password policy requirements checklist with Check/X icons
- [x] 16.4 Accept token prop, call RESET_PASSWORD mutation
- [x] 16.5 On success: store staff in auth store, redirect to dashboard
- [x] 16.6 Error mapping: TOKEN_EXPIRED, TOKEN_ALREADY_USED, RATE_LIMIT_EXCEEDED

### Task 17: Reset Password Page
- [x] 17.1 Create `src/app/(auth)/reset-password/page.tsx`
- [x] 17.2 Read token from URL search params
- [x] 17.3 If no token: show AlertTriangle error with link to request new reset
- [x] 17.4 If token present: render ResetPasswordForm with token prop
- [x] 17.5 Wrapped in Suspense

---

## Module 5: Invite Acceptance Page

**Branch:** `feature/auth-iam`

### Task 18: Invite Service
- [x] 18.1 Create `src/services/invite.service.ts`
- [x] 18.2 Add VALIDATE_INVITE_TOKEN query document
- [x] 18.3 Add ACCEPT_INVITE mutation document

### Task 19: Invite Accept Form
- [x] 19.1 Create `src/components/modules/iam/InviteAcceptForm.tsx`
- [x] 19.2 Read-only email field (disabled input)
- [x] 19.3 Password + confirm fields with zod validation
- [x] 19.4 Inline password policy requirements checklist
- [x] 19.5 Call ACCEPT_INVITE mutation, store staff, redirect to dashboard
- [x] 19.6 Error mapping: INVITE_EXPIRED, INVITE_REVOKED, INVITE_ALREADY_USED

### Task 20: Invite Accept Page
- [x] 20.1 Create `src/app/(auth)/invite/accept/page.tsx`
- [x] 20.2 Read token from URL search params
- [x] 20.3 Validate token on load via VALIDATE_INVITE_TOKEN query (network-only)
- [x] 20.4 Loading state while validating
- [x] 20.5 If valid: render InviteAcceptForm with email from response
- [x] 20.6 If invalid: show error based on error code (INVITE_EXPIRED, INVITE_REVOKED, INVITE_ALREADY_USED)
- [x] 20.7 If no token: show "Invalid invitation link" error

---

## Module 6: Staff Management Page

**Branch:** `feature/auth-iam`

### Task 21: Staff Service
- [x] 21.1 Create `src/services/staff.service.ts`
- [x] 21.2 Add STAFF_LIST query (pagination, filter)
- [x] 21.3 Add ROLES_LIST query
- [x] 21.4 Add INVITE_STAFF mutation
- [x] 21.5 Add UPDATE_STAFF_ROLES mutation
- [x] 21.6 Add DEACTIVATE_STAFF mutation
- [x] 21.7 Add REACTIVATE_STAFF mutation

### Task 22: Staff List Hook
- [x] 22.1 Create `src/hooks/useStaffList.ts`
- [x] 22.2 Apollo useQuery with STAFF_LIST, page size 20
- [x] 22.3 Cursor-based pagination (loadMore via fetchMore)
- [x] 22.4 300ms debounced search
- [x] 22.5 Status filter state
- [x] 22.6 Return { staff, loading, error, hasNextPage, loadMore, setSearch, setStatusFilter, refetch }

### Task 23: Staff Table
- [x] 23.1 Create `src/components/modules/iam/StaffTable.tsx`
- [x] 23.2 Use @tanstack/react-table with columns: Name, Email, Roles (badges), Status (badge), Actions (dropdown)
- [x] 23.3 Status badges: ACTIVE=success, INACTIVE=danger, PENDING_REGISTRATION=warning
- [x] 23.4 Actions dropdown: Edit Roles, Deactivate/Reactivate (based on status)
- [x] 23.5 Actions wrapped in PermissionGate module="organization" action="edit"

### Task 24: Staff Invite Modal
- [x] 24.1 Create `src/components/modules/iam/StaffInviteModal.tsx`
- [x] 24.2 Form with react-hook-form + zod: email (required), roles multi-select (required), firstName/lastName (optional)
- [x] 24.3 Roles loaded via ROLES_LIST query
- [x] 24.4 Call INVITE_STAFF mutation
- [x] 24.5 On success: reset form, close modal, trigger refetch

### Task 25: Staff Edit Roles Modal
- [x] 25.1 Create `src/components/modules/iam/StaffEditRolesModal.tsx`
- [x] 25.2 Multi-select roles pre-populated with current staff roles
- [x] 25.3 Validate at least one role selected
- [x] 25.4 Call UPDATE_STAFF_ROLES mutation
- [x] 25.5 On success: close modal, trigger refetch

### Task 26: Staff Deactivate Dialog
- [x] 26.1 Create `src/components/modules/iam/StaffDeactivateDialog.tsx`
- [x] 26.2 Warning message about session termination
- [x] 26.3 Display blocking conditions (LAST_ADMIN_ERROR, RECORDS_UNRESOLVED) from backend errors
- [x] 26.4 Disable confirm button when blocked
- [x] 26.5 Call DEACTIVATE_STAFF mutation

### Task 27: Staff Page
- [x] 27.1 Create `src/app/(dashboard)/staff/page.tsx`
- [x] 27.2 Compose: SearchBar, status filter Select, Invite button, StaffTable
- [x] 27.3 Manage modal state (invite, edit roles, deactivate)
- [x] 27.4 Load More button for pagination
- [x] 27.5 Page wrapped in PermissionGate module="organization" action="view" with AccessDenied fallback
- [x] 27.6 Invite button wrapped in PermissionGate module="organization" action="edit"

---

## Module 7: Role Management Page

**Branch:** `feature/auth-iam`

### Task 28: Role Service
- [x] 28.1 Create `src/services/role.service.ts`
- [x] 28.2 Add ROLES_WITH_PERMISSIONS query
- [x] 28.3 Add CREATE_ROLE mutation
- [x] 28.4 Add UPDATE_ROLE mutation
- [x] 28.5 Add DELETE_ROLE mutation
- [x] 28.6 Add STAFF_BY_ROLE query (for delete confirmation)

### Task 29: Role List
- [x] 29.1 Create `src/components/modules/iam/RoleList.tsx`
- [x] 29.2 List roles with: name, permission count, system/custom badge
- [x] 29.3 Edit button for all except OrganizationAdmin
- [x] 29.4 Delete button only for custom roles (not system)
- [x] 29.5 Selectable items with active state indicator

### Task 30: Role Permission Matrix
- [x] 30.1 Create `src/components/modules/iam/RolePermissionMatrix.tsx`
- [x] 30.2 Grid with modules as rows (7 modules), actions as columns (view, create, edit, delete)
- [x] 30.3 Checkbox for each module-action pair
- [x] 30.4 Controlled component with permissions/onChange/disabled props
- [x] 30.5 Toggle logic: add/remove actions, remove module entry when empty

### Task 31: Role Form
- [x] 31.1 Create `src/components/modules/iam/RoleForm.tsx`
- [x] 31.2 Name input + RolePermissionMatrix with react-hook-form + zod
- [x] 31.3 Create mode: empty form, calls CREATE_ROLE
- [x] 31.4 Edit mode: pre-populated, calls UPDATE_ROLE
- [x] 31.5 Read-only mode for OrganizationAdmin (disabled matrix, no submit)
- [x] 31.6 Convert permissions to flat PermissionGrantInput[] for API

### Task 32: Role Delete Dialog
- [x] 32.1 Create `src/components/modules/iam/RoleDeleteDialog.tsx`
- [x] 32.2 Query affected staff members via STAFF_BY_ROLE
- [x] 32.3 Display count and list of affected staff
- [x] 32.4 Warning message about role unassignment
- [x] 32.5 Call DELETE_ROLE mutation

### Task 33: Roles Page
- [x] 33.1 Create `src/app/(dashboard)/staff/roles/page.tsx`
- [x] 33.2 Left panel: RoleList (selectable)
- [x] 33.3 Right panel: RoleForm (shows when role selected or "Create" clicked)
- [x] 33.4 Empty state when no role selected
- [x] 33.5 Create Role button
- [x] 33.6 Page wrapped in PermissionGate module="organization" action="edit" with AccessDenied fallback

---

## Module 8: Integration

**Branch:** `feature/auth-iam`

### Task 34: Environment Variables
- [x] 34.1 Create `.env.local` with NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
- [x] 34.2 Create `.env.example` as template for developers
- [x] 34.3 Verify .env.local is in .gitignore

### Task 35: Sidebar Navigation
- [x] 35.1 Add Staff (/staff) and Roles (/staff/roles) links to sidebar
- [x] 35.2 Wrap IAM links in PermissionGate module="organization" action="view"
- [x] 35.3 Use Users icon for Staff, Shield icon for Roles
- [x] 35.4 Add visual separator between regular nav and IAM nav

### Task 36: Logout Button
- [x] 36.1 Add logout button to sidebar bottom section
- [x] 36.2 Call LOGOUT mutation via useMutation
- [x] 36.3 Call useAuthStore.clearAuth() on success/failure
- [x] 36.4 Redirect to /login after logout
- [x] 36.5 Loading state (disabled button) during logout
- [x] 36.6 Graceful error handling (clear state even if server call fails)

### Task 37: Header User Display
- [x] 37.1 Update Header component to display current user name/email from auth store
- [x] 37.2 Show user initials avatar

### Task 38: CORS Verification
- [x] 38.1 Verify backend CORS_ORIGINS includes http://localhost:3000
- [x] 38.2 Verify backend credentials: true in CORS config
- [x] 38.3 Verify frontend Apollo Client uses credentials: 'include'

### Task 39: E2E Integration Tests
- [x] 39.1 Create `tests/e2e/iam-integration.spec.ts` with Playwright
- [x] 39.2 Test: login page loads and shows form
- [x] 39.3 Test: invalid credentials show error
- [x] 39.4 Test: unauthenticated user redirected to login
- [x] 39.5 Test: invite acceptance page handles tokens
- [x] 39.6 Test: protected routes require authentication
- [x] 39.7 Create `tests/e2e/IAM_INTEGRATION_TEST_PLAN.md` documenting manual test flows
