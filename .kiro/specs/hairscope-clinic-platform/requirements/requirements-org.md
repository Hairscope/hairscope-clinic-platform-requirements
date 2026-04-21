# Requirements Document — Organization Management

## Introduction

The Organization Management module governs the full lifecycle of organizations, clinics, and staff members within the Hairscope Clinic Platform. It covers the Organization → Clinics → Staff hierarchy, self-registration onboarding, staff invitation and profile management, role and permission management, clinic profile configuration, inter-clinic staff transfers, dashboards, and audit logging.

There are two distinct administrative scopes:
- **Organization_Admin**: Cross-clinic access for staff management, clinic details, and organization-wide dashboard only. Cannot access clinical modules (Patients, Appointments, Leads, Billing, Products) in any clinic.
- **Clinic_Admin**: Full administrative control within their assigned Clinic, including all modules and their clinic dashboard.

---

## Glossary

Refer to the master requirements glossary for platform-wide terms. Additional terms specific to this module:

- **Clinic_Profile**: The full configuration record for a Clinic, including contact details, branding, working hours, services, and terms.
- **Working_Hours**: The configured operating schedule for a Clinic, used to generate available appointment slots.
- **Report_Header**: Clinic branding information (logo, name, address) printed at the top of generated Reports.
- **Deactivation**: Setting a Staff member's status to Inactive while preserving all associated data and without revoking historical records.
- **Data_Transfer**: The process of reassigning all owned clinical and operational records from a departing Staff member to a designated recipient before deletion. Transferable records include: analysis sessions created by the staff member, patient records created by the staff member, assigned appointments, assigned leads, invoices created by the staff member, uploaded medical documents, and doctor's notes. Audit log entries are never transferred and always remain attributed to the original staff member.
- **Inter_Clinic_Transfer**: The reassignment of a Staff member from one Clinic to another Clinic within the same Organization.
- **Org_Scope**: The set of permissions available to an Organization_Admin, limited to: viewing all clinic profiles, viewing all staff rosters, managing staff across clinics, editing clinic details, and viewing the organization-wide dashboard. Org_Scope explicitly excludes access to Patients, Appointments, Leads, Billing, and Products modules.
- **Clinic_Scope**: The full set of permissions available to a Clinic_Admin within their assigned Clinic, including all modules.
- **Dashboard**: A role-specific landing page displaying business KPIs. Organization_Admins see aggregated and per-clinic KPIs across all clinics. Clinic_Admins and other staff see KPIs scoped to their own clinic only.

---

## Requirements

### Requirement ORG-1: Organization and Clinic Hierarchy

**User Story:** As an Organization_Admin, I want to manage multiple clinics and their staff from a single account so that I can oversee the entire organization without switching between separate accounts.

#### Acceptance Criteria

1. THE Platform SHALL support one or more Organization_Admins per Organization; there is no upper limit on the number of Organization_Admins.
2. THE Platform SHALL require at least one active Organization_Admin per Organization at all times.
3. EACH Organization_Admin SHALL be able to view all Clinics within the Organization, including their profiles and staff rosters.
4. EACH Organization_Admin SHALL be able to manage staff across all Clinics within the Organization (invite, edit, deactivate, delete, transfer).
5. EACH Organization_Admin SHALL be able to edit Clinic details (Clinic Name, Website, Address, Email, Phone, Logo, Report_Header, Timezone, Working_Hours, Services Offered, Terms & Conditions) for any Clinic within the Organization.
6. EACH Organization_Admin SHALL NOT have access to the following modules in any Clinic: Patients, Appointments, Leads, Billing, and Products.
7. WHILE a Staff member holds only Clinic-level roles, THE Platform SHALL prevent that Staff member from accessing data or settings belonging to other Clinics within the same Organization.
8. THE Platform SHALL allow Organization_Admins to create new Clinics within the Organization.
9. WHEN a new Clinic is created, THE Platform SHALL require at minimum a Clinic name and address.
10. THE Platform SHALL support one or more Clinic_Admins per Clinic; there is no upper limit on the number of Clinic_Admins.
11. THE Platform SHALL require at least one active Clinic_Admin per Clinic at all times.

#### Correctness Properties

- **Hierarchy isolation**: For any Staff member S with only Clinic-level roles assigned to Clinic C, every request by S targeting data in any other Clinic C' (C ≠ C') SHALL be denied.
- **Org admin read access**: For any Organization_Admin A and any Clinic C within A's Organization, A SHALL be able to read C's profile and staff roster.
- **Org admin clinical module denial**: For any Organization_Admin A, every request by A targeting Patients, Appointments, Leads, Billing, or Products data in any Clinic SHALL be denied.
- **Org admin clinic edit access**: For any Organization_Admin A and any Clinic C within A's Organization, A SHALL be able to edit C's clinic details fields.
- **Min org admin invariant**: At all times, the count of active Organization_Admins within any Organization SHALL be ≥ 1.
- **Min clinic admin invariant**: At all times, the count of active Clinic_Admins within any Clinic SHALL be ≥ 1.

---

### Requirement ORG-2: Self-Registration Onboarding

**User Story:** As a new clinic owner, I want to self-register my organization and clinic with minimal information so that I can start using the platform immediately without a lengthy setup process.

#### Acceptance Criteria

1. WHEN a new user submits the self-registration form, THE Platform SHALL create an Organization record, a Clinic record, and a Staff account using only the provided Organization name, Clinic name, and Clinic address.
2. THE Platform SHALL NOT require any additional information beyond Organization name, Clinic name, and Clinic address during self-registration.
3. WHEN self-registration is complete, THE Platform SHALL grant the registering user both Organization_Admin and Clinic_Admin roles for the newly created Organization and Clinic.
4. THE Platform SHALL allow the Admin to complete the full Clinic_Profile at any time after self-registration.
5. WHEN the self-registration form is submitted with any of the three required fields missing, THE Platform SHALL reject the submission and return a descriptive validation error identifying the missing field(s).

#### Correctness Properties

- **Minimalism**: A self-registration submission containing exactly Organization name, Clinic name, and Clinic address SHALL succeed and produce exactly one Organization, one Clinic, and one Staff record with both Organization_Admin and Clinic_Admin roles.
- **Rejection on missing fields**: A self-registration submission missing any of the three required fields SHALL fail and produce zero new records.

---

### Requirement ORG-3: Clinic Profile Management

**User Story:** As a Clinic_Admin or Organization_Admin, I want to configure a complete clinic profile so that all clinic details are accurately reflected in reports, appointments, and patient communications.

#### Acceptance Criteria

1. THE Platform SHALL provide a Clinic_Profile page containing the following fields: Clinic Name, Website, Detailed Address, Email, Phone, Logo, Report_Header, Timezone, Working_Hours, Services Offered, and Terms & Conditions.
2. BOTH Clinic_Admins (for their own Clinic) and Organization_Admins (for any Clinic in their Organization) SHALL be able to edit all Clinic_Profile fields.
3. WHEN a Staff member saves the Clinic_Profile, THE Platform SHALL validate that Clinic Name, Address, and Timezone are present and return a validation error if any are missing.
4. THE Platform SHALL allow the Clinic Logo to be uploaded as an image file and SHALL display it in the Report_Header.
5. WHEN the Timezone is updated, THE Platform SHALL apply the new Timezone to all future appointment slot calculations for that Clinic.
6. THE Platform SHALL allow Working_Hours to be configured per day of the week, with start time and end time per day.
7. WHEN Working_Hours are updated, THE Platform SHALL apply the new schedule to all future appointment slot availability calculations.
8. THE Platform SHALL allow the Terms & Conditions text to be updated and SHALL include the current Terms & Conditions in generated Reports.
9. WHEN a Clinic_Profile is updated, THE Platform SHALL record the change in the Audit_Log including the actor's identity and the before/after values of changed fields.

---

### Requirement ORG-4: Staff Invitation and Onboarding

**User Story:** As a Clinic_Admin or Organization_Admin, I want to invite new staff members via email so that they can securely set up their own accounts without me handling their credentials.

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

### Requirement ORG-5: Staff Profile Management

**User Story:** As a Clinic_Admin or Organization_Admin, I want to view and edit staff profiles so that the clinic roster always reflects accurate information about each team member.

#### Acceptance Criteria

1. THE Platform SHALL store the following fields for each Staff member: First Name, Last Name, Email, Phone, Role(s), Specialization, Experience, and Status (Active or Inactive).
2. THE Platform SHALL allow a Staff member to be assigned multiple Roles simultaneously.
3. WHEN a Staff member's profile is updated, THE Platform SHALL record the change in the Audit_Log.
4. THE Platform SHALL allow an Admin to edit any Staff member's profile fields except Email (which is set at invite time and is immutable).
5. THE Platform SHALL display each Staff member's current Status (Active or Inactive) on the staff roster.
6. Organization_Admins SHALL be able to view and edit Staff profiles across all Clinics within the Organization.

---

### Requirement ORG-6: Staff Deactivation

**User Story:** As a Clinic_Admin or Organization_Admin, I want to deactivate a staff member without losing their historical data so that I can remove their access while preserving clinical records.

#### Acceptance Criteria

1. WHEN an Admin deactivates a Staff member, THE Platform SHALL set that Staff member's Status to Inactive.
2. WHEN a Staff member is deactivated, THE Platform SHALL preserve all data associated with that Staff member unchanged.
3. WHEN a Staff member is deactivated, THE Platform SHALL revoke that Staff member's ability to authenticate.
4. THE Platform SHALL allow an Admin to reactivate a deactivated Staff member, restoring their authentication access.
5. WHEN a Staff member is deactivated or reactivated, THE Platform SHALL record the action in the Audit_Log.
6. THE Platform SHALL NOT allow deactivation of the last remaining active Clinic_Admin in a Clinic.
7. THE Platform SHALL NOT allow deactivation of the last remaining active Organization_Admin in an Organization.

#### Correctness Properties

- **Data preservation on deactivation**: For any Staff member S deactivated at time T, every record associated with S that existed before T SHALL remain unchanged after T.
- **Authentication revocation**: After deactivation, any authentication attempt by the deactivated Staff member SHALL fail.
- **Last-admin deactivation guard**: After any deactivation, the count of active Clinic_Admins in the Clinic SHALL remain ≥ 1, and the count of active Organization_Admins in the Organization SHALL remain ≥ 1.

---

### Requirement ORG-7: Staff Deletion and Data Transfer

**User Story:** As a Clinic_Admin or Organization_Admin, I want to delete a staff member only after transferring their owned records to another staff member so that no clinical data is lost when someone leaves.

#### Acceptance Criteria

1. WHEN an Admin initiates deletion of a Staff member, THE Platform SHALL display the full list of transferable records owned by that Staff member, including:
   - Analysis sessions created by the staff member
   - Patient records created by the staff member
   - Assigned appointments
   - Assigned leads
   - Invoices created by the staff member
   - Uploaded medical documents
   - Doctor's notes
2. THE Platform SHALL require the Admin to select a recipient Staff member of equal or higher Role level to receive all transferable records before deletion proceeds.
3. THE Platform SHALL NOT proceed with deletion until a valid recipient is selected and the data transfer is confirmed.
4. WHEN data transfer is confirmed, THE Platform SHALL transfer all transferable records to the designated recipient and then permanently delete the Staff member account.
5. THE Platform SHALL NOT transfer Audit_Log entries — all Audit_Log entries SHALL remain permanently attributed to the original Staff member's name.
6. WHEN an Admin attempts to delete the last remaining active Clinic_Admin in a Clinic, THE Platform SHALL reject the deletion and return a descriptive error.
7. WHEN an Admin attempts to delete the last remaining active Organization_Admin in an Organization, THE Platform SHALL reject the deletion and return a descriptive error.
8. WHEN a Staff member is deleted, THE Platform SHALL preserve the original Staff member's name in all historical records and Audit_Log entries.
9. WHEN a Staff member is deleted, THE Platform SHALL record the deletion and data transfer in the Audit_Log, including the recipient's identity and the list of transferred record types.

#### Correctness Properties

- **Data transfer completeness**: After Staff member S is deleted, every transferable record previously owned by S SHALL be owned by the designated recipient R.
- **Audit log immutability on deletion**: After Staff member S is deleted, every Audit_Log entry attributed to S SHALL remain in the Audit_Log with S's original name and SHALL NOT be reassigned to recipient R.
- **Name preservation**: After Staff member S is deleted, every historical record and Audit_Log entry referencing S SHALL display S's original name as it was at the time of the action.
- **Last-clinic-admin guard**: After any Staff deletion, the count of active Clinic_Admins in the Clinic SHALL remain ≥ 1.
- **Last-org-admin guard**: After any Staff deletion, the count of active Organization_Admins in the Organization SHALL remain ≥ 1.

---

### Requirement ORG-8: Inter-Clinic Staff Transfer

**User Story:** As an Organization_Admin, I want to transfer a staff member from one clinic to another within the same organization so that I can reallocate staff without deleting and re-inviting them.

#### Acceptance Criteria

1. THE Platform SHALL allow Organization_Admins to transfer a Staff member from one Clinic (source) to another Clinic (destination) within the same Organization.
2. WHEN a Staff member is transferred, THE Platform SHALL remove the Staff member's access to the source Clinic and grant access to the destination Clinic.
3. WHEN a Staff member is transferred, THE Platform SHALL allow the Organization_Admin to optionally reassign the Staff member's owned records in the source Clinic to another Staff member in that Clinic before the transfer completes.
4. IF the Staff member being transferred is the last remaining active Clinic_Admin in the source Clinic, THEN THE Platform SHALL block the transfer until another Clinic_Admin is designated for the source Clinic.
5. WHEN a Staff member is transferred, THE Platform SHALL record the transfer in the Audit_Log, including the source Clinic, destination Clinic, actor identity, and timestamp.
6. WHEN a Staff member is transferred, THE Platform SHALL send an email notification to the Staff member informing them of the transfer.
7. THE Platform SHALL NOT allow transfer of Staff members between different Organizations.

#### Correctness Properties

- **Access revocation on transfer**: After Staff member S is transferred from Clinic C1 to Clinic C2, every request by S targeting data in C1 SHALL be denied.
- **Access grant on transfer**: After Staff member S is transferred from Clinic C1 to Clinic C2, S SHALL have access to C2 data according to their assigned roles.
- **Cross-org transfer denial**: For any two Clinics C1 and C2 belonging to different Organizations, an attempt to transfer Staff member S from C1 to C2 SHALL fail.
- **Last-admin transfer guard**: After any inter-clinic transfer, the count of active Clinic_Admins in the source Clinic SHALL remain ≥ 1.

---

### Requirement ORG-9: Role Management

**User Story:** As a Clinic_Admin, I want to create and manage roles with granular permissions so that I can precisely control what each staff member can do in the platform.

#### Acceptance Criteria

1. THE Platform SHALL provide the following default Roles: Organization_Admin, Clinic_Admin, Doctor, Receptionist, Nurse, Sales, Marketing, and Frontdesk.
2. THE Platform SHALL allow a Clinic_Admin to create custom Roles with a name and a set of Permissions.
3. THE Platform SHALL allow a Clinic_Admin to edit any Role's name and Permissions.
4. THE Platform SHALL allow a Clinic_Admin to delete any Role except when doing so would leave the Clinic with no active Clinic_Admin.
5. WHEN a Clinic_Admin attempts to delete a Role that would leave the Clinic with no active Clinic_Admin, THE Platform SHALL reject the deletion and return a descriptive error.
6. THE Platform SHALL configure Permissions at the module level with the following actions: view, create, edit, and delete.
7. WHEN a Role's Permissions are updated, THE Platform SHALL immediately apply the updated Permissions to all Staff members currently holding that Role.
8. WHEN a Staff member holds multiple Roles, THE Platform SHALL apply the union of all Permissions granted by those Roles as the Staff member's effective permissions.
9. WHEN a Role is created, edited, or deleted, THE Platform SHALL record the change in the Audit_Log.
10. THE Organization_Admin role SHALL have a fixed, non-editable permission set scoped to Org_Scope only — staff management and clinic details across all clinics, plus the organization dashboard. It SHALL NOT grant access to Patients, Appointments, Leads, Billing, or Products in any Clinic.

#### Correctness Properties

- **Permission union**: For any Staff member S holding roles R1 and R2, effective_permissions(S) = permissions(R1) ∪ permissions(R2).
- **Immediate propagation**: Within one request cycle after Role R is updated, every Staff member holding R SHALL have their effective permissions reflect the updated Role.
- **Last-clinic-admin role guard**: At all times, the count of active Staff members with Clinic_Admin-level access in each Clinic SHALL remain ≥ 1.
- **Org admin scope enforcement**: For any Staff member S holding the Organization_Admin role, S SHALL NOT be granted permissions to Patients, Appointments, Leads, Billing, or Products modules via any role combination.
- **Denial completeness**: For every module M and action A, if no Role assigned to Staff member S grants (M, A), then every request by S for action A on module M SHALL be denied.

---

### Requirement ORG-10: Dashboard

**User Story:** As a user, I want a dashboard tailored to my role so that I can quickly see the business metrics most relevant to my responsibilities.

#### Acceptance Criteria

1. THE Platform SHALL provide a Dashboard as the default landing page for every authenticated Staff member.
2. WHEN an Organization_Admin views the Dashboard, THE Platform SHALL display aggregated business KPIs across all Clinics within the Organization.
3. WHEN an Organization_Admin views the Dashboard, THE Platform SHALL allow filtering by individual Clinic so that KPIs for a single Clinic can be viewed in isolation.
4. WHEN a Clinic_Admin or any other Clinic-level Staff member views the Dashboard, THE Platform SHALL display KPIs scoped to their own Clinic only.
5. THE Platform SHALL NOT display KPIs from other Clinics to Clinic-level Staff members.
6. THE specific KPI definitions and metrics displayed on the Dashboard SHALL be defined in a future iteration of this document.
7. WHEN a Staff member's role changes, THE Platform SHALL update the Dashboard scope on their next login to reflect the new role.

#### Correctness Properties

- **Org admin dashboard scope**: For any Organization_Admin A viewing the aggregated Dashboard, the displayed KPIs SHALL include data from every Clinic within A's Organization.
- **Clinic staff dashboard isolation**: For any Clinic-level Staff member S assigned to Clinic C, the Dashboard SHALL only display KPIs derived from data within Clinic C and SHALL NOT include data from any other Clinic.
- **Filter accuracy**: For any Organization_Admin A filtering the Dashboard to Clinic C, the displayed KPIs SHALL equal the KPIs that a Clinic_Admin of C would see on their Dashboard.

---

### Requirement ORG-11: Audit Logging for Organization Management Actions

**User Story:** As an Organization_Admin, I want a complete audit trail of all organization and staff-related actions so that I can investigate changes and demonstrate compliance.

#### Acceptance Criteria

1. THE Audit_Log SHALL record the following actions: Staff invitation sent, Staff registration completed, Staff profile updated, Staff deactivated, Staff reactivated, Staff deleted, data transfer completed, inter-clinic transfer completed, Role created, Role updated, Role deleted, Permission changed, and Clinic_Profile updated.
2. WHEN an action is recorded, THE Audit_Log SHALL capture: timestamp (UTC), actor identity (original Staff name at time of action), action type, affected resource identifier, and before/after values where applicable.
3. THE Audit_Log SHALL be immutable — no Staff member, including Organization_Admin, SHALL be able to edit or delete Audit_Log entries.
4. THE Platform SHALL allow authorized Staff to search and filter Audit_Log entries by date range, actor, and action type.
5. WHEN a Staff member is deleted, THE Audit_Log SHALL retain all entries attributed to that Staff member using the Staff member's original name and SHALL NOT reassign those entries to the data transfer recipient.

#### Correctness Properties

- **Immutability**: For any Audit_Log entry E created at time T, the content of E SHALL be identical when read at any time T' > T.
- **Actor name preservation**: For any Audit_Log entry attributed to a deleted Staff member, the actor name field SHALL equal the Staff member's name at the time the action was performed.
- **Completeness**: For every action in the defined significant-action set, an Audit_Log entry SHALL exist within one processing cycle of the action occurring.
- **No reassignment**: After Staff member S is deleted and records are transferred to recipient R, Audit_Log entries attributed to S SHALL continue to reference S's name, not R's name.
