# Identity & Access Management

> Covers: Staff lifecycle, authentication, roles, permissions, invitations, and session management.

---

## Glossary

- **Staff**: Any authenticated human user of the platform belonging to a Clinic or Organization.
- **Role**: A named set of `(module, action)` permissions assignable to one or more Staff members.
- **Permission**: A single `(module, action)` grant where action ∈ `{view, create, edit, delete}`.
- **Invite**: A single-use, time-limited email link sent to a prospective Staff member to complete registration.
- **Pending_Registration**: The status of a Staff record that has been created by an Admin invite but whose password has not yet been set by the invitee.
- **JWT**: JSON Web Token issued on successful authentication, scoped to the Staff member's organization, clinic, and effective permissions.
- **Effective_Permissions**: The union of all permissions granted by all roles assigned to a Staff member.
- **Deactivation**: Setting a Staff member's status to `Inactive`, revoking authentication while preserving all associated data.

---

## Requirements

### IAM-1: Staff Registration via Invite

**User Story:** As a Clinic_Admin or Organization_Admin, I want to invite staff via email so that new members can securely create their own accounts.

#### Invite Flow

The invite flow has two distinct phases with different actors:

**Phase 1 — Admin sends invite:**
1. Admin enters the invitee's email address and assigns one or more roles.
2. THE Platform validates the email is not already registered or already invited.
3. THE Platform creates a Staff record with status `PENDING_REGISTRATION` and the assigned roles.
4. THE Platform generates a unique single-use token and sends the invite link to the invitee's email.

**Phase 2 — Invitee accepts invite:**
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
10. THE Platform SHALL record invite sent, invite used, invite expired, and invite cancelled events in the Audit_Log.

#### Failure Cases — Admin-facing (at invite send time)

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| Email already has an `ACTIVE` or `INACTIVE` Staff record in this Clinic | `EMAIL_ALREADY_EXISTS` | Shown to Admin; no new record created |
| Email already has a `PENDING_REGISTRATION` record in this Clinic | `EMAIL_ALREADY_INVITED` | Shown to Admin; Admin can resend instead |
| No role assigned | `VALIDATION_ERROR` (field: `roles`) | Shown to Admin; no record created |

#### Failure Cases — Invitee-facing (at link follow time)

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

1. WHEN a Staff member submits valid credentials, THE Platform SHALL issue a signed JWT containing: `staffId`, `organizationId`, `clinicId`, `roles`, `effectivePermissions`, and `exp`.
2. IF credentials are invalid, THE Platform SHALL return an `INVALID_CREDENTIALS` error and SHALL NOT issue a token.
3. IF the Staff member's status is `Inactive`, THE Platform SHALL return an `ACCOUNT_DEACTIVATED` error and SHALL NOT issue a token.
4. THE Platform SHALL record every successful and failed authentication attempt in the Audit_Log.
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

**User Story:** As a Clinic_Admin or Organization_Admin, I want to manage staff profiles so that the roster always reflects accurate information.

#### Acceptance Criteria

1. THE Platform SHALL store the following fields per Staff member: `firstName`, `lastName`, `email` (immutable after invite), `phone`, `roles[]`, `specialization`, `experience`, `status`, `clinicId`, `organizationId`, `createdAt`, `updatedAt`.
2. THE Platform SHALL allow an Admin to edit all profile fields except `email`.
3. THE Platform SHALL allow a Staff member to edit their own `firstName`, `lastName`, `phone`, `specialization`, and `experience`.
4. WHEN a Staff profile is updated, THE Platform SHALL record the change in the Audit_Log with before/after values.
5. Organization_Admins SHALL be able to view and edit Staff profiles across all Clinics within their Organization.

---

### IAM-4: Staff Deactivation and Reactivation

**User Story:** As a Clinic_Admin or Organization_Admin, I want to deactivate a staff member without losing their data so that I can remove access while preserving clinical records.

#### Acceptance Criteria

1. WHEN an Admin deactivates a Staff member, THE Platform SHALL set status to `Inactive` and immediately invalidate all active JWTs for that Staff member.
2. WHEN a Staff member is deactivated, THE Platform SHALL preserve all records associated with that Staff member unchanged.
3. THE Platform SHALL NOT allow deactivation of the last remaining active Clinic_Admin in a Clinic.
4. THE Platform SHALL NOT allow deactivation of the last remaining active Organization_Admin in an Organization.
5. THE Platform SHALL allow reactivation of a deactivated Staff member, restoring authentication access.
6. WHEN deactivated or reactivated, THE Platform SHALL record the action in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Deactivating last active Clinic_Admin | `LAST_CLINIC_ADMIN` |
| Deactivating last active Organization_Admin | `LAST_ORG_ADMIN` |

#### Correctness Properties

- For any Staff member S deactivated at time T, every record associated with S that existed before T SHALL remain unchanged after T.
- After deactivation, all active JWTs for S SHALL be rejected within one request cycle.

---

### IAM-5: Staff Deletion and Data Transfer

**User Story:** As a Clinic_Admin or Organization_Admin, I want to delete a staff member only after transferring their records so that no clinical data is lost.

#### Acceptance Criteria

1. WHEN an Admin initiates deletion, THE Platform SHALL return the full list of reassignable records owned by the departing Staff member (see `core/data-ownership.md` for the complete list).
2. THE Platform SHALL require selection of one or more recipient Staff members before deletion proceeds. Different record categories may be reassigned to different recipients (multi-recipient reassignment).
3. THE Platform SHALL validate that all recipients belong to the same Clinic (or valid target Clinic in case of inter-clinic transfer) and are Active.
4. WHEN confirmed, THE Platform SHALL atomically reassign all responsibility-based fields to the designated recipients and mark the Staff member as `INACTIVE`.
5. THE Platform SHALL NOT physically delete the Staff record — it is retained for audit log attribution.
6. THE Platform SHALL NOT reassign Audit_Log entries — they remain attributed to the original Staff member's name permanently.
7. THE Platform SHALL NOT allow deletion of the last remaining active Clinic_Admin or Organization_Admin.
8. WHEN deleted, THE Platform SHALL record the deletion, the recipient identities, and the list of reassigned record types in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| No recipient selected for a reassignable category | `RECIPIENT_REQUIRED` |
| Recipient is inactive | `RECIPIENT_INACTIVE` |
| Recipient belongs to a different Clinic | `FORBIDDEN` |
| Deleting last active Clinic_Admin | `LAST_CLINIC_ADMIN` |
| Deleting last active Organization_Admin | `LAST_ORG_ADMIN` |

#### Correctness Properties

- After deletion, every transferable record previously owned by S SHALL be owned by recipient R.
- Audit_Log entries attributed to S SHALL continue to reference S's original name, not R's name.
- After any Staff deletion, count of active Clinic_Admins in the Clinic SHALL remain ≥ 1.

---

### IAM-6: Role Management

**User Story:** As a Clinic_Admin, I want to create and manage roles with granular permissions so that I can precisely control what each staff member can do.

#### Acceptance Criteria

1. THE Platform SHALL provide default roles as defined in `requirements.md` Section 3.2.
2. THE Platform SHALL allow a Clinic_Admin to create custom roles with a name and a set of `(module, action)` permissions.
3. THE Platform SHALL allow a Clinic_Admin to edit any role's name and permissions, except the `Organization_Admin` role whose permissions are fixed.
4. THE Platform SHALL allow a Clinic_Admin to delete any role except when doing so would leave the Clinic with no active Clinic_Admin.
5. WHEN a role's permissions are updated, THE Platform SHALL apply the change to all Staff members holding that role within one request cycle.
6. WHEN a Staff member holds multiple roles, THE Platform SHALL apply the union of all permissions as the effective permissions.
7. WHEN a role is created, edited, or deleted, THE Platform SHALL record the change in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Editing Organization_Admin permissions | `ROLE_NOT_EDITABLE` |
| Deleting role that would remove last Clinic_Admin | `LAST_CLINIC_ADMIN` |
| Assigning clinical module permission to Organization_Admin role | `ORG_SCOPE_VIOLATION` |

#### Correctness Properties

- For any Staff member S holding roles R1 and R2: `effective_permissions(S) = permissions(R1) ∪ permissions(R2)`.
- For any Staff member S holding the Organization_Admin role, S SHALL NOT have permissions to `patients`, `appointments`, `leads`, `billing`, or `products` modules regardless of other roles.
- For every `(module, action)` pair not granted by any role assigned to S, every request by S for that action SHALL be denied.

---

### IAM-7: Multi-Device Session Rules

**User Story:** As a Staff member, I want to use the platform on multiple devices simultaneously so that I can work flexibly.

#### Acceptance Criteria

1. THE Platform SHALL allow a Staff member to be authenticated on multiple devices simultaneously, each with an independent JWT.
2. WHEN a Staff member is deactivated, THE Platform SHALL invalidate all active JWTs across all devices immediately.
3. WHEN a Staff member's role permissions are updated, the change SHALL take effect on the next API request — active JWTs are not forcibly terminated.
4. THE Platform SHALL NOT allow JWT storage in `localStorage` on web clients — tokens must use `httpOnly` cookies or secure in-memory storage.
5. Web component sessions are stateless and authenticated per-request via clinic API key.
