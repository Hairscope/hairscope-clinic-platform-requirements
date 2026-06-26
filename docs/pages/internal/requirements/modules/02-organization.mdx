# Organization Management

> Covers: Organization/clinic hierarchy, self-registration, clinic profile management, inter-clinic staff transfers, and dashboards.

---

## Glossary

- **Organization**: The top-level tenant. Owns one or more Clinics.
- **Clinic**: A physical or logical treatment location within an Organization.
- **ClinicProfile**: The full configuration record for a Clinic including branding, working hours, and contact details.
- **OrganizationAdmin**: Staff with `org`-scoped access. Can manage staff and clinic details across all clinics. Cannot access clinical modules (Patients, Appointments, Billing, Catalog). May access Leads for assignment purposes.
- **ClinicAdmin**: Staff with full `clinic`-scoped access within their assigned Clinic, including all modules.
- **InterClinicTransfer**: Reassignment of a Staff member from one Clinic to another within the same Organization.
- **ClinicWorkingHours**: Per-day operating schedule for a Clinic. Defines when the clinic is open. Used to derive patient-facing appointment slot availability.
- **StaffAvailability**: Per-day working schedule for an individual Staff member. Used internally by the smart scheduling engine to determine which qualified staff can be assigned to a given slot. Never exposed to patients.
- **QualifiedStaff**: Staff members who are configured as able to provide a specific Service.
- **SmartScheduling**: The internal engine that assigns the least busy qualified Staff member to a booked appointment, based on StaffAvailability and existing appointment load.
- **ReportHeader**: Clinic branding (logo, name, address) printed at the top of generated Reports. Customizable per Clinic.
- **ReportTemplate**: The layout and structure of a generated report (Selfie Analysis Report or Trichoscopy/Hair Analysis Report). Set at Organization level and applies to all Clinics within the Organization.
- **Dashboard**: Role-specific landing page showing business KPIs. Org-scoped for OrganizationAdmins; clinic-scoped for all other roles.

---

## Requirements

### ORG-1: Organization and Clinic Hierarchy

**User Story:** As an OrganizationAdmin, I want to manage multiple clinics and their staff from a single account so that I can oversee the entire organization without switching between separate accounts.

#### Acceptance Criteria

1. THE Platform SHALL support one or more OrganizationAdmins per Organization with no upper limit.
2. THE Platform SHALL require at least one active OrganizationAdmin per Organization at all times (GI-4).
3. THE Platform SHALL support one or more ClinicAdmins per Clinic with no upper limit.
4. THE Platform SHALL require at least one active ClinicAdmin per Clinic at all times (GI-5).
5. OrganizationAdmins SHALL be able to view all Clinics within their Organization including profiles and staff rosters.
6. OrganizationAdmins SHALL be able to manage staff across all Clinics (invite, edit, deactivate, delete, transfer).
7. OrganizationAdmins SHALL be able to edit all ClinicProfile fields for any Clinic in their Organization.
8. OrganizationAdmins SHALL NOT have access to Patients, Appointments, Billing, or Catalog in any Clinic. OrganizationAdmins MAY access Leads for assignment and unassigned lead management.
9. Clinic-level Staff SHALL NOT access data belonging to other Clinics within the same Organization.
10. THE Platform SHALL allow OrganizationAdmins to create new Clinics; minimum required fields are Clinic name and address.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Creating Clinic without name | `VALIDATION_ERROR` (field: `name`) |
| Creating Clinic without address | `VALIDATION_ERROR` (field: `address`) |
| OrganizationAdmin accessing clinical module | `FORBIDDEN` |
| Clinic Staff accessing another Clinic's data | `FORBIDDEN` |

#### Correctness Properties

- For any Staff member S with only clinic-level roles in Clinic C, every request targeting data in Clinic C' (C ≠ C') SHALL be denied.
- For any OrganizationAdmin A, every request targeting `patients`, `appointments`, `billing`, or `catalog` data SHALL be denied. Requests targeting `leads` for assignment purposes SHALL be allowed.
- At all times, count of active OrganizationAdmins per Organization ≥ 1.
- At all times, count of active ClinicAdmins per Clinic ≥ 1.

---

### ORG-2: Self-Registration Onboarding

**User Story:** As a new clinic owner, I want to self-register with my details and organization information so that I can start using the platform immediately on a trial.

#### Registration Flow

1. User visits the registration page.
2. User provides: `firstName`, `lastName`, `email`, `phone`, organization name, first clinic name, and first clinic address.
3. THE Platform creates: one Organization, one Clinic, one Staff record with both `OrganizationAdmin` and `ClinicAdmin` roles.
4. THE Platform sends an invitation email to the user's email address (same invite flow as all other staff — the user is effectively inviting themselves).
5. User follows the invite link, sets a password, and is logged in.
6. THE Platform starts a trial period for the Organization. Full platform access is available during the trial.
7. Plan selection and payment happen on an external billing system. The external system updates the Organization's subscription plan via a secure webhook to the platform.

#### Acceptance Criteria

1. WHEN a new user submits the self-registration form, THE Platform SHALL create exactly one Organization record, one Clinic record, and one Staff account with both `OrganizationAdmin` and `ClinicAdmin` roles.
2. THE Platform SHALL send an invitation email to the registering user following the standard invite flow (IAM-1). The user sets their password via the invite link.
3. THE Platform SHALL start a trial period for the Organization immediately upon registration. The trial duration is configured by the platform operator.
4. THE Platform SHALL NOT require plan selection or payment during registration. Plan activation is handled by the external billing system via webhook.
5. THE Platform SHALL require the following fields at registration: `firstName`, `lastName`, `email`, `phone`, `organizationName`, `clinicName`, `clinicAddress`.
6. IF any required field is missing, THE Platform SHALL return a `VALIDATION_ERROR` identifying the missing field(s) and create zero records.
7. THE Platform SHALL allow the Admin to complete the full ClinicProfile and Organization details at any time after registration.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `firstName` | `VALIDATION_ERROR` (field: `firstName`) |
| Missing `lastName` | `VALIDATION_ERROR` (field: `lastName`) |
| Missing `email` | `VALIDATION_ERROR` (field: `email`) |
| Missing `phone` | `VALIDATION_ERROR` (field: `phone`) |
| Missing Organization name | `VALIDATION_ERROR` (field: `organizationName`) |
| Missing Clinic name | `VALIDATION_ERROR` (field: `clinicName`) |
| Missing Clinic address | `VALIDATION_ERROR` (field: `clinicAddress`) |
| Email already registered | `EMAIL_ALREADY_EXISTS` |

#### Correctness Properties

- A valid self-registration submission SHALL produce exactly one Organization, one Clinic, and one Staff record with both OrganizationAdmin and ClinicAdmin roles.
- A submission missing any required field SHALL produce zero new records.
- The registering user SHALL receive an invite email and follow the standard invite acceptance flow (IAM-1).
- The Organization SHALL be in trial status immediately after registration until the external billing system activates a paid plan.

---

### ORG-3: Clinic Profile Management

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to configure a complete clinic profile so that all clinic details are accurately reflected in reports, appointments, and patient communications.

#### Acceptance Criteria

1. THE ClinicProfile contains the following fields: `name`, `website`, `address` (detailed), `email`, `phone`, `logo` (image upload), `reportHeader`, `timezone` (IANA), `language` (locale code from supported locales), `currency` (ISO 4217 code), `workingHours` (per day), `servicesOffered`, `termsAndConditions`.
2. Both ClinicAdmins (own clinic) and OrganizationAdmins (any clinic in their org) SHALL be able to edit all ClinicProfile fields.
3. `name`, `address`, and `timezone` are required; saving without them returns a `VALIDATION_ERROR`.
4. WHEN `timezone` is updated, THE Platform SHALL apply it to all future appointment slot calculations for that Clinic.
5. WHEN `workingHours` are updated, THE Platform SHALL apply the new schedule to all future slot availability calculations.
6. `termsAndConditions` text is included in all generated Reports for that Clinic.
7. WHEN ClinicProfile is updated, THE Platform SHALL record the change in the AuditLog with before/after values of changed fields.
8. THE Platform SHALL support an Organization-level currency enforcement policy: `ENFORCE_SINGLE_CURRENCY` or `ALLOW_CLINIC_CURRENCY`. When `ENFORCE_SINGLE_CURRENCY` is set, all Clinics in the Organization MUST use the Organization's configured currency. When `ALLOW_CLINIC_CURRENCY` is set, each Clinic may select its own currency.
9. IF the Organization enforces a single currency, THE Platform SHALL reject any attempt by a ClinicAdmin to change the Clinic's currency to a different value.
10. THE `language` field determines the locale used for all generated documents (Clinical Trichoscopy Report, Treatment Plan, Prescription, Invoice) for that Clinic. Documents are generated in the Clinic's configured language and remain in that language permanently.
11. THE Platform SHALL support the following locales: `EN`, `ES`, `IT`, `NL`, `FR`, `RU`, `AR`, `DE` (extensible via translation files).
12. THE Platform SHALL require `currency` to be configured before the Catalog module can be used. Attempting to create catalog items without a configured currency SHALL return a `CLINIC_CURRENCY_NOT_SET` error.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` | `VALIDATION_ERROR` (field: `name`) |
| Missing `address` | `VALIDATION_ERROR` (field: `address`) |
| Missing `timezone` | `VALIDATION_ERROR` (field: `timezone`) |
| Invalid IANA timezone identifier | `INVALID_TIMEZONE` |
| Logo file exceeds 10MB | `FILE_TOO_LARGE` |
| Logo file is not an image | `INVALID_FILE_TYPE` |
| Clinic currency change rejected (org enforces single currency) | `CURRENCY_ENFORCEMENT_VIOLATION` |
| Invalid ISO 4217 currency code | `VALIDATION_ERROR` (field: `currency`) |
| Invalid locale code | `VALIDATION_ERROR` (field: `language`) |

---

### ORG-4: Inter-Clinic Staff Transfer

**User Story:** As an OrganizationAdmin, I want to transfer a staff member between clinics within my organization so that I can reallocate staff without deleting and re-inviting them.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to transfer a Staff member from a source Clinic to a destination Clinic within the same Organization.
2. THE Platform SHALL require the OrgAdmin to reassign all `assignedTo` records (sessions, leads, appointments) in the source Clinic to other active Staff members before the transfer can proceed. Transfer is blocked until reassignment is complete (same pattern as staff deletion).
3. WHEN transferred, THE Platform SHALL remove the Staff member's access to the source Clinic and grant access to the destination Clinic.
4. THE Platform SHALL allow the OrgAdmin to assign roles from the destination Clinic's existing role list during the transfer. The OrgAdmin can only assign roles that already exist in the destination Clinic — they cannot create new roles.
5. IF the OrgAdmin does not assign roles during transfer, THE Platform SHALL reset the Staff member to no roles in the destination Clinic. The destination ClinicAdmin must then assign appropriate roles before the Staff member can perform any actions.
6. WHEN transferred, THE Platform SHALL reset the Staff member's StaffAvailability to empty (no availability configured). The Staff member is excluded from SmartScheduling until availability is configured in the destination Clinic.
7. IF the Staff member is the last active ClinicAdmin in the source Clinic, THE Platform SHALL block the transfer until another ClinicAdmin is designated for the source Clinic.
8. THE Platform SHALL NOT allow transfer between different Organizations.
9. WHEN transferred, THE Platform SHALL send an email notification to the Staff member.
10. WHEN transferred, THE Platform SHALL record the transfer in the AuditLog including source Clinic, destination Clinic, reassignment details, role assignments, actor, and timestamp.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Source and destination are in different Organizations | `CROSS_ORG_TRANSFER_DENIED` |
| Staff member is last active ClinicAdmin in source Clinic | `LAST_CLINIC_ADMIN` |
| Destination Clinic not found or not in same Organization | `FORBIDDEN` |
| Initiator is not an OrganizationAdmin | `FORBIDDEN` |
| Unresolved `assignedTo` records in source Clinic | `TRANSFER_RECORDS_UNRESOLVED` |

#### Correctness Properties

- After transfer from C1 to C2, every request by S targeting C1 data SHALL be denied.
- After transfer from C1 to C2, S SHALL have access to C2 data per their assigned roles (if any).
- After transfer, all `assignedTo` records previously owned by S in the source Clinic SHALL reference a different active Staff member.
- After transfer, S's StaffAvailability in the source Clinic is no longer active. Availability in the destination Clinic is empty until configured.
- After any transfer, count of active ClinicAdmins in source Clinic SHALL remain ≥ 1.
- Transfer between different Organizations SHALL always fail regardless of actor.

---

### ORG-5: Dashboard

**User Story:** As a user, I want a role-appropriate dashboard so that I can see the business metrics relevant to my responsibilities.

#### Acceptance Criteria

1. THE Platform SHALL provide a Dashboard as the default landing page for every authenticated Staff member.
2. WHEN an OrganizationAdmin views the Dashboard, THE Platform SHALL display aggregated KPIs across all Clinics in the Organization.
3. WHEN an OrganizationAdmin views the Dashboard, THE Platform SHALL allow filtering by individual Clinic to view that Clinic's KPIs in isolation.
4. WHEN a Clinic-level Staff member views the Dashboard, THE Platform SHALL display KPIs scoped to their own Clinic only.
5. THE Platform SHALL NOT expose KPIs from other Clinics to Clinic-level Staff members.
6. Specific KPI definitions and metrics are deferred to a future iteration of this document.
7. WHEN a Staff member's role changes, the Dashboard scope SHALL reflect the new role on their next request.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Clinic-level Staff requesting another Clinic's KPIs | `FORBIDDEN` |

#### Correctness Properties

- For any OrganizationAdmin A, the aggregated Dashboard SHALL include data from every Clinic in A's Organization.
- For any Clinic-level Staff member S in Clinic C, the Dashboard SHALL only include data from Clinic C.
- For any OrganizationAdmin A filtering to Clinic C, the displayed KPIs SHALL equal what a ClinicAdmin of C would see.

---

### ORG-6: Clinic Deactivation

**User Story:** As an OrganizationAdmin, I want to deactivate a clinic so that I can suspend its operations without permanently deleting its data.

#### Acceptance Criteria

1. THE Platform SHALL allow an OrganizationAdmin to deactivate any Clinic within their Organization.
2. WHEN a Clinic is deactivated, THE Platform SHALL:
   - Revoke authentication for all Staff members assigned to that Clinic.
   - Prevent new appointments, sessions, leads, and invoices from being created for that Clinic.
   - Preserve all existing data for that Clinic unchanged.
3. WHEN a Clinic is deactivated, THE Platform SHALL NOT delete any data belonging to that Clinic.
4. THE Platform SHALL allow an OrganizationAdmin to reactivate a deactivated Clinic, restoring full access for its Staff members.
5. WHEN a Clinic is deactivated or reactivated, THE Platform SHALL record the action in the AuditLog including the actor and timestamp.
6. THE Platform SHALL NOT allow deactivation of the last active Clinic in an Organization - an Organization must have at least one active Clinic at all times.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Deactivating the last active Clinic in an Organization | `LAST_ACTIVE_CLINIC` |
| Non-OrganizationAdmin attempting to deactivate a Clinic | `FORBIDDEN` |

#### Correctness Properties

- After Clinic C is deactivated, every authentication attempt by any Staff member assigned to C SHALL fail.
- After Clinic C is deactivated, all data belonging to C SHALL remain retrievable by the OrganizationAdmin.
- After Clinic C is reactivated, all Staff members assigned to C SHALL be able to authenticate (subject to their individual Active/Inactive status).
- At all times, the count of active Clinics within any Organization SHALL be ≥ 1.

---

### ORG-7: Staff Availability

**User Story:** As a ClinicAdmin, I want to configure each staff member's working schedule so that the smart scheduling engine can assign appointments only to staff who are available at that time.

#### Acceptance Criteria

1. THE Platform SHALL allow ClinicAdmins to configure a weekly availability schedule per Staff member, with `startTime`, `endTime`, and `available` (boolean) per day of the week.
2. StaffAvailability is independent of ClinicWorkingHours - a staff member may be available on days the clinic is open, or unavailable on days the clinic is open.
3. THE Platform SHALL allow StaffAvailability to be updated at any time by a ClinicAdmin or by the Staff member themselves.
4. StaffAvailability SHALL NOT be exposed to patients or leads at any point - it is used exclusively by the SmartScheduling engine.
5. WHEN StaffAvailability is updated, THE Platform SHALL apply the new schedule to all future appointment assignments.
6. WHEN StaffAvailability is updated, THE Platform SHALL record the change in the AuditLog.
7. THE Platform SHALL allow a Staff member to have no availability configured - in this case, they are excluded from SmartScheduling assignment.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| `startTime` ≥ `endTime` for a day | `VALIDATION_ERROR` |
| Staff member not found | `NOT_FOUND` |

#### Correctness Properties

- StaffAvailability is never returned in any patient-facing or web-component-facing GraphQL query.
- For any Staff member S with no availability configured, S SHALL NOT be assigned to any appointment by the SmartScheduling engine.
- StaffAvailability is scoped to the Clinic the Staff member is currently assigned to. After an inter-clinic transfer, the previous Clinic's availability configuration is no longer active.

---

### ORG-8: Report Template Management

**User Story:** As an OrganizationAdmin, I want to configure the report templates for my organization so that all clinics generate reports with a consistent structure and branding.

#### Report Template Types

| Template | Used For | Configurable By |
|----------|----------|----------------|
| `SELFIE_ANALYSIS_REPORT` | Reports generated from the Selfie Analysis web component | OrganizationAdmin |
| `HAIR_ANALYSIS_REPORT` | Reports generated from completed Hair Analysis sessions (trichoscopy) | OrganizationAdmin |

#### Acceptance Criteria

1. THE Platform SHALL maintain one active ReportTemplate per template type per Organization.
2. THE Platform SHALL allow OrganizationAdmins to configure the ReportTemplate for each template type, including: layout, sections to include/exclude, section order, and branding elements.
3. THE configured ReportTemplate SHALL apply to all Clinics within the Organization. Individual Clinics cannot override the template structure.
4. EACH Clinic SHALL be able to customize the `ReportHeader` (logo, clinic name, address, contact details) within the template — this is the only clinic-level customization allowed.
5. WHEN a ReportTemplate is updated, THE Platform SHALL apply the new template to all future report generations. Existing generated reports are not affected.
6. THE Platform SHALL provide a default ReportTemplate for each type that is used until the OrganizationAdmin configures a custom one.
7. WHEN a ReportTemplate is updated, THE Platform SHALL record the change in the AuditLog including the actor and before/after configuration.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Clinic-level Staff attempting to modify ReportTemplate | `FORBIDDEN` |
| Invalid template configuration | `VALIDATION_ERROR` |

#### Correctness Properties

- For any two Clinics C1 and C2 within the same Organization, reports generated at the same time SHALL use the same ReportTemplate structure.
- The ReportHeader (clinic branding) within the template SHALL reflect each Clinic's own configured header, not a shared one.
- After a ReportTemplate update, all reports generated after the update SHALL use the new template. Reports generated before the update SHALL retain their original structure.

---

### ORG-9: Record Visibility Mode (HIPAA Compliance)

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to restrict record visibility so that staff only see records assigned to them, ensuring HIPAA minimum-necessary compliance.

> **Scope of this requirement:** ORG-9 governs *per-staff, assignment-based* visibility **within a single clinic** via the clinic-level `recordVisibilityMode` = `OPEN` / `RESTRICTED`. Organization-wide *cross-clinic* visibility is a separate axis (org-level `recordVisibilityMode` = `CLINIC_ONLY` / `ORGANIZATION_WIDE`) defined in ORG-11.

#### Visibility Modes

| Mode | Behaviour |
|------|-----------|
| `OPEN` (default) | All staff with module permission can see all records in their Clinic |
| `RESTRICTED` | Staff can only see records assigned to them. ClinicAdmins always see all records in their Clinic regardless of assignment. |

#### Acceptance Criteria

1. THE Platform SHALL support a `recordVisibilityMode` setting at both Organization level and Clinic level, with values `OPEN` or `RESTRICTED`.
2. THE default mode SHALL be `OPEN`.
3. Organization-level setting takes priority: IF the Organization sets `RESTRICTED`, all Clinics in that Organization SHALL operate in restricted mode regardless of their individual setting.
4. IF the Organization sets `OPEN` (or leaves it unset), each Clinic MAY independently choose `OPEN` or `RESTRICTED`.
5. WHEN `RESTRICTED` mode is active for a Clinic:
   - Staff with `patients.view` permission SHALL only see Patients assigned to them (via `assignedTo` on sessions, or direct patient assignment).
   - Staff with `leads.view` permission SHALL only see Leads assigned to them.
   - Staff with `appointments.view` permission SHALL only see Appointments assigned to them.
   - ClinicAdmins SHALL always see ALL records in their Clinic regardless of assignment.
6. WHEN `OPEN` mode is active, all staff with the relevant module permission SHALL see all records in their Clinic (current behaviour).
7. THE Platform SHALL allow ClinicAdmins and OrganizationAdmins to change the visibility mode at any time. Changes take effect on the next request.
8. WHEN the visibility mode is changed, THE Platform SHALL record the change in the AuditLog.
9. Catalog items and Treatment Kits are NOT affected by visibility mode — they are always visible to all staff with `catalog.view` permission (shared clinic resources).
10. Billing/Invoices follow the visibility of their linked Session — if a staff member can see the session, they can see its invoice.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| ClinicAdmin attempting to set `OPEN` when Organization enforces `RESTRICTED` | `VISIBILITY_MODE_ENFORCEMENT_VIOLATION` |

#### Correctness Properties

- In `RESTRICTED` mode: for any Staff member S (non-admin) in Clinic C, queries SHALL only return records where `assignedTo = S.id`.
- In `RESTRICTED` mode: for any ClinicAdmin A in Clinic C, queries SHALL return ALL records in C regardless of assignment.
- Organization-level `RESTRICTED` SHALL override any Clinic-level `OPEN` setting.
- Changing visibility mode SHALL NOT modify any record assignments — it only changes query filtering.

---

### ORG-10: Individual Record Reassignment

**User Story:** As a ClinicAdmin, I want to reassign individual patients, leads, or appointments from one staff member to another so that I can balance workload or handle staff changes without bulk operations.

#### Acceptance Criteria

1. THE Platform SHALL allow ClinicAdmins and OrganizationAdmins to reassign individual records (one at a time) from one active Staff member to another within the same Clinic.
2. Reassignable record types: Patients (session `assignedTo`), Leads (`assignedTo`), Appointments (`assignedTo`).
3. THE Platform SHALL validate that the recipient Staff member is active and belongs to the same Clinic.
4. WHEN a record is reassigned, THE Platform SHALL update the `assignedTo` field to the new Staff member.
5. WHEN a record is reassigned, THE Platform SHALL record the change in the AuditLog including: previous assignee, new assignee, record type, record ID, actor, and timestamp.
6. ClinicAdmins and OrganizationAdmins SHALL have reassignment permission by default. Other staff MAY be granted reassignment permission via their role configuration.
7. Reassignment SHALL NOT modify attribution fields (`createdBy`, `authoredBy`) — only the `assignedTo` responsibility field changes.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Recipient is inactive | `RECIPIENT_INACTIVE` |
| Recipient belongs to a different Clinic | `FORBIDDEN` |
| Non-admin attempting reassignment without permission | `FORBIDDEN` |
| Record not found | `NOT_FOUND` |

#### Correctness Properties

- After reassignment of record R from Staff A to Staff B: `R.assignedTo = B.id`.
- Attribution fields on R SHALL remain unchanged after reassignment.
- In `RESTRICTED` visibility mode: after reassignment from A to B, A SHALL no longer see R and B SHALL now see R.

---

### ORG-11: Cross-Clinic Visibility (Organization-Wide Access)

**User Story:** As a multi-clinic operator, I want certain staff to view details of all clinics in the organization (without exposing patient clinical data) so that organization-level oversight is possible while clinical records stay clinic-isolated.

> **Two distinct visibility axes.** This requirement (organization-wide cross-clinic access) is separate from ORG-9 (per-staff, assignment-based visibility *within* a single clinic). ORG-9 uses clinic-level `recordVisibilityMode` = `OPEN` / `RESTRICTED`. ORG-11 uses the **organization-level** `recordVisibilityMode` = `CLINIC_ONLY` / `ORGANIZATION_WIDE`.

#### Acceptance Criteria

1. THE Platform SHALL support an Organization-level `recordVisibilityMode` setting with values `CLINIC_ONLY` (default) and `ORGANIZATION_WIDE`.
2. Cross-clinic access SHALL be **permission-driven, not role-driven**. A role is only a combination of permissions; the ability to view other clinics' details is granted by an organization-wide access permission and the org's `ORGANIZATION_WIDE` setting — it is NOT hardcoded to the `OrganizationAdmin` role. Any role that is granted this permission confers the access.
3. WHEN the organization is `ORGANIZATION_WIDE`, a staff member holding the organization-wide access permission SHALL be able to view the details of all Clinics in the organization (profiles, working hours, staff rosters, catalog, leads-for-assignment, dashboards).
4. Cross-clinic access SHALL NEVER expose patient clinical data — Patient records and their Sessions (images, AI analysis, annotations, reports), medical documents, and invoices remain isolated to the owning Clinic regardless of `ORGANIZATION_WIDE`. This preserves GI-8 (no clinical-module access for organization-scoped oversight).
5. WHEN the organization is `CLINIC_ONLY`, staff SHALL only view details of the Clinic(s) they belong to, even if granted the organization-wide access permission.
6. WHEN the setting is changed, THE Platform SHALL apply it on the next request and record the change in the AuditLog.

#### Correctness Properties

- For any staff member S with the organization-wide access permission in an `ORGANIZATION_WIDE` organization: S SHALL be able to read non-clinical details of every Clinic in the organization.
- For any staff member (regardless of permission): no cross-clinic query SHALL return Patient records, Sessions, medical documents, or invoices belonging to a Clinic the staff member does not belong to.
- Cross-clinic visibility SHALL be determined by the effective permission set + org setting, never by the name of a role.
