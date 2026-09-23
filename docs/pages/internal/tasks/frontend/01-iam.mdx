# Frontend Implementation Tasks — IAM Module

> Complete list of all implementation tasks executed for the Hairscope Clinic Platform frontend IAM module (Next.js 16 + Apollo Client + Zustand).

---

## Section 1: Apollo Client Setup with Auth Link Chain

**Branch:** `feature/auth-iam`

### Task 1: Install Dependencies
- 1.1 Verify `@apollo/client` and `graphql` are installed in package.json

### Task 2: Apollo Client with Error Link
- 2.1 Create `src/lib/apollo-client.ts` with HttpLink (credentials: include)
- 2.2 Implement ErrorLink intercepting UNAUTHENTICATED errors
- 2.3 Implement request queuing during token refresh
- 2.4 Implement failed-refresh redirect to /login with auth store clear
- 2.5 Skip refresh for RefreshToken operation (infinite loop prevention)

### Task 3: Apollo Provider
- 3.1 Create `src/providers/ApolloProvider.tsx` with 'use client' directive
- 3.2 Add ApolloProvider to root layout (`src/app/layout.tsx`)

### Task 4: Auth Service GraphQL Documents
- 4.1 Create `src/services/auth.service.ts` with ME query
- 4.2 Add REFRESH_TOKEN mutation document
- 4.3 Add LOGIN mutation document
- 4.4 Add LOGOUT mutation document
- 4.5 Add REQUEST_PASSWORD_RESET mutation document
- 4.6 Add RESET_PASSWORD mutation document

### Task 5: Link Chain Tests
- 5.1 Create `src/lib/apollo-client.test.ts` with vitest
- 5.2 Test: non-UNAUTHENTICATED errors pass through without refresh
- 5.3 Test: UNAUTHENTICATED triggers refresh and retries original request
- 5.4 Test: concurrent requests queued during refresh and replayed after success
- 5.5 Test: failed refresh redirects to /login
- 5.6 Test: RefreshToken operation skipped to avoid infinite loops

---

## Section 2: Auth Store and Route Protection

**Branch:** `feature/auth-iam`

### Task 6: Auth Store (Zustand)
- 6.1 Create `src/stores/auth.store.ts` with staff identity, status, clearAuth, hasPermission

### Task 7: Auth Hook
- 7.1 Create `src/hooks/useAuth.ts` with useQuery(ME) on mount
- 7.2 Set status to loading/authenticated/unauthenticated based on query result
- 7.3 Return `{ staff, status, isAuthenticated, isLoading }`

### Task 8: Permission Hook
- 8.1 Create `src/hooks/usePermission.ts` wrapping auth store hasPermission
- 8.2 Return `{ hasPermission, can }` for inline permission checks

### Task 9: Next.js Middleware
- 9.1 Create `src/middleware.ts` with public routes (/login, /forgot-password, /reset-password, /invite/accept)
- 9.2 Redirect unauthenticated users to /login?redirect=pathname
- 9.3 Redirect authenticated users away from /login to /
- 9.4 Configure matcher to exclude _next, api, favicon

### Task 10: Permission Gate Component
- 10.1 Create `src/components/modules/iam/PermissionGate.tsx`
- 10.2 Props: module, action, children, fallback
- 10.3 Conditional render based on useAuthStore.hasPermission

### Task 11: Access Denied Component
- 11.1 Create `src/components/modules/iam/AccessDenied.tsx`
- 11.2 Full-page fallback with ShieldX icon, message, and dashboard link
- 11.3 Style with theme tokens (status-danger-bg, t-title, t-secondary, btn-primary)

---

## Section 3: Login Page

**Branch:** `feature/auth-iam`

### Task 12: Login Form
- 12.1 Create `src/components/modules/iam/LoginForm.tsx`
- 12.2 Implement react-hook-form + zod validation (email format, password required)
- 12.3 Call LOGIN mutation via useMutation
- 12.4 On success: store staff in auth store, redirect to ?redirect param or /
- 12.5 Loading state with spinner on submit button
- 12.6 Error mapping: INVALID_CREDENTIALS, ACCOUNT_DEACTIVATED, ACCOUNT_NOT_ACTIVATED, network error

### Task 13: Login Page
- 13.1 Create `src/app/(auth)/login/page.tsx`
- 13.2 Centered card layout with logo, heading, LoginForm, forgot password link
- 13.3 Wrapped in Suspense for useSearchParams compatibility
- 13.4 Style with theme tokens (no hardcoded colors)

---

## Section 4: Password Reset Pages

**Branch:** `feature/auth-iam`

### Task 14: Forgot Password Form
- 14.1 Create `src/components/modules/iam/ForgotPasswordForm.tsx`
- 14.2 Email input with zod validation
- 14.3 Call REQUEST_PASSWORD_RESET mutation
- 14.4 On success: show CheckCircle icon + "Check your email" message
- 14.5 Handle RATE_LIMIT_EXCEEDED error
- 14.6 Link back to login

### Task 15: Forgot Password Page
- 15.1 Create `src/app/(auth)/forgot-password/page.tsx`
- 15.2 Logo, heading "Reset Password", description, ForgotPasswordForm

### Task 16: Reset Password Form
- 16.1 Create `src/components/modules/iam/ResetPasswordForm.tsx`
- 16.2 Two password fields (new + confirm) with zod validation + refine for match
- 16.3 Inline password policy requirements checklist with Check/X icons
- 16.4 Accept token prop, call RESET_PASSWORD mutation
- 16.5 On success: store staff in auth store, redirect to dashboard
- 16.6 Error mapping: TOKEN_EXPIRED, TOKEN_ALREADY_USED, RATE_LIMIT_EXCEEDED

### Task 17: Reset Password Page
- 17.1 Create `src/app/(auth)/reset-password/page.tsx`
- 17.2 Read token from URL search params
- 17.3 If no token: show AlertTriangle error with link to request new reset
- 17.4 If token present: render ResetPasswordForm with token prop
- 17.5 Wrapped in Suspense

---

## Section 5: Invite Acceptance Page

**Branch:** `feature/auth-iam`

### Task 18: Invite Service
- 18.1 Create `src/services/invite.service.ts`
- 18.2 Add VALIDATE_INVITE_TOKEN query document
- 18.3 Add ACCEPT_INVITE mutation document

### Task 19: Invite Accept Form
- 19.1 Create `src/components/modules/iam/InviteAcceptForm.tsx`
- 19.2 Read-only email field (disabled input)
- 19.3 Password + confirm fields with zod validation
- 19.4 Inline password policy requirements checklist
- 19.5 Call ACCEPT_INVITE mutation, store staff, redirect to dashboard
- 19.6 Error mapping: INVITE_EXPIRED, INVITE_REVOKED, INVITE_ALREADY_USED

### Task 20: Invite Accept Page
- 20.1 Create `src/app/(auth)/invite/accept/page.tsx`
- 20.2 Read token from URL search params
- 20.3 Validate token on load via VALIDATE_INVITE_TOKEN query (network-only)
- 20.4 Loading state while validating
- 20.5 If valid: render InviteAcceptForm with email from response
- 20.6 If invalid: show error based on error code (INVITE_EXPIRED, INVITE_REVOKED, INVITE_ALREADY_USED)
- 20.7 If no token: show "Invalid invitation link" error

---

## Section 6: Staff Management Page

**Branch:** `feature/auth-iam`

### Task 21: Staff Service
- 21.1 Create `src/services/staff.service.ts`
- 21.2 Add STAFF_LIST query (pagination, filter)
- 21.3 Add ROLES_LIST query
- 21.4 Add INVITE_STAFF mutation
- 21.5 Add UPDATE_STAFF_ROLES mutation
- 21.6 Add DEACTIVATE_STAFF mutation
- 21.7 Add REACTIVATE_STAFF mutation

### Task 22: Staff List Hook
- 22.1 Create `src/hooks/useStaffList.ts`
- 22.2 Apollo useQuery with STAFF_LIST, page size 20
- 22.3 Cursor-based pagination (loadMore via fetchMore)
- 22.4 300ms debounced search
- 22.5 Status filter state
- 22.6 Return `{ staff, loading, error, hasNextPage, loadMore, setSearch, setStatusFilter, refetch }`

### Task 23: Staff Table
- 23.1 Create `src/components/modules/iam/StaffTable.tsx`
- 23.2 Use @tanstack/react-table with columns: Name, Email, Roles (badges), Status (badge), Actions (dropdown)
- 23.3 Status badges: ACTIVE=success, INACTIVE=danger, PENDING_REGISTRATION=warning
- 23.4 Actions dropdown: Edit Roles, Deactivate/Reactivate (based on status)
- 23.5 Actions wrapped in PermissionGate module="organization" action="edit"

### Task 24: Staff Invite Modal
- 24.1 Create `src/components/modules/iam/StaffInviteModal.tsx`
- 24.2 Form with react-hook-form + zod: email (required), roles multi-select (required), firstName/lastName (optional)
- 24.3 Roles loaded via ROLES_LIST query
- 24.4 Call INVITE_STAFF mutation
- 24.5 On success: reset form, close modal, trigger refetch

### Task 25: Staff Edit Roles Modal
- 25.1 Create `src/components/modules/iam/StaffEditRolesModal.tsx`
- 25.2 Multi-select roles pre-populated with current staff roles
- 25.3 Validate at least one role selected
- 25.4 Call UPDATE_STAFF_ROLES mutation
- 25.5 On success: close modal, trigger refetch

### Task 26: Staff Deactivate Dialog
- 26.1 Create `src/components/modules/iam/StaffDeactivateDialog.tsx`
- 26.2 Warning message about session termination
- 26.3 Display blocking conditions (LAST_ADMIN_ERROR, RECORDS_UNRESOLVED) from backend errors
- 26.4 Disable confirm button when blocked
- 26.5 Call DEACTIVATE_STAFF mutation

### Task 27: Staff Page
- 27.1 Create `src/app/(dashboard)/staff/page.tsx`
- 27.2 Compose: SearchBar, status filter Select, Invite button, StaffTable
- 27.3 Manage modal state (invite, edit roles, deactivate)
- 27.4 Load More button for pagination
- 27.5 Page wrapped in PermissionGate module="organization" action="view" with AccessDenied fallback
- 27.6 Invite button wrapped in PermissionGate module="organization" action="edit"

---

## Section 7: Role Management Page

**Branch:** `feature/auth-iam`

### Task 28: Role Service
- 28.1 Create `src/services/role.service.ts`
- 28.2 Add ROLES_WITH_PERMISSIONS query
- 28.3 Add CREATE_ROLE mutation
- 28.4 Add UPDATE_ROLE mutation
- 28.5 Add DELETE_ROLE mutation
- 28.6 Add STAFF_BY_ROLE query (for delete confirmation)

### Task 29: Role List
- 29.1 Create `src/components/modules/iam/RoleList.tsx`
- 29.2 List roles with: name, permission count, system/custom badge
- 29.3 Edit button for all except OrganizationAdmin
- 29.4 Delete button only for custom roles (not system)
- 29.5 Selectable items with active state indicator

### Task 30: Role Permission Matrix
- 30.1 Create `src/components/modules/iam/RolePermissionMatrix.tsx`
- 30.2 Grid with modules as rows (7 modules), actions as columns (view, create, edit, delete)
- 30.3 Checkbox for each module-action pair
- 30.4 Controlled component with permissions/onChange/disabled props
- 30.5 Toggle logic: add/remove actions, remove module entry when empty

### Task 31: Role Form
- 31.1 Create `src/components/modules/iam/RoleForm.tsx`
- 31.2 Name input + RolePermissionMatrix with react-hook-form + zod
- 31.3 Create mode: empty form, calls CREATE_ROLE
- 31.4 Edit mode: pre-populated, calls UPDATE_ROLE
- 31.5 Read-only mode for OrganizationAdmin (disabled matrix, no submit)
- 31.6 Convert permissions to flat PermissionGrantInput[] for API

### Task 32: Role Delete Dialog
- 32.1 Create `src/components/modules/iam/RoleDeleteDialog.tsx`
- 32.2 Query affected staff members via STAFF_BY_ROLE
- 32.3 Display count and list of affected staff
- 32.4 Warning message about role unassignment
- 32.5 Call DELETE_ROLE mutation

### Task 33: Roles Page
- 33.1 Create `src/app/(dashboard)/staff/roles/page.tsx`
- 33.2 Left panel: RoleList (selectable)
- 33.3 Right panel: RoleForm (shows when role selected or "Create" clicked)
- 33.4 Empty state when no role selected
- 33.5 Create Role button
- 33.6 Page wrapped in PermissionGate module="organization" action="edit" with AccessDenied fallback

---

## Section 8: Integration

**Branch:** `feature/auth-iam`

### Task 34: Environment Variables
- 34.1 Create `.env.local` with NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/graphql
- 34.2 Create `.env.example` as template for developers
- 34.3 Verify .env.local is in .gitignore

### Task 35: Sidebar Navigation
- 35.1 Add Staff (/staff) and Roles (/staff/roles) links to sidebar
- 35.2 Wrap IAM links in PermissionGate module="organization" action="view"
- 35.3 Use Users icon for Staff, Shield icon for Roles
- 35.4 Add visual separator between regular nav and IAM nav

### Task 36: Logout Button
- 36.1 Add logout button to sidebar bottom section
- 36.2 Call LOGOUT mutation via useMutation
- 36.3 Call useAuthStore.clearAuth() on success/failure
- 36.4 Redirect to /login after logout
- 36.5 Loading state (disabled button) during logout
- 36.6 Graceful error handling (clear state even if server call fails)

### Task 37: Header User Display
- 37.1 Update Header component to display current user name/email from auth store
- 37.2 Show user initials avatar

### Task 38: CORS Verification
- 38.1 Verify backend CORS_ORIGINS includes http://localhost:3000
- 38.2 Verify backend credentials: true in CORS config
- 38.3 Verify frontend Apollo Client uses credentials: 'include'

### Task 39: E2E Integration Tests
- 39.1 Create `tests/e2e/iam-integration.spec.ts` with Playwright
- 39.2 Test: login page loads and shows form
- 39.3 Test: invalid credentials show error
- 39.4 Test: unauthenticated user redirected to login
- 39.5 Test: invite acceptance page handles tokens
- 39.6 Test: protected routes require authentication
- 39.7 Create `tests/e2e/IAM_INTEGRATION_TEST_PLAN.md` documenting manual test flows


