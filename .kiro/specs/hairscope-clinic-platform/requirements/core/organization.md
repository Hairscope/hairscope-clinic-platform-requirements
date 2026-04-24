# Organization Management

> Covers: Organization/clinic hierarchy, self-registration, clinic profile management, inter-clinic staff transfers, and dashboards.

---

## Glossary

- **Organization**: The top-level tenant. Owns one or more Clinics.
- **Clinic**: A physical or logical treatment location within an Organization.
- **Clinic_Profile**: The full configuration record for a Clinic including branding, working hours, and contact details.
- **Organization_Admin**: Staff with `org`-scoped access. Can manage staff and clinic details across all clinics. Cannot access clinical modules (Patients, Appointments, Leads, Billing, Products).
- **Clinic_Admin**: Staff with full `clinic`-scoped access within their assigned Clinic, including all modules.
- **Inter_Clinic_Transfer**: Reassignment of a Staff member from one Clinic to another within the same Organization.
- **Clinic_Working_Hours**: Per-day operating schedule for a Clinic. Defines when the clinic is open. Used to derive patient-facing appointment slot availability.
- **Staff_Availability**: Per-day working schedule for an individual Staff member. Used internally by the smart scheduling engine to determine which qualified staff can be assigned to a given slot. Never exposed to patients.
- **Qualified_Staff**: Staff members who are configured as able to provide a specific Service.
- **Smart_Scheduling**: The internal engine that assigns the least busy qualified Staff member to a booked appointment, based on Staff_Availability and existing appointment load.
- **Report_Header**: Clinic branding (logo, name, address) printed at the top of generated Reports.
- **Dashboard**: Role-specific landing page showing business KPIs. Org-scoped for Organization_Admins; clinic-scoped for all other roles.

---

## Requirements

### ORG-1: Organization and Clinic Hierarchy

**User Story:** As an Organization_Admin, I want to manage multiple clinics and their staff from a single account so that I can oversee the entire organization without switching between separate accounts.

#### Acceptance Criteria

1. THE Platform SHALL support one or more Organization_Admins per Organization with no upper limit.
2. THE Platform SHALL require at least one active Organization_Admin per Organization at all times (GI-4).
3. THE Platform SHALL support one or more Clinic_Admins per Clinic with no upper limit.
4. THE Platform SHALL require at least one active Clinic_Admin per Clinic at all times (GI-5).
5. Organization_Admins SHALL be able to view all Clinics within their Organization including profiles and staff rosters.
6. Organization_Admins SHALL be able to manage staff across all Clinics (invite, edit, deactivate, delete, transfer).
7. Organization_Admins SHALL be able to edit all Clinic_Profile fields for any Clinic in their Organization.
8. Organization_Admins SHALL NOT have access to Patients, Appointments, Leads, Billing, or Products in any Clinic.
9. Clinic-level Staff SHALL NOT access data belonging to other Clinics within the same Organization.
10. THE Platform SHALL allow Organization_Admins to create new Clinics; minimum required fields are Clinic name and address.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Creating Clinic without name | `VALIDATION_ERROR` (field: `name`) |
| Creating Clinic without address | `VALIDATION_ERROR` (field: `address`) |
| Organization_Admin accessing clinical module | `FORBIDDEN` |
| Clinic Staff accessing another Clinic's data | `FORBIDDEN` |

#### Correctness Properties

- For any Staff member S with only clinic-level roles in Clinic C, every request targeting data in Clinic C' (C ≠ C') SHALL be denied.
- For any Organization_Admin A, every request targeting `patients`, `appointments`, `leads`, `billing`, or `products` data SHALL be denied.
- At all times, count of active Organization_Admins per Organization ≥ 1.
- At all times, count of active Clinic_Admins per Clinic ≥ 1.

---

### ORG-2: Self-Registration Onboarding

**User Story:** As a new clinic owner, I want to self-register with minimal information so that I can start using the platform immediately.

#### Acceptance Criteria

1. WHEN a new user submits the self-registration form with Organization name, Clinic name, and Clinic address, THE Platform SHALL create exactly one Organization record, one Clinic record, and one Staff account.
2. THE Platform SHALL grant the registering user both `Organization_Admin` and `Clinic_Admin` roles.
3. THE Platform SHALL NOT require any fields beyond Organization name, Clinic name, and Clinic address during self-registration.
4. THE Platform SHALL allow the Admin to complete the full Clinic_Profile at any time after registration.
5. IF any of the three required fields are missing, THE Platform SHALL return a `VALIDATION_ERROR` identifying the missing field(s) and create zero records.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing Organization name | `VALIDATION_ERROR` (field: `organizationName`) |
| Missing Clinic name | `VALIDATION_ERROR` (field: `clinicName`) |
| Missing Clinic address | `VALIDATION_ERROR` (field: `clinicAddress`) |
| Email already registered | `EMAIL_ALREADY_EXISTS` |

#### Correctness Properties

- A valid self-registration submission SHALL produce exactly one Organization, one Clinic, and one Staff record with both Organization_Admin and Clinic_Admin roles.
- A submission missing any required field SHALL produce zero new records.

---

### ORG-3: Clinic Profile Management

**User Story:** As a Clinic_Admin or Organization_Admin, I want to configure a complete clinic profile so that all clinic details are accurately reflected in reports, appointments, and patient communications.

#### Acceptance Criteria

1. THE Clinic_Profile contains the following fields: `name`, `website`, `address` (detailed), `email`, `phone`, `logo` (image upload), `reportHeader`, `timezone` (IANA), `workingHours` (per day), `servicesOffered`, `termsAndConditions`.
2. Both Clinic_Admins (own clinic) and Organization_Admins (any clinic in their org) SHALL be able to edit all Clinic_Profile fields.
3. `name`, `address`, and `timezone` are required; saving without them returns a `VALIDATION_ERROR`.
4. WHEN `timezone` is updated, THE Platform SHALL apply it to all future appointment slot calculations for that Clinic.
5. WHEN `workingHours` are updated, THE Platform SHALL apply the new schedule to all future slot availability calculations.
6. `termsAndConditions` text is included in all generated Reports for that Clinic.
7. WHEN Clinic_Profile is updated, THE Platform SHALL record the change in the Audit_Log with before/after values of changed fields.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` | `VALIDATION_ERROR` (field: `name`) |
| Missing `address` | `VALIDATION_ERROR` (field: `address`) |
| Missing `timezone` | `VALIDATION_ERROR` (field: `timezone`) |
| Invalid IANA timezone identifier | `INVALID_TIMEZONE` |
| Logo file exceeds 10MB | `FILE_TOO_LARGE` |
| Logo file is not an image | `INVALID_FILE_TYPE` |

---

### ORG-4: Inter-Clinic Staff Transfer

**User Story:** As an Organization_Admin, I want to transfer a staff member between clinics within my organization so that I can reallocate staff without deleting and re-inviting them.

#### Acceptance Criteria

1. THE Platform SHALL allow Organization_Admins to transfer a Staff member from a source Clinic to a destination Clinic within the same Organization.
2. WHEN transferred, THE Platform SHALL remove the Staff member's access to the source Clinic and grant access to the destination Clinic.
3. THE Platform SHALL allow the Organization_Admin to optionally reassign the Staff member's owned records in the source Clinic to another Staff member before the transfer completes.
4. IF the Staff member is the last active Clinic_Admin in the source Clinic, THE Platform SHALL block the transfer until another Clinic_Admin is designated for the source Clinic.
5. THE Platform SHALL NOT allow transfer between different Organizations.
6. WHEN transferred, THE Platform SHALL send an email notification to the Staff member.
7. WHEN transferred, THE Platform SHALL record the transfer in the Audit_Log including source Clinic, destination Clinic, actor, and timestamp.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Source and destination are in different Organizations | `CROSS_ORG_TRANSFER_DENIED` |
| Staff member is last active Clinic_Admin in source Clinic | `LAST_CLINIC_ADMIN` |
| Destination Clinic not found or not in same Organization | `FORBIDDEN` |
| Initiator is not an Organization_Admin | `FORBIDDEN` |

#### Correctness Properties

- After transfer from C1 to C2, every request by S targeting C1 data SHALL be denied.
- After transfer from C1 to C2, S SHALL have access to C2 data per their assigned roles.
- After any transfer, count of active Clinic_Admins in source Clinic SHALL remain ≥ 1.
- Transfer between different Organizations SHALL always fail regardless of actor.

---

### ORG-5: Dashboard

**User Story:** As a user, I want a role-appropriate dashboard so that I can see the business metrics relevant to my responsibilities.

#### Acceptance Criteria

1. THE Platform SHALL provide a Dashboard as the default landing page for every authenticated Staff member.
2. WHEN an Organization_Admin views the Dashboard, THE Platform SHALL display aggregated KPIs across all Clinics in the Organization.
3. WHEN an Organization_Admin views the Dashboard, THE Platform SHALL allow filtering by individual Clinic to view that Clinic's KPIs in isolation.
4. WHEN a Clinic-level Staff member views the Dashboard, THE Platform SHALL display KPIs scoped to their own Clinic only.
5. THE Platform SHALL NOT expose KPIs from other Clinics to Clinic-level Staff members.
6. Specific KPI definitions and metrics are deferred to a future iteration of this document.
7. WHEN a Staff member's role changes, the Dashboard scope SHALL reflect the new role on their next request.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Clinic-level Staff requesting another Clinic's KPIs | `FORBIDDEN` |

#### Correctness Properties

- For any Organization_Admin A, the aggregated Dashboard SHALL include data from every Clinic in A's Organization.
- For any Clinic-level Staff member S in Clinic C, the Dashboard SHALL only include data from Clinic C.
- For any Organization_Admin A filtering to Clinic C, the displayed KPIs SHALL equal what a Clinic_Admin of C would see.

---

### ORG-6: Clinic Deactivation

**User Story:** As an Organization_Admin, I want to deactivate a clinic so that I can suspend its operations without permanently deleting its data.

#### Acceptance Criteria

1. THE Platform SHALL allow an Organization_Admin to deactivate any Clinic within their Organization.
2. WHEN a Clinic is deactivated, THE Platform SHALL:
   - Revoke authentication for all Staff members assigned to that Clinic.
   - Prevent new appointments, sessions, leads, and invoices from being created for that Clinic.
   - Preserve all existing data for that Clinic unchanged.
3. WHEN a Clinic is deactivated, THE Platform SHALL NOT delete any data belonging to that Clinic.
4. THE Platform SHALL allow an Organization_Admin to reactivate a deactivated Clinic, restoring full access for its Staff members.
5. WHEN a Clinic is deactivated or reactivated, THE Platform SHALL record the action in the Audit_Log including the actor and timestamp.
6. THE Platform SHALL NOT allow deactivation of the last active Clinic in an Organization - an Organization must have at least one active Clinic at all times.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Deactivating the last active Clinic in an Organization | `LAST_ACTIVE_CLINIC` |
| Non-Organization_Admin attempting to deactivate a Clinic | `FORBIDDEN` |

#### Correctness Properties

- After Clinic C is deactivated, every authentication attempt by any Staff member assigned to C SHALL fail.
- After Clinic C is deactivated, all data belonging to C SHALL remain retrievable by the Organization_Admin.
- After Clinic C is reactivated, all Staff members assigned to C SHALL be able to authenticate (subject to their individual Active/Inactive status).
- At all times, the count of active Clinics within any Organization SHALL be ≥ 1.

---

### ORG-7: Staff Availability

**User Story:** As a Clinic_Admin, I want to configure each staff member's working schedule so that the smart scheduling engine can assign appointments only to staff who are available at that time.

#### Acceptance Criteria

1. THE Platform SHALL allow Clinic_Admins to configure a weekly availability schedule per Staff member, with `startTime`, `endTime`, and `available` (boolean) per day of the week.
2. Staff_Availability is independent of Clinic_Working_Hours - a staff member may be available on days the clinic is open, or unavailable on days the clinic is open.
3. THE Platform SHALL allow Staff_Availability to be updated at any time by a Clinic_Admin or by the Staff member themselves.
4. Staff_Availability SHALL NOT be exposed to patients or leads at any point - it is used exclusively by the Smart_Scheduling engine.
5. WHEN Staff_Availability is updated, THE Platform SHALL apply the new schedule to all future appointment assignments.
6. WHEN Staff_Availability is updated, THE Platform SHALL record the change in the Audit_Log.
7. THE Platform SHALL allow a Staff member to have no availability configured - in this case, they are excluded from Smart_Scheduling assignment.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| `startTime` ≥ `endTime` for a day | `VALIDATION_ERROR` |
| Staff member not found | `NOT_FOUND` |

#### Correctness Properties

- Staff_Availability is never returned in any patient-facing or web-component-facing GraphQL query.
- For any Staff member S with no availability configured, S SHALL NOT be assigned to any appointment by the Smart_Scheduling engine.
- Staff_Availability is scoped to the Clinic the Staff member is currently assigned to. After an inter-clinic transfer, the previous Clinic's availability configuration is no longer active.
