# Requirements Document — Hairscope Clinic Platform (Master)

## Introduction

Hairscope Clinic Platform is an enterprise SaaS patient management platform for hair treatment clinics worldwide. It supports both single clinics and multi-clinic chains through an **Organization → Clinics → Staff** hierarchy. The platform is fully GDPR and HIPAA compliant and restricts feature access by subscription plan. There is no Hairscope super-admin; the Organization owner holds the highest access level within their tenant.

The platform comprises six functional modules:

1. **Patients Management** — patient profiles, analysis sessions, AI-powered trichoscopy, and report generation
2. **Organization Management** — organization/clinic hierarchy, staff lifecycle, roles, permissions, dashboards, and audit logging
3. **Leads Management CRM** — lead capture, nurturing, and conversion to patients
4. **Appointments** — scheduling, calendar, and service configuration
5. **Products** — product catalog for session recommendations
6. **Billing** — invoice generation per completed session

Detailed requirements for each module are maintained in separate files within this directory. This master document covers cross-cutting concerns that apply to all modules.

---

## Glossary

- **Organization**: The top-level tenant entity representing a clinic business or chain. Owns one or more Clinics.
- **Clinic**: A physical or logical treatment location belonging to an Organization.
- **Organization_Admin**: A Staff member with organization-level administrative privileges spanning all Clinics within the Organization. Scoped to staff management, clinic details, and the organization dashboard only — cannot access Patients, Appointments, Leads, Billing, or Products in any Clinic. Multiple Organization_Admins are allowed; at least one must exist at all times.
- **Clinic_Admin**: A Staff member with full administrative privileges scoped to a single Clinic, including all modules. Multiple Clinic_Admins are allowed per Clinic; at least one must exist at all times.
- **Doctor**: A Staff member with clinical privileges (can perform analyses and generate reports).
- **Receptionist**: A Staff member with front-desk privileges (can manage appointments and leads).
- **Staff**: Any authenticated user belonging to a Clinic (includes all roles).
- **Patient**: A person who has received or is receiving treatment at a Clinic.
- **Lead**: A prospective patient captured via manual entry, webhook, or the Selfie Analysis web component.
- **Session**: An analysis session for a Patient, containing images, questionnaire answers, AI analysis, and a generated report.
- **Trichoscopy_Image**: A high-magnification scalp image captured with a trichoscope device, used for hair count, density, and thickness analysis.
- **Global_Image**: A standard hair photograph taken from a predefined position (Frontal, Crown, Occipital, Left, Right).
- **AI_Analysis**: The asynchronous machine-learning analysis of Session images producing hair loss stage (Global) and hair count/density/thickness (Trichoscopy).
- **Report**: A server-generated PDF summarising a completed Session, including patient details, images, AI analysis, questionnaire results, doctor notes, and product recommendations.
- **Role**: A named set of permissions assignable to one or more Staff members.
- **Permission**: A granular action right (view, create, edit, delete) scoped to a specific module.
- **Invite**: A time-limited email link sent to a prospective Staff member to complete registration.
- **Data_Transfer**: The process of reassigning all owned clinical and operational records from a departing Staff member to a designated recipient before deletion. Transferable records include: analysis sessions, patient records created by the staff member, assigned appointments, assigned leads, invoices created by the staff member, uploaded medical documents, and doctor's notes. Audit log entries are never transferred.
- **Audit_Log**: An immutable, timestamped record of significant platform actions including the original actor name.
- **Plan**: A subscription tier that controls which modules and features are accessible to an Organization.
- **Web_Component**: An embeddable Stencil widget (Selfie Analysis or Appointment Booking) hosted on a clinic website.
- **Service**: A treatment offering configured per Clinic with name, description, price, currency, and duration.
- **Product**: A cosmetic or medical item listed in the clinic catalog for recommendation within a Session Report.
- **Invoice**: A PDF billing document auto-generated per completed Session.
- **Prescription**: A formal medication order included in the Report when medical Products are recommended.
- **Stress_O_Meter**: A calculated stress score derived from the stress questionnaire, displayed visually in the Session.
- **Root_Cause**: An automatically determined hair-loss cause derived from questionnaire answers via a defined formula.
- **Follicle**: A hair follicle unit marked on a Trichoscopy_Image during manual or AI-assisted editing.
- **Strand**: A hair strand drawn on a Trichoscopy_Image using a 3-point rectangle tool.
- **GDPR**: General Data Protection Regulation — EU data privacy law applicable to all patient data.
- **HIPAA**: Health Insurance Portability and Accountability Act — US healthcare data privacy law applicable to all patient data.
- **Encryption_At_Rest**: Encryption of stored data using industry-standard algorithms (AES-256 or equivalent).
- **Encryption_In_Transit**: Encryption of data during network transmission using TLS 1.2 or higher.

---

## Cross-Cutting Requirements

### Requirement CC-1: Multi-Tenancy and Data Isolation

**User Story:** As an Organization_Admin, I want all data to be strictly isolated per Organization so that no Clinic or Staff member can access another Organization's data.

#### Acceptance Criteria

1. THE Platform SHALL enforce data isolation such that every database query is scoped to the authenticated user's Organization.
2. WHEN a Staff member authenticates, THE Platform SHALL restrict all data access to the Clinic(s) to which that Staff member belongs.
3. WHILE a Staff member holds only Clinic-level roles, THE Platform SHALL prevent that Staff member from reading or modifying data belonging to other Clinics within the same Organization.
4. WHEN an Organization_Admin accesses Clinic data, THE Platform SHALL permit access to staff management, clinic details, and the organization dashboard only; access to Patients, Appointments, Leads, Billing, and Products SHALL be denied.
5. THE Platform SHALL support a Staff member holding multiple Roles simultaneously, applying the union of all granted Permissions.
6. IF a request attempts to access a resource outside the authenticated user's tenant scope, THEN THE Platform SHALL return an authorization error and SHALL record the attempt in the Audit_Log.

#### Correctness Properties

- **Isolation invariant**: For any two Organizations O1 and O2, no query executed in the context of O1 SHALL return data owned by O2.
- **Role union**: The effective permissions of a Staff member with roles R1 and R2 SHALL equal the union of permissions(R1) ∪ permissions(R2).
- **Cross-clinic denial**: For any Staff member S with only Clinic-level roles assigned to Clinic C1, every request by S targeting data in Clinic C2 (C1 ≠ C2) SHALL be denied.
- **Org admin clinical module denial**: For any Organization_Admin A, every request by A targeting Patients, Appointments, Leads, Billing, or Products data SHALL be denied.

---

### Requirement CC-2: Authentication and Staff Onboarding

**User Story:** As a prospective Organization owner, I want to self-register my Organization and first Clinic so that I can begin using the platform without manual provisioning.

#### Acceptance Criteria

1. WHEN a new user submits a self-registration form, THE Platform SHALL create an Organization record, a Clinic record, and an Admin account using only the provided Organization name, Clinic name, and Clinic address.
2. THE Platform SHALL NOT require additional information beyond Organization name, Clinic name, and address during self-registration.
3. WHEN an Admin sends a staff invitation, THE Platform SHALL send an email containing a unique invite link to the invitee's email address.
4. THE Invite SHALL expire exactly 24 hours after it is issued.
5. WHEN an invitee follows a valid Invite link, THE Platform SHALL allow the invitee to set their own password and complete their Staff profile.
6. IF an invitee follows an expired or already-used Invite link, THEN THE Platform SHALL display an expiry message and SHALL NOT create a Staff account.
7. WHEN a Staff member authenticates successfully, THE Platform SHALL issue a session token scoped to that Staff member's Clinic and Roles.
8. IF authentication credentials are invalid, THEN THE Platform SHALL return an authentication error and SHALL NOT issue a session token.

#### Correctness Properties

- **Invite expiry**: For any Invite issued at time T, the Invite SHALL be valid for all instants in [T, T+24h) and invalid for all instants ≥ T+24h.
- **Invite single-use**: Using the same Invite link a second time SHALL NOT create a second Staff account.
- **Self-registration minimalism**: A self-registration submission containing only Organization name, Clinic name, and address SHALL succeed; a submission missing any of those three fields SHALL fail.

---

### Requirement CC-3: Roles and Permissions

**User Story:** As an Admin, I want to define custom Roles with granular Permissions so that I can control exactly what each Staff member can do within the platform.

#### Acceptance Criteria

1. THE Platform SHALL provide the following default Roles: Organization_Admin, Clinic_Admin, Doctor, Receptionist, Nurse, Sales, Marketing, and Frontdesk.
2. THE Platform SHALL allow a Clinic_Admin to create, edit, and delete custom Roles.
3. WHEN an Admin attempts to delete a Role that would leave a Clinic with no active Clinic_Admin, THE Platform SHALL reject the deletion and return a descriptive error.
4. WHEN an Admin attempts to delete or deactivate the last remaining active Clinic_Admin or Organization_Admin, THE Platform SHALL reject the action and return a descriptive error.
5. THE Platform SHALL allow Permissions to be configured at the module level with the following actions: view, create, edit, and delete.
6. WHEN a Staff member attempts an action for which their combined Roles grant no Permission, THE Platform SHALL deny the action and return an authorization error.
7. THE Platform SHALL allow a Staff member to be assigned multiple Roles simultaneously.
8. WHEN a Role is edited, THE Platform SHALL immediately apply the updated Permissions to all Staff members holding that Role.

#### Correctness Properties

- **Permission denial completeness**: For every module M and action A, if no Role assigned to Staff member S grants (M, A), then every request by S for action A on module M SHALL be denied.
- **Last-clinic-admin guard**: After any Role deletion or Staff deletion or deactivation, the count of active Clinic_Admins in each Clinic SHALL remain ≥ 1.
- **Last-org-admin guard**: After any Role deletion or Staff deletion or deactivation, the count of active Organization_Admins in the Organization SHALL remain ≥ 1.
- **Immediate permission propagation**: For any Staff member S holding Role R, within one request cycle after Role R is updated, S's effective permissions SHALL reflect the updated Role R.
- **Org admin scope enforcement**: The Organization_Admin role SHALL NOT grant access to Patients, Appointments, Leads, Billing, or Products modules in any Clinic.

---

### Requirement CC-4: GDPR and HIPAA Compliance

**User Story:** As an Organization_Admin, I want all patient data to be handled in accordance with GDPR and HIPAA so that the platform meets legal obligations in all operating jurisdictions.

#### Acceptance Criteria

1. THE Platform SHALL encrypt all patient data at rest using Encryption_At_Rest.
2. THE Platform SHALL transmit all data over TLS using Encryption_In_Transit.
3. THE Platform SHALL enforce role-based access controls on all patient data endpoints.
4. THE Platform SHALL maintain an Audit_Log of all access and modification events on patient data.
5. WHEN a patient submits a data deletion request, THE Platform SHALL provide a mechanism for an Admin to permanently delete or anonymize that patient's personal data in compliance with GDPR right-to-erasure requirements.
6. WHEN a patient submits a data export request, THE Platform SHALL provide a mechanism for an Admin to export all personal data held for that patient in a machine-readable format.
7. THE Platform SHALL enforce configurable data retention policies per Organization.
8. IF a data retention period expires for a record, THEN THE Platform SHALL either delete or anonymize that record according to the configured policy.
9. THE Platform SHALL NOT transfer patient data to third parties without explicit consent recorded in the system.
10. THE Platform SHALL provide a consent management mechanism allowing patients to record and update their data processing consent.

#### Correctness Properties

- **Encryption coverage**: For every patient data field stored in the database, the stored value SHALL be encrypted such that reading raw storage without the decryption key yields no plaintext personal data.
- **Export completeness**: The data export for a patient SHALL contain every personal data field associated with that patient across all modules.
- **Retention enforcement**: For any record R with retention period P, R SHALL be deleted or anonymized within one processing cycle after the retention period expires.

---

### Requirement CC-5: Audit Logging

**User Story:** As an Organization_Admin, I want an immutable audit log of all significant platform actions so that I can investigate incidents and demonstrate compliance.

#### Acceptance Criteria

1. THE Audit_Log SHALL record every significant action including: Staff creation/update/deletion, Role changes, Patient data access/modification, Session creation/completion/deletion, Invoice generation, and Permission changes.
2. WHEN an action is recorded, THE Audit_Log SHALL capture: timestamp (UTC), actor identity (original Staff name at time of action), action type, affected resource identifier, and before/after values where applicable.
3. THE Audit_Log SHALL be immutable — no Staff member, including Organization_Admin, SHALL be able to edit or delete Audit_Log entries.
4. WHEN a Staff member is deleted, THE Audit_Log SHALL retain all entries attributed to that Staff member using the Staff member's original name at the time of each action.
5. THE Platform SHALL allow authorized Staff to search and filter Audit_Log entries by date range, actor, and action type.
6. THE Platform SHALL retain Audit_Log entries for a minimum of 7 years to satisfy HIPAA requirements.

#### Correctness Properties

- **Immutability**: For any Audit_Log entry E created at time T, the content of E SHALL be identical when read at any time T' > T.
- **Actor name preservation**: For any Audit_Log entry attributed to a deleted Staff member, the actor name field SHALL equal the Staff member's name at the time the action was performed.
- **Completeness**: For every action in the defined significant-action set, an Audit_Log entry SHALL exist within one processing cycle of the action occurring.

---

### Requirement CC-6: Subscription Plan Feature Gating

**User Story:** As an Organization_Admin, I want the platform to enforce my subscription plan limits so that I only access features included in my plan.

#### Acceptance Criteria

1. THE Platform SHALL restrict access to modules and features based on the Organization's active Plan.
2. WHEN a Staff member attempts to access a feature not included in the Organization's Plan, THE Platform SHALL deny access and display a plan upgrade prompt.
3. THE Platform SHALL NOT manage subscription billing internally — Plan status is provided by an external subscription system.
4. WHEN the external subscription system updates an Organization's Plan, THE Platform SHALL reflect the updated feature access within one processing cycle.
5. THE Platform SHALL allow all Plan-gated features to be toggled per Organization by the external subscription system.

---

### Requirement CC-7: Notification System

**User Story:** As a Staff member, I want to receive timely notifications about important platform events so that I can act on them without constantly polling the application.

#### Acceptance Criteria

1. WHEN a significant event occurs (AI_Analysis completion, appointment booking, lead conversion), THE Platform SHALL deliver an in-app toaster notification on the web application.
2. WHEN a significant event occurs, THE Platform SHALL deliver a push notification on the mobile application.
3. WHEN a significant event requires email communication (appointment confirmation, invite), THE Platform SHALL send an email notification to the relevant recipient.
4. THE Platform SHALL NOT send duplicate notifications for the same event to the same recipient within a single event cycle.

---

### Requirement CC-8: Web and Mobile Application Support

**User Story:** As a Staff member, I want to use the platform on both web and mobile devices so that I can manage clinic operations from any device.

#### Acceptance Criteria

1. THE Platform SHALL provide a web application accessible via modern browsers.
2. THE Platform SHALL provide a mobile application supporting iOS and Android.
3. THE Platform SHALL provide embeddable Web_Components built with Stencil for the Selfie Analysis and Appointment Booking flows.
4. WHEN a Web_Component is embedded on a clinic website, THE Platform SHALL authenticate the component using a clinic-specific API key.
5. THE Platform SHALL maintain feature parity between web and mobile for all core workflows.

---

### Requirement CC-9: Data Ownership and Deletion Policies

**User Story:** As an Organization_Admin, I want clear data ownership and deletion rules so that data integrity is maintained when staff members leave the organization.

#### Acceptance Criteria

1. WHEN a Staff member is deleted, THE Platform SHALL require all transferable records owned by that Staff member to be transferred to another Staff member of equal or higher Role level before deletion proceeds. Transferable records include: analysis sessions created by the staff member, patient records created by the staff member, assigned appointments, assigned leads, invoices created by the staff member, uploaded medical documents, and doctor's notes.
2. THE Platform SHALL preserve the original Staff member's name in all historical records and Audit_Log entries after deletion. Audit_Log entries SHALL NOT be transferred to the recipient.
3. WHEN a Staff member is deactivated (set to Inactive), THE Platform SHALL preserve all data associated with that Staff member unchanged.
4. THE Platform SHALL NOT allow deletion of a Staff member without completing the data transfer step.
5. WHEN data is transferred from a deleted Staff member to a recipient, THE Platform SHALL record the transfer in the Audit_Log including the list of transferred record types.

#### Correctness Properties

- **Data transfer completeness**: After Staff member S is deleted, every record previously owned by S SHALL be owned by the designated recipient R.
- **Name preservation**: After Staff member S is deleted, every historical record and Audit_Log entry referencing S SHALL display S's original name.
