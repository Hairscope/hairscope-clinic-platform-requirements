# Identity & Access Management

> Covers: Staff lifecycle, authentication, roles, permissions, invitations, and session management.

---

## Glossary

- **Staff**: Any authenticated human user of the platform belonging to a Clinic or Organization.
- **Role**: A named set of `(module, action)` permissions assignable to one or more Staff members.
- **Permission**: A single `(module, action)` grant where action ∈ `{view, create, edit, delete}`.
- **Invite**: A single-use, time-limited email link sent to a prospective Staff member to complete registration.
- **PendingRegistration**: The status of a Staff record that has been created by an Admin invite but whose password has not yet been set by the invitee.
- **JWT**: JSON Web Token issued on successful authentication, scoped to the Staff member's organization, clinic, and effective permissions.
- **EffectivePermissions**: The union of all permissions granted by all roles assigned to a Staff member.
- **Deactivation**: Setting a Staff member's status to `Inactive`, revoking authentication while preserving all associated data.
- **SystemRole**: A platform-defined role (`OrganizationAdmin` or `ClinicAdmin`) that cannot be deleted. These roles are always present in every Clinic and their existence is required for the platform's last-admin guards to function.

---

## Requirements

### IAM-1: Staff Registration via Invite

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to invite staff via email so that new members can securely create their own accounts.

#### Invite Flow

The invite flow has two distinct phases with different actors:

**Phase 1 - Admin sends invite:**
1. Admin enters the invitee's email address and assigns one or more roles.
2. THE Platform validates the email is not already registered or already invited.
3. THE Platform creates a Staff record with status `PENDING_REGISTRATION` and the assigned roles.
4. THE Platform generates a unique single-use token and sends the invite link to the invitee's email.

**Phase 2 - Invitee accepts invite:**
1. Invitee follows the link and sets a password.
2. THE Platform transitions the Staff record from `PENDING_REGISTRATION` → `ACTIVE`.
3. THE Platform issues a JWT and the invitee is logged in.
4. The invitee can then complete their profile (First Name, Last Name, Phone, Specialization, Experience) from within the platform.

#### Acceptance Criteria

1. WHEN an Admin sends an invitation, THE Platform SHALL require the invitee's email address and at least one role assignment.
2. WHEN an Admin sends an invitation, THE Platform SHALL create a Staff record with status `PENDING_REGISTRATION` and the assigned roles, then send the invite link to the invitee's email.
3. THE invite link SHALL expire exactly 7 days after issuance.
4. WHEN an invitee follows a valid invite link, THE Platform SHALL present a form to set a new password. Once the password is set, the Staff record transitions to `ACTIVE` and a JWT is issued.
5. WHEN the Staff record is activated, THE Platform SHALL allow the Staff member to complete their profile (First Name, Last Name, Phone, Specialization, Experience) from within the platform.
6. IF an invitee follows an expired invite link, THE Platform SHALL return an `INVITE_EXPIRED` error. The Staff record remains in `PENDING_REGISTRATION` status.
7. IF an invitee follows an already-used invite link (password already set), THE Platform SHALL return an `INVITE_ALREADY_USED` error. If the password was not yet set, the link SHALL work normally.
8. THE Platform SHALL allow an Admin to resend an invite to a Staff member in `PENDING_REGISTRATION` status; resending invalidates the previous token and issues a new one with a fresh 7-day expiry.
9. THE Platform SHALL allow an Admin to cancel a pending invite, which deletes the `PENDING_REGISTRATION` Staff record.
10. THE Platform SHALL record invite sent, invite used, invite expired, and invite cancelled events in the AuditLog.

#### Failure Cases - Admin-facing (at invite send time)

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| Email already has an `ACTIVE` or `INACTIVE` Staff record in this Clinic | `EMAIL_ALREADY_EXISTS` | Shown to Admin; no new record created |
| Email already has a `PENDING_REGISTRATION` record in this Clinic | `EMAIL_ALREADY_INVITED` | Shown to Admin; Admin can resend instead |
| No role assigned | `VALIDATION_ERROR` (field: `roles`) | Shown to Admin; no record created |

#### Failure Cases - Invitee-facing (at link follow time)

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| Invite token not found | `INVITE_NOT_FOUND` | Staff record status unchanged |
| Invite token expired | `INVITE_EXPIRED` | Staff record remains `PENDING_REGISTRATION` |
| Invite token already used (password set) | `INVITE_ALREADY_USED` | Staff record already `ACTIVE` |
| Invite token revoked (resend issued) | `INVITE_REVOKED` | Staff record remains `PENDING_REGISTRATION` |

#### Correctness Properties

- For any Invite issued at time T, it is valid for all instants in `[T, T+7d)` and invalid for all instants `≥ T+7d`.
- Using the same invite link after password has been set SHALL NOT create a second Staff account.
- After resend, the previous invite token SHALL be invalid regardless of its remaining TTL.
- At the moment an invite is sent, exactly one Staff record with status `PENDING_REGISTRATION` SHALL exist for that email in that Clinic.
- A Staff record in `PENDING_REGISTRATION` status SHALL NOT be able to authenticate.

---

### IAM-2: Authentication

**User Story:** As a Staff member, I want to authenticate with my email and password so that I can access the platform securely.

#### Acceptance Criteria

1. WHEN a Staff member submits valid credentials, THE Platform SHALL issue a signed JWT containing identity and session scope only: `staffId`, `organizationId`, `clinicId`, `authSessionId`, `iat`, and `exp`. Roles, permissions, and entitlements SHALL NOT be embedded in the JWT — effective access is resolved server-side on every request (see designs `04-authentication.md` and `05-authorization.md`).
2. IF credentials are invalid, THE Platform SHALL return an `INVALID_CREDENTIALS` error and SHALL NOT issue a token.
3. IF the Staff member's status is `Inactive`, THE Platform SHALL return an `ACCOUNT_DEACTIVATED` error and SHALL NOT issue a token.
4. THE Platform SHALL record every successful and failed authentication attempt in the AuditLog.
5. THE Platform SHALL support token refresh without requiring re-entry of credentials, provided the refresh token is valid and the Staff member is still `Active`.
6. WHEN a Staff member logs out, THE Platform SHALL invalidate the current JWT and refresh token.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Invalid email or password | `INVALID_CREDENTIALS` |
| Account deactivated | `ACCOUNT_DEACTIVATED` |
| Token expired | `UNAUTHENTICATED` |
| Token revoked | `UNAUTHENTICATED` |

#### Correctness Properties

- After deactivation, any authentication attempt by the deactivated Staff member SHALL fail with `ACCOUNT_DEACTIVATED`.
- A JWT issued before deactivation SHALL be rejected on the next API request after deactivation takes effect.

---

### IAM-3: Staff Profile Management

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to manage staff profiles so that the roster always reflects accurate information.

#### Acceptance Criteria

1. THE Platform SHALL store the following fields per Staff member: `firstName`, `lastName`, `email` (immutable after invite), `phone`, `roles[]`, `specialization`, `experience`, `status`, `clinicId`, `organizationId`, `createdAt`, `updatedAt`.
2. THE Platform SHALL allow an Admin to edit all profile fields except `email`.
3. THE Platform SHALL allow a Staff member to edit their own `firstName`, `lastName`, `phone`, `specialization`, and `experience`.
4. WHEN a Staff profile is updated, THE Platform SHALL record the change in the AuditLog with before/after values.
5. OrganizationAdmins SHALL be able to view and edit Staff profiles across all Clinics within their Organization.

---

### IAM-4: Staff Deactivation and Reactivation

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to deactivate a staff member without losing their data so that I can remove access while preserving clinical records.

#### Acceptance Criteria

1. WHEN an Admin deactivates a Staff member, THE Platform SHALL require reassignment of all `assignedTo` records (sessions, leads, appointments) to other active Staff members before deactivation proceeds (same pattern as staff deletion IAM-5).
2. WHEN reassignment is complete, THE Platform SHALL set status to `Inactive` and immediately invalidate all active JWTs for that Staff member.
3. WHEN a Staff member is deactivated, THE Platform SHALL preserve all records associated with that Staff member unchanged (attribution fields remain intact).
4. THE Platform SHALL NOT allow deactivation of the last remaining active ClinicAdmin in a Clinic.
5. THE Platform SHALL NOT allow deactivation of the last remaining active OrganizationAdmin in an Organization.
6. THE Platform SHALL allow reactivation of a deactivated Staff member, restoring authentication access. Reactivation does NOT restore previous record assignments — those remain with the reassigned recipients.
7. WHEN deactivated or reactivated, THE Platform SHALL record the action in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Deactivating last active ClinicAdmin | `LAST_CLINIC_ADMIN` |
| Deactivating last active OrganizationAdmin | `LAST_ORG_ADMIN` |

#### Correctness Properties

- For any Staff member S deactivated at time T, every record associated with S that existed before T SHALL remain unchanged after T.
- After deactivation, all active JWTs for S SHALL be rejected within one request cycle.

---

### IAM-5: Staff Deletion and Data Transfer

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to delete a staff member only after transferring their records so that no clinical data is lost.

#### Acceptance Criteria

1. WHEN an Admin initiates deletion, THE Platform SHALL return the full list of reassignable records owned by the departing Staff member (see `core/data-ownership.md` for the complete list).
2. THE Platform SHALL require selection of one or more recipient Staff members before deletion proceeds. Different record categories may be reassigned to different recipients (multi-recipient reassignment).
3. THE Platform SHALL validate that all recipients belong to the same Clinic (or valid target Clinic in case of inter-clinic transfer) and are Active.
4. WHEN confirmed, THE Platform SHALL atomically reassign all responsibility-based fields to the designated recipients and mark the Staff member as `INACTIVE`.
5. THE Platform SHALL NOT physically delete the Staff record - it is retained for audit log attribution.
6. THE Platform SHALL NOT reassign AuditLog entries - they remain attributed to the original Staff member's name permanently.
7. THE Platform SHALL NOT allow deletion of the last remaining active ClinicAdmin or OrganizationAdmin.
8. WHEN deleted, THE Platform SHALL record the deletion, the recipient identities, and the list of reassigned record types in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| No recipient selected for a reassignable category | `RECIPIENT_REQUIRED` |
| Recipient is inactive | `RECIPIENT_INACTIVE` |
| Recipient belongs to a different Clinic | `FORBIDDEN` |
| Deleting last active ClinicAdmin | `LAST_CLINIC_ADMIN` |
| Deleting last active OrganizationAdmin | `LAST_ORG_ADMIN` |

#### Correctness Properties

- After deletion, every transferable record previously owned by S SHALL be owned by recipient R.
- AuditLog entries attributed to S SHALL continue to reference S's original name, not R's name.
- After any Staff deletion, count of active ClinicAdmins in the Clinic SHALL remain ≥ 1.

---

### IAM-6: Role Management

**User Story:** As a ClinicAdmin, I want to create and manage roles with granular permissions so that I can precisely control what each staff member can do.

#### Role Classification

| Category | Roles | Permissions Editable | Deletable |
|----------|-------|---------------------|-----------|
| System roles | `OrganizationAdmin`, `ClinicAdmin` | `OrganizationAdmin`: No. `ClinicAdmin`: Yes | No - cannot be deleted under any circumstance |
| Default clinic roles | `Doctor`, `Receptionist`, `Nurse`, `Sales`, `Marketing`, `Frontdesk` | Yes | Yes - subject to last-admin guard |
| Custom roles | Any role created by a ClinicAdmin | Yes | Yes - subject to last-admin guard |

#### Acceptance Criteria

1. THE Platform SHALL provide the system and default clinic roles defined in `requirements.md` Section 3.2.
2. THE Platform SHALL allow a ClinicAdmin to create custom roles with a name and a set of `(module, action)` permissions.
3. THE Platform SHALL allow a ClinicAdmin to edit the name and permissions of any non-system role (`Doctor`, `Receptionist`, `Nurse`, `Sales`, `Marketing`, `Frontdesk`, and custom roles).
4. THE Platform SHALL allow a ClinicAdmin to edit the permissions of the `ClinicAdmin` role, but SHALL NOT allow editing of the `OrganizationAdmin` role's permissions.
5. THE Platform SHALL NOT allow deletion of `OrganizationAdmin` or `ClinicAdmin` roles under any circumstance - they are system roles.
6. THE Platform SHALL allow a ClinicAdmin to delete any non-system role, provided doing so would not leave the Clinic with no active ClinicAdmin.
7. WHEN a role's permissions are updated, THE Platform SHALL apply the change to all Staff members holding that role within one request cycle.
8. WHEN a Staff member holds multiple roles, THE Platform SHALL apply the union of all permissions as the effective permissions.
9. WHEN a role is created, edited, or deleted, THE Platform SHALL record the change in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Editing `OrganizationAdmin` permissions | `ROLE_NOT_EDITABLE` |
| Deleting `OrganizationAdmin` or `ClinicAdmin` role | `ROLE_NOT_DELETABLE` |
| Deleting a role that would leave the Clinic with no active ClinicAdmin | `LAST_CLINIC_ADMIN` |
| Assigning clinical module permission to `OrganizationAdmin` role | `ORG_SCOPE_VIOLATION` |

#### Correctness Properties

- `OrganizationAdmin` and `ClinicAdmin` roles SHALL exist in every Clinic at all times and SHALL NOT be deletable by any operation.
- For any Staff member S holding roles R1 and R2: `effective_permissions(S) = permissions(R1) ∪ permissions(R2)`.
- For any Staff member S holding the `OrganizationAdmin` role, S SHALL NOT have permissions to `patients`, `appointments`, `billing`, or `catalog` modules regardless of other roles. S MAY access the `leads` module for assignment purposes.
- For every `(module, action)` pair not granted by any role assigned to S, every request by S for that action SHALL be denied.

---

### IAM-7: Multi-Device Session Rules

**User Story:** As a Staff member, I want to use the platform on multiple devices simultaneously so that I can work flexibly.

#### Acceptance Criteria

1. THE Platform SHALL allow a Staff member to be authenticated on multiple devices simultaneously, each with an independent JWT.
2. WHEN a Staff member is deactivated, THE Platform SHALL invalidate all active JWTs across all devices immediately.
3. WHEN a Staff member's role permissions are updated, the change SHALL take effect on the next API request - active JWTs are not forcibly terminated.
4. THE Platform SHALL NOT allow JWT storage in `localStorage` on web clients - tokens must use `httpOnly` cookies or secure in-memory storage.
5. Web component sessions are stateless and authenticated per-request via clinic API key.

---

### IAM-8: Password Policy

**User Story:** As a platform operator, I want to enforce a minimum password strength so that staff accounts are protected against brute-force and credential-stuffing attacks.

#### Acceptance Criteria

1. THE Platform SHALL require passwords to be a minimum of 8 characters in length.
2. THE Platform SHALL require passwords to contain at least one alphabetic character (a–z or A–Z).
3. THE Platform SHALL require passwords to contain at least one numeric character (0–9).
4. THE Platform SHALL require passwords to contain at least one symbol character (e.g., `!@#$%^&*()-_+=`).
5. IF a password does not meet all of the above criteria, THE Platform SHALL reject the password and return a `VALIDATION_ERROR` with field `password` and a human-readable message describing the requirements.
6. THE password policy SHALL apply to: initial password set during invite acceptance, and any future password change or reset operation.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Password shorter than 8 characters | `VALIDATION_ERROR` (field: `password`) |
| Password missing alphabetic character | `VALIDATION_ERROR` (field: `password`) |
| Password missing numeric character | `VALIDATION_ERROR` (field: `password`) |
| Password missing symbol character | `VALIDATION_ERROR` (field: `password`) |

#### Correctness Properties

- For any password P accepted by the platform: `length(P) ≥ 8` AND `P` contains at least one letter AND at least one digit AND at least one symbol.
- For any password P that does not meet all criteria: the set-password or change-password operation SHALL fail and no credential SHALL be stored.

---

### IAM-9: Session Lifetime

**User Story:** As a Staff member, I want my session to remain active until I explicitly log out so that I don't get interrupted during long clinical workflows.

#### Acceptance Criteria

1. THE Platform SHALL NOT expire authenticated sessions based on idle time or a fixed duration. Sessions remain active indefinitely until explicitly terminated.
2. A session SHALL only be terminated by:
   - The Staff member explicitly logging out.
   - An Admin deactivating or deleting the Staff member's account.
   - An Admin revoking the session (if a revocation mechanism is provided in a future iteration).
3. THE Platform SHALL issue JWTs without a short-lived expiry. Tokens SHALL remain valid until logout or account deactivation.
4. WHEN a Staff member logs out, THE Platform SHALL invalidate the JWT and refresh token for that device session only. Other device sessions remain unaffected.

#### Correctness Properties

- For any Staff member S who has not logged out and whose account is `ACTIVE`: S's session SHALL remain authenticated on every subsequent request without re-authentication.
- For any Staff member S who logs out on device D: S's session on D SHALL be invalidated, but sessions on other devices SHALL remain active.

---

### IAM-10: Password Reset (Forgot Password)

**User Story:** As a Staff member who has forgotten my password, I want to reset it via email so that I can regain access to my account without contacting an admin.

#### Acceptance Criteria

1. THE Platform SHALL provide a "Forgot Password" option on the login page.
2. WHEN a Staff member enters their email and submits the forgot password form, THE Platform SHALL send a password reset link to that email address.
3. THE reset link SHALL be a single-use token that expires after 24 hours.
4. WHEN the Staff member follows a valid reset link, THE Platform SHALL present a form to set a new password. The new password must comply with the password policy (IAM-8).
5. WHEN the new password is set successfully, THE Platform SHALL invalidate the reset token and all existing JWTs for that Staff member (forcing re-login on all devices with the new password).
6. IF the email does not match any Staff record, THE Platform SHALL still return a success response (to prevent email enumeration attacks). No email is sent.
7. IF the reset token is expired or already used, THE Platform SHALL return a `RESET_TOKEN_EXPIRED` error.
8. THE Platform SHALL record password reset requests (sent) and completions (used) in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Reset token expired | `RESET_TOKEN_EXPIRED` |
| Reset token already used | `RESET_TOKEN_EXPIRED` |
| Reset token not found | `RESET_TOKEN_EXPIRED` |
| New password does not meet policy | `VALIDATION_ERROR` (field: `password`) |

#### Correctness Properties

- For any reset token issued at time T: it is valid for all instants in `[T, T+24h)` and invalid for all instants `≥ T+24h`.
- After a successful password reset: all previously issued JWTs for that Staff member SHALL be invalidated.
- A forgot password request for a non-existent email SHALL NOT reveal whether the email exists in the system.
