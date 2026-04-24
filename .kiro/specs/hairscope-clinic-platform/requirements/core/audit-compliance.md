# Audit & Compliance

> Covers: Audit logging, GDPR, HIPAA, data retention, consent management, and encryption.

---

## Glossary

- **Audit_Log**: An immutable, append-only record of all significant platform actions.
- **GDPR**: General Data Protection Regulation - EU data privacy law.
- **HIPAA**: Health Insurance Portability and Accountability Act - US healthcare data privacy law.
- **Right_to_Erasure**: GDPR Article 17 - the right of a data subject to have their personal data deleted or anonymized.
- **Data_Export**: A machine-readable export of all personal data held for a specific patient.
- **Consent**: A recorded agreement by a patient to specific data processing activities.
- **Encryption_At_Rest**: AES-256 encryption of all stored patient personal data.
- **Encryption_In_Transit**: TLS 1.2 or higher for all data transmitted over the network.

---

## Requirements

### AUD-1: Audit Log Integrity

#### Acceptance Criteria

1. THE Audit_Log SHALL be append-only. No entry may be edited, deleted, or soft-deleted by any user including Organization_Admin.
2. WHEN a Staff member is deleted, THE Audit_Log SHALL retain all entries attributed to that Staff member using their original name at the time of each action.
3. THE Platform SHALL retain Audit_Log entries for a minimum of 7 years (HIPAA requirement).
4. THE Platform SHALL allow authorized Staff to query Audit_Log entries filtered by: date range, actor, action type, resource type, and resource ID.
5. Audit_Log queries SHALL be paginated using cursor-based pagination (Relay spec).
6. THE Platform SHALL expose Audit_Log queries via GraphQL only - no bulk export endpoint is required in this version.

#### Correctness Properties

- For any Audit_Log entry E created at time T, the content of E SHALL be identical when read at any time T' > T.
- For any deleted Staff member S, every Audit_Log entry attributed to S SHALL display S's name as it was at the time of the action.
- The total count of Audit_Log entries SHALL be monotonically non-decreasing over time.

---

### AUD-2: Audit Log Coverage

Every state-changing operation on the following entities MUST produce an Audit_Log entry. This list is exhaustive - any operation not listed here does not require an audit entry.

| Entity | Audited Actions |
|--------|----------------|
| Staff | create, update, deactivate, reactivate, delete, inter-clinic transfer |
| Role | create, update, delete |
| Permission | update |
| Clinic_Profile | update |
| Organization | create |
| Clinic | create |
| Patient | create, update, gdpr_erasure |
| Session | create, save, complete, delete |
| Trichoscopy_Image annotations | edit_save |
| Medical_Document | upload, delete |
| Lead | create, update, convert, delete |
| Appointment | create, reschedule, cancel, status_change |
| Product | create, update, delete |
| Invoice | generate, add_charge, edit_charge, remove_charge, finalize |
| Report | generate, regenerate, share |
| Authentication | login_success, login_failure, logout, invite_sent, invite_used, invite_expired |
| Data_Transfer | staff_deletion_transfer |
| Plan | plan_updated (received from external system) |

---

### AUD-3: GDPR Compliance

#### Acceptance Criteria

1. THE Platform SHALL encrypt all patient personal data at rest using AES-256 or equivalent.
2. THE Platform SHALL transmit all data over TLS 1.2 or higher.
3. THE Platform SHALL enforce role-based access controls on all patient data endpoints.
4. WHEN a verified GDPR right-to-erasure request is processed by a Clinic_Admin, THE Platform SHALL anonymize all personal identifiers for that Patient: `firstName`, `lastName`, `email`, `phone`, `dateOfBirth` are replaced with anonymized placeholders.
5. Erasure SHALL NOT delete Session clinical data (images, AI analysis, reports) - only personal identifiers are anonymized.
6. Erasure is irreversible. THE Platform SHALL require explicit confirmation before proceeding.
7. WHEN erasure is completed, THE Platform SHALL record the action in the Audit_Log with actor and timestamp.
8. WHEN a patient requests a data export, THE Platform SHALL allow a Clinic_Admin to generate a machine-readable export (JSON) of all personal data held for that patient across all modules.
9. THE Platform SHALL NOT transfer patient personal data to third parties without explicit consent recorded in the system.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Erasure attempted without confirmation | `CONFIRMATION_REQUIRED` |
| Data export for non-existent patient | `PATIENT_NOT_FOUND` |

#### Correctness Properties

- After erasure, no query SHALL return the original personal identifiers for the erased Patient.
- The data export for a Patient SHALL contain every personal data field associated with that Patient across all modules.

---

### AUD-4: HIPAA Compliance

#### Acceptance Criteria

1. THE Platform SHALL maintain an audit trail of all access and modification events on Protected Health Information (PHI).
2. PHI includes: patient name, contact details, date of birth, session data, medical documents, AI analysis results, and reports.
3. THE Platform SHALL enforce minimum necessary access - Staff members only access PHI required for their role.
4. THE Platform SHALL support configurable data retention policies per Organization, with a minimum of 7 years for PHI.
5. THE Platform SHALL provide a mechanism for Clinic_Admins to respond to HIPAA audit requests by exporting audit log entries for a specified date range and resource.

---

### AUD-5: Consent Management

#### Acceptance Criteria

1. THE Platform SHALL provide a mechanism for recording patient consent to data processing.
2. Consent records SHALL include: patient identifier, consent type, granted/revoked status, timestamp, and the Staff member who recorded it.
3. THE Platform SHALL allow consent to be updated (granted or revoked) at any time by a Clinic_Admin.
4. WHEN consent is updated, THE Platform SHALL record the change in the Audit_Log.
5. THE Platform SHALL NOT process patient data for purposes beyond those consented to.

---

### AUD-6: Subscription Plan Compliance

#### Acceptance Criteria

1. THE Platform SHALL restrict access to modules and features based on the Organization's active Plan.
2. WHEN a Staff member attempts to access a feature not included in the Plan, THE Platform SHALL return a `PLAN_LIMIT_EXCEEDED` error.
3. THE Platform SHALL NOT manage subscription billing internally - Plan status is provided by an external system via a secure API.
4. WHEN the external system updates an Organization's Plan, THE Platform SHALL reflect the updated feature access within one processing cycle.
5. Plan changes SHALL be recorded in the Audit_Log.
