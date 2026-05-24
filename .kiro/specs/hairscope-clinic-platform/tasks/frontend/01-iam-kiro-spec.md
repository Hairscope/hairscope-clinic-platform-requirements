# Implementation Plan

## Overview

Full-stack IAM module implementation for the Hairscope Clinic Platform covering backend Auth/IAM services (NestJS + GraphQL + MongoDB) and frontend integration (Next.js 16 + Apollo Client + Zustand).

## Tasks

- [x] 1. Backend — Complete Auth Module (Login, Refresh, Logout)
  - [x] 1.1 Verify and fix the AuthSession schema, repository, and service in `packages/api/src/modules/auth/`
  - [x] 1.2 Implement the `login` mutation resolver with HTTP-only cookie response (access + refresh tokens)
  - [x] 1.3 Implement the `refreshToken` mutation with token rotation and stolen-token detection
  - [x] 1.4 Implement the `logout` mutation that revokes the AuthSession and clears cookies
  - [x] 1.5 Implement the `me` query that returns the current authenticated staff with roles and effective permissions
  - [x] 1.6 Configure cookie settings (httpOnly, secure, sameSite, path) for both access and refresh tokens
  - [x] 1.7 Add `@Public()` decorator to login, refreshToken, acceptInvite, requestPasswordReset, and resetPassword resolvers
  - [x] 1.8 Write integration tests for login, refresh, and logout
- [x] 2. Backend — Password Reset Flow
  - [x] 2.1 Create the PasswordResetToken schema and repository in `packages/api/src/modules/auth/`
  - [x] 2.2 Implement `requestPasswordReset` mutation (generate token, hash, store with 24h expiry, invalidate previous tokens, emit outbox event for email)
  - [x] 2.3 Implement `resetPassword` mutation (validate token, update password hash, revoke all sessions, issue new Token_Pair)
  - [x] 2.4 Add rate limiting (3 requests per email per hour) using Redis
  - [x] 2.5 Write integration tests for password reset flow (request, use token, expired token, reuse token, rate limit)
- [x] 3. Backend — Complete IAM Module (Staff CRUD + Invite Flow)
  - [x] 3.1 Verify and fix the Staff schema, repository, and service in `packages/api/src/modules/iam/`
  - [x] 3.2 Implement `inviteStaff` mutation (create Staff with PENDING_REGISTRATION, generate invite token, emit outbox event)
  - [x] 3.3 Implement `acceptInvite` mutation (validate token, enforce password policy, activate staff, create session)
  - [x] 3.4 Implement `cancelInvite` and `resendInvite` mutations
  - [x] 3.5 Implement `staff` query with Relay cursor-based pagination, status filter, and name/email search
  - [x] 3.6 Implement `staffById` query
  - [x] 3.7 Implement `updateStaffRoles` mutation with last-admin guard validation
  - [x] 3.8 Implement `deactivateStaff` mutation (status change, revoke sessions, unresolved records check)
  - [x] 3.9 Implement `reactivateStaff` mutation
  - [x] 3.10 Implement `pendingInvites` query and `validateInviteToken` public query
  - [x] 3.11 Write integration tests for invite flow, staff CRUD, and deactivation
- [x] 4. Backend — Role Management
  - [x] 4.1 Verify and fix the Role schema and repository in `packages/api/src/modules/iam/`
  - [x] 4.2 Implement `createRole` mutation (unique name validation, scoped to org+clinic)
  - [x] 4.3 Implement `updateRole` mutation (prevent editing OrganizationAdmin, allow ClinicAdmin edits)
  - [x] 4.4 Implement `deleteRole` mutation (prevent system role deletion, unassign from staff)
  - [x] 4.5 Implement `roles` and `roleById` queries
  - [x] 4.6 Seed default system roles (OrganizationAdmin, ClinicAdmin) in the seed script
  - [x] 4.7 Write integration tests for role CRUD and permission enforcement
- [x] 5. Frontend — Apollo Client Setup with Auth Link Chain
  - [x] 5.1 Install Apollo Client dependencies (`@apollo/client`, `graphql`)
  - [x] 5.2 Create `src/lib/apollo-client.ts` with HttpLink (credentials: include), ErrorLink (401 refresh logic with request queuing), and ApolloClient instance
  - [x] 5.3 Create `src/providers/ApolloProvider.tsx` wrapping the app with ApolloProvider
  - [x] 5.4 Add ApolloProvider to the root layout
  - [x] 5.5 Create the `REFRESH_TOKEN` mutation document used by the ErrorLink
  - [x] 5.6 Test the link chain: verify 401 triggers refresh, queued requests retry, and failed refresh redirects to login
- [x] 6. Frontend — Auth Store and Route Protection
  - [x] 6.1 Create `src/stores/auth.store.ts` with Zustand (staff identity, status, clearAuth, hasPermission helper)
  - [x] 6.2 Create `src/hooks/useAuth.ts` hook that wraps the store with `initializeAuth()` (calls `me` query on mount)
  - [x] 6.3 Create `src/hooks/usePermission.ts` hook for permission checks in components
  - [x] 6.4 Create `src/middleware.ts` for Next.js route protection (public routes, redirect logic based on accessToken cookie)
  - [x] 6.5 Create `src/components/modules/iam/PermissionGate.tsx` conditional render component
  - [x] 6.6 Create `src/components/modules/iam/AccessDenied.tsx` fallback page component
- [x] 7. Frontend — Login Page
  - [x] 7.1 Create `src/services/auth.service.ts` with GraphQL mutation documents (LOGIN, REFRESH, LOGOUT, REQUEST_PASSWORD_RESET, RESET_PASSWORD)
  - [x] 7.2 Create `src/components/modules/iam/LoginForm.tsx` with react-hook-form + zod validation (email format, password required)
  - [x] 7.3 Create `src/app/(auth)/login/page.tsx` page with LoginForm, error display, and redirect-on-success logic
  - [x] 7.4 Style the login page using theme tokens (centered card layout, logo, form fields)
  - [x] 7.5 Handle all error states: INVALID_CREDENTIALS, ACCOUNT_DEACTIVATED, ACCOUNT_NOT_ACTIVATED, network error
- [x] 8. Frontend — Password Reset Pages
  - [x] 8.1 Create `src/components/modules/iam/ForgotPasswordForm.tsx` (email input, submit, success message)
  - [x] 8.2 Create `src/app/(auth)/forgot-password/page.tsx` page
  - [x] 8.3 Create `src/components/modules/iam/ResetPasswordForm.tsx` (new password + confirm, policy display, token from URL)
  - [x] 8.4 Create `src/app/(auth)/reset-password/page.tsx` page (reads token from query params)
  - [x] 8.5 Handle error states: TOKEN_EXPIRED, TOKEN_ALREADY_USED, RATE_LIMIT_EXCEEDED
- [x] 9. Frontend — Invite Acceptance Page
  - [x] 9.1 Create `src/components/modules/iam/InviteAcceptForm.tsx` (password + confirm, policy requirements display, read-only email)
  - [x] 9.2 Create `src/app/(auth)/invite/accept/page.tsx` page (validates token on load via `validateInviteToken` query, shows form or error)
  - [x] 9.3 Create `src/services/invite.service.ts` with VALIDATE_INVITE_TOKEN query and ACCEPT_INVITE mutation
  - [x] 9.4 Handle error states: INVITE_EXPIRED, INVITE_REVOKED, INVITE_ALREADY_USED, invalid token
- [x] 10. Frontend — Staff Management Page
  - [x] 10.1 Create `src/services/staff.service.ts` with STAFF_LIST query (pagination, filter), UPDATE_STAFF_ROLES, DEACTIVATE_STAFF, REACTIVATE_STAFF mutations
  - [x] 10.2 Create `src/hooks/useStaffList.ts` hook with pagination, search debounce, and status filter state
  - [x] 10.3 Create `src/components/modules/iam/StaffTable.tsx` using @tanstack/react-table (columns: name, email, roles badges, status badge, actions)
  - [x] 10.4 Create `src/components/modules/iam/StaffInviteModal.tsx` (email, role multi-select, optional name fields, submit with validation)
  - [x] 10.5 Create `src/components/modules/iam/StaffEditRolesModal.tsx` (multi-select roles, pre-populated, save)
  - [x] 10.6 Create `src/components/modules/iam/StaffDeactivateDialog.tsx` (confirmation with warnings, blocking conditions display)
  - [x] 10.7 Create `src/app/(dashboard)/staff/page.tsx` composing StaffTable, search, filters, invite button, and modals
  - [x] 10.8 Add permission gates: only show page to staff with ORGANIZATION:VIEW, only show actions to staff with ORGANIZATION:EDIT
- [x] 11. Frontend — Role Management Page
  - [x] 11.1 Create `src/services/role.service.ts` with ROLES query, CREATE_ROLE, UPDATE_ROLE, DELETE_ROLE mutations
  - [x] 11.2 Create `src/components/modules/iam/RoleList.tsx` (list of roles with name, permission count, system/custom badge, actions)
  - [x] 11.3 Create `src/components/modules/iam/RolePermissionMatrix.tsx` (modules as rows, actions as columns, checkbox grid)
  - [x] 11.4 Create `src/components/modules/iam/RoleForm.tsx` (name input + PermissionMatrix, create/edit mode)
  - [x] 11.5 Create `src/app/(dashboard)/staff/roles/page.tsx` composing RoleList and RoleForm
  - [x] 11.6 Handle system role restrictions (OrganizationAdmin not editable, ClinicAdmin editable, system roles not deletable)
  - [x] 11.7 Add delete confirmation dialog listing affected staff members
- [x] 12. Integration — Connect Frontend to Backend
  - [x] 12.1 Configure environment variables (NEXT_PUBLIC_GRAPHQL_URL pointing to backend)
  - [x] 12.2 Update the sidebar navigation to show/hide IAM links based on permissions
  - [x] 12.3 Add logout button to the header/sidebar that calls logout mutation and clears state
  - [x] 12.4 Test full flow: login → navigate → token expires → auto-refresh → continue working
  - [x] 12.5 Test full flow: invite staff → receive link → accept invite → logged in → see dashboard
  - [x] 12.6 Test full flow: create role → assign to staff → verify permission gates work
  - [x] 12.7 Verify CORS configuration between frontend (localhost:3000) and backend (localhost:4000)

## Task Dependency Graph

```json
{
  "waves": [
    { "tasks": [1], "description": "Backend Auth Module - foundation for all other tasks" },
    { "tasks": [2, 3, 5], "description": "Password Reset, IAM Module, and Apollo Client (all depend on Auth)" },
    { "tasks": [4, 6], "description": "Role Management and Auth Store (depend on wave 2)" },
    { "tasks": [7], "description": "Login Page (depends on Apollo Client and Auth Store)" },
    { "tasks": [8, 9, 10], "description": "Password Reset Pages, Invite Page, Staff Management (depend on Login Page)" },
    { "tasks": [11], "description": "Role Management Page (depends on Staff Management)" },
    { "tasks": [12], "description": "Integration (depends on all frontend and backend tasks)" }
  ],
  "dependencies": {
    "1": [],
    "2": [1],
    "3": [1],
    "4": [3],
    "5": [1],
    "6": [5],
    "7": [5, 6],
    "8": [7],
    "9": [6, 7],
    "10": [6, 7],
    "11": [10],
    "12": [7, 8, 9, 10, 11, 4]
  }
}
```

## Notes

- Backend tasks target the `hairscope-backend` repo at `d:\GitHub\hairscope-backend`
- Frontend tasks target the `hairscope-clinic-web` repo at `d:\GitHub\hairscope-clinic-web`
- The backend already has partial implementations on the `feature/auth-iam` branch
- All backend modules use NestJS + GraphQL code-first + MongoDB (Mongoose)
- Frontend uses Next.js 16, Apollo Client, Zustand, react-hook-form, zod, @tanstack/react-table
