# Requirements Document — Staff Management

## Introduction

The Staff Management module governs the full lifecycle of staff members within the Hairscope Clinic Platform. It covers organization and clinic hierarchy, staff onboarding via email invite, role and permission management, clinic profile configuration, and audit logging. All staff operations are scoped to the Organization → Clinics → Staff hierarchy defined in the master requirements.

---

## Glossary

Refer to the master requirements glossary for platform-wide terms. Additional terms specific to this module:

- **Clinic_Profile**: The full configuration record for a Clinic, including contact details, branding, working hours, services, and terms.
- **Working_Hours**: The configured operating schedule for a Clinic, used to generate available appointment slots.
- **Report_Header**: Clinic branding information (logo, name, address) printed at the top of generated Reports.
- **Deactivation**: Setting a Staff member's status to Inactive while preserving all associated data.
- **Data_Transfer**: The process of reassigning all records owned by a departing Staff member to a designated recipient before deletion.

---

## Requirements

### Requirement STF-1: Organization and Clinic Hierarchy

**User Story:** As an Organization_Admin, I want to manage multiple clinics from a single account so that I can oversee the entire organization without switching between separate accounts.

#### Acceptance Criteria

1. THE Platform SHALL support exactly one Organization_Admin per Organization, who holds the highest access level within that Organization.
2. THE Organization_Admin SHALL be able to view all Clinics within the Organization, including their profiles and staff rosters.
3. WHILE a Staff member holds only Clinic-level roles, THE Platform SHALL prevent that Staff member from accessing data or settings belonging to other Clinics within the same Organization.
4. THE Organization_Admin SHALL NOT be able to edit Clinic-level records directly — Clinic-level edits SHALL be performed by Clinic Admins.
5. THE Platform SHALL allow the Organization_Admin to create new Clinics within the Organization.
6. WHEN a new Clinic is created, THE Platform SHALL require at minimum a Clinic name and address.

#### Correctness Properties

- **Hierarchy isolation**: For any Staff member S with only Clinic-level roles assigned to Clinic C, every request by S targeting data in any other Clinic C' (C ≠ C') SHALL be denied.
- **Org admin read access**: For any Organization_Admin A and any Clinic C within A's Organization, A SHALL be able to read C's profile and staff roster.
- **Org admin write restriction**: For any Organization_Admin A and any Clinic C, A SHALL NOT be able to modify C's profile or staff records directly.

---

### Requirement STF-2: Self-Registration Onboarding

**User Story:** As a new clinic owner, I want to self-register my organization and clinic with minimal information so that I can start using the platform immediately without a lengthy setup process.

#### Acceptance Criteria

1. WHEN a new user submits the self-registration form, THE Platform SHALL create an Organization record, a Clinic record, and an Admin Staff account using only the provided Organization name, Clinic name, and Clinic address.
2. THE Platform SHALL NOT require any additional information beyond Organization name, Clinic name, and Clinic address during self-registration.
3. WHEN self-registration is complete, THE Platform SHALL grant the registering user Admin access to the newly created Clinic.
4. THE Platform SHALL allow the Admin to complete the full Clinic_Profile at any time after self-registration.
5. WHEN the self-registration form is submitted with any of the three required fields missing, THE Platform SHALL reject the submission and return a descriptive validation error identifying the missing field(s).

#### Correctness Properties

- **Minimalism**: A self-registration submission containing exactly Organization name, Clinic name, and Clinic address SHALL succeed and produce exactly one Organization, one Clinic, and one Admin Staff record.
- **Rejection on missing fields**: A self-registration submission missing any of the three required fields SHALL fail and produce zero new records.

---

### Requirement STF-3: Clinic Profile Management

**User Story:** As a Clinic Admin, I want to configure a complete clinic profile so that all clinic details are accurately reflected in reports, appointments, and patient communications.

#### Acceptance Criteria

1. THE Platform SHALL provide a Clinic_Profile page editable by Staff with the appropriate permission, containing the following fields: Clinic Name, Website, Detailed Address, Email, Phone, Logo, Report_Header, Timezone, Working_Hours, Services Offered, and Terms & Conditions.
2. WHEN a Staff member saves the Clinic_Profile, THE Platform SHALL validate that Clinic Name, Address, and Timezone are present and return a validation error if any are missing.
3. THE Platform SHALL allow the Clinic Logo to be uploaded as an image file and SHALL display it in the Report_Header.
4. WHEN the Timezone is updated, THE Platform SHALL apply the new Timezone to all future appointment slot calculations for that Clinic.
5. THE Platform SHALL allow Working_Hours to be configured per day of the week, with start time and end time per day.
6. WHEN Working_Hours are updated, THE Platform SHALL apply the new schedule to all future appointment slot availability calculations.
7. THE Platform SHALL allow the Terms & Conditions text to be updated and SHALL include the current Terms & Conditions in generated Reports.

---

### Requirement STF-4: Staff Invitation and Onboarding

**User Story:** As a Clinic Admin, I want to invite new staff members via email so that they can securely set up their own accounts without me handling their credentials.

#### Acceptance Criteria

1. WHEN an Admin sends a staff invitation, THE Platform SHALL send an email to the invitee's address containing a unique, single-use registration link.
2. THE Invite link SHALL expire exactly 24 hours after it is issued.
3. WHEN an invitee follows a valid Invite link, THE Platform SHALL present a registration form allowing the invitee to set their own password and complete their Staff profile.
4. IF an invitee follows an expired Invite link, THEN THE Platform SHALL display an expiry message and SHALL NOT create a Staff account.
5. IF an invitee follows an already-used Invite link, THEN THE Platform SHALL display an already-used message and SHALL NOT create a second Staff account.
6. WHEN an invitee completes registration, THE Platform SHALL set the Staff member's Status to Active.
7. THE Platform SHALL allow an Admin to resend an Invite to an invitee whose Invite has expired.
8. WHEN an Invite is resent, THE Platform SHALL invalidate the previous Invite and issue a new one with a fresh 24-hour expiry.

#### Correctness Properties

- **Invite expiry**: For any Invite issued at time T, the Invite SHALL be valid for all instants in [T, T+24h) and invalid for all instants ≥ T+24h.
- **Single-use**: Using the same Invite link a second time SHALL NOT create a second Staff account and SHALL return an already-used error.
- **Resend invalidation**: After an Invite is resent, the previous Invite link SHALL be invalid regardless of whether it has expired.

---

### Requirement STF-5: Staff Profile Management

**User Story:** As a Clinic Admin, I want to view and edit staff profiles so that the clinic roster always reflects accurate information about each team member.

#### Acceptance Criteria

1. THE Platform SHALL store the following fields for each Staff member: First Name, Last Name, Email, Phone, Role(s), Specialization, Experience, and Status (Active or Inactive).
2. THE Platform SHALL allow a Staff member to be assigned multiple Roles simultaneously.
3. WHEN a Staff member's profile is updated, THE Platform SHALL record the change in the Audit_Log.
4. THE Platform SHALL allow an Admin to edit any Staff member's profile fields except Email (which is set at invite time and is immutable).
5. THE Platform SHALL display each Staff member's current Status (Active or Inactive) on the staff roster.

---

### Requirement STF-6: Staff Deactivation

**User Story:** As a Clinic Admin, I want to deactivate a staff member without losing their historical data so that I can remove their access while preserving clinical records.

#### Acceptance Criteria

1. WHEN an Admin deactivates a Staff member, THE Platform SHALL set that Staff member's Status to Inactive.
2. WHEN a Staff member is deactivated, THE Platform SHALL preserve all data associated with that Staff member unchanged.
3. WHEN a Staff member is deactivated, THE Platform SHALL revoke that Staff member's ability to authenticate.
4. THE Platform SHALL allow an Admin to reactivate a deactivated Staff member, restoring their authentication access.
5. WHEN a Staff member is deactivated or reactivated, THE Platform SHALL record the action in the Audit_Log.

#### Correctness Properties

- **Data preservation on deactivation**: For any Staff member S deactivated at time T, every record associated with S that existed before T SHALL remain unchanged after T.
- **Authentication revocation**: After deactivation, any authentication attempt by the deactivated Staff member SHALL fail.

---

### Requirement STF-7: Staff Deletion and Data Transfer

**User Story:** As a Clinic Admin, I want to delete a staff member only after transferring their data to another staff member so that no clinical records are lost when someone leaves.

#### Acceptance Criteria

1. WHEN an Admin initiates deletion of a Staff member, THE Platform SHALL require the Admin to select a recipient Staff member of equal or higher Role level to receive all data associated with the departing Staff member.
2. THE Platform SHALL NOT proceed with deletion until a valid recipient is selected and the data transfer is confirmed.
3. WHEN data transfer is confirmed, THE Platform SHALL transfer all associated records to the designated recipient and then permanently delete the Staff member record.
4. WHEN an Admin attempts to delete the last remaining Staff member with Admin-level access, THE Platform SHALL reject the deletion and return a descriptive error.
5. WHEN a Staff member is deleted, THE Platform SHALL preserve the original Staff member's name in all historical records and Audit_Log entries.
6. WHEN a Staff member is deleted, THE Platform SHALL record the deletion and data transfer in the Audit_Log, including the recipient's identity.

#### Correctness Properties

- **Data transfer completeness**: After Staff member S is deleted, every record previously owned by S SHALL be owned by the designated recipient R, and no record SHALL reference S as its current owner.
- **Name preservation**: After Staff member S is deleted, every historical record and Audit_Log entry referencing S SHALL display S's original name as it was at the time of the action.
- **Last-admin guard**: After any Staff deletion, the count of Staff members with Admin-level access in the Clinic SHALL remain ≥ 1.

---

### Requirement STF-8: Role Management

**User Story:** As a Clinic Admin, I want to create and manage roles with granular permissions so that I can precisely control what each staff member can do in the platform.

#### Acceptance Criteria

1. THE Platform SHALL provide the following default Roles: Admin, Doctor, Receptionist, Nurse, Sales, Marketing, and Frontdesk.
2. THE Platform SHALL allow an Admin to create custom Roles with a name and a set of Permissions.
3. THE Platform SHALL allow an Admin to edit any Role's name and Permissions.
4. THE Platform SHALL allow an Admin to delete any Role except the last remaining Admin Role.
5. WHEN an Admin attempts to delete the last remaining Admin Role, THE Platform SHALL reject the deletion and return a descriptive error.
6. THE Platform SHALL configure Permissions at the module level with the following actions: view, create, edit, and delete.
7. WHEN a Role's Permissions are updated, THE Platform SHALL immediately apply the updated Permissions to all Staff members currently holding that Role.
8. WHEN a Staff member holds multiple Roles, THE Platform SHALL apply the union of all Permissions granted by those Roles as the Staff member's effective permissions.
9. WHEN a Role is created, edited, or deleted, THE Platform SHALL record the change in the Audit_Log.

#### Correctness Properties

- **Permission union**: For any Staff member S holding roles R1 and R2, effective_permissions(S) = permissions(R1) ∪ permissions(R2).
- **Immediate propagation**: Within one request cycle after Role R is updated, every Staff member holding R SHALL have their effective permissions reflect the updated Role.
- **Last-admin role guard**: At all times, the count of Role records designated as Admin-level SHALL remain ≥ 1.
- **Denial completeness**: For every module M and action A, if no Role assigned to Staff member S grants (M, A), then every request by S for action A on module M SHALL be denied.

---

### Requirement STF-9: Audit Logging for Staff Actions

**User Story:** As an Organization_Admin, I want a complete audit trail of all staff-related actions so that I can investigate changes and demonstrate compliance.

#### Acceptance Criteria

1. THE Audit_Log SHALL record the following Staff-related actions: Staff invitation sent, Staff registration completed, Staff profile updated, Staff deactivated, Staff reactivated, Staff deleted, data transfer completed, Role created, Role updated, Role deleted, and Permission changed.
2. WHEN an action is recorded, THE Audit_Log SHALL capture: timestamp (UTC), actor identity (original Staff name), action type, affected resource identifier, and before/after values where applicable.
3. THE Audit_Log SHALL be immutable — no Staff member, including Organization_Admin, SHALL be able to edit or delete Audit_Log entries.
4. THE Platform SHALL allow authorized Staff to search and filter Audit_Log entries by date range, actor, and action type.
5. WHEN a Staff member is deleted, THE Audit_Log SHALL retain all entries attributed to that Staff member using the Staff member's original name.

#### Correctness Properties

- **Immutability**: For any Audit_Log entry E created at time T, the content of E SHALL be identical when read at any time T' > T.
- **Actor name preservation**: For any Audit_Log entry attributed to a deleted Staff member, the actor name field SHALL equal the Staff member's name at the time the action was performed.
- **Completeness**: For every action in the defined Staff significant-action set, an Audit_Log entry SHALL exist within one processing cycle of the action occurring.
