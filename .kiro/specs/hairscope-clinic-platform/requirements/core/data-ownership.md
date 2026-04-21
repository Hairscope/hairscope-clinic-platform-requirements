# Data Ownership

> Covers: Record ownership rules, transferable records, deletion policies, and cross-module data relationships.

---

## Ownership Model

Every record in the platform has an owner. Ownership determines:
1. Who is responsible for the record when a Staff member is deleted.
2. Which records are transferred during a staff deletion data transfer.
3. Which records are scoped to a Clinic vs. an Organization.

---

## Ownership Table

| Record Type | Owner | Scope | Transferable on Staff Deletion |
|-------------|-------|-------|-------------------------------|
| Organization | Self (no owner) | Organization | No |
| Clinic | Organization | Organization | No |
| Clinic_Profile | Clinic | Clinic | No |
| Staff | Clinic / Organization | Clinic or Org | No (deleted) |
| Role | Clinic | Clinic | No |
| Patient | Clinic (created_by Staff) | Clinic | Yes — reassigned to recipient |
| Session | Staff (created_by) | Clinic | Yes — reassigned to recipient |
| Trichoscopy_Image | Session | Clinic | No (follows Session) |
| Global_Image | Session | Clinic | No (follows Session) |
| Medical_Document | Staff (uploaded_by) | Clinic | Yes — reassigned to recipient |
| Doctor's Note | Staff (authored_by) | Clinic | Yes — reassigned to recipient |
| Lead | Clinic (unassigned) | Clinic | No (unassigned leads remain) |
| Assigned Lead | Staff (assigned_to) | Clinic | Yes — reassigned to recipient |
| Appointment | Staff (created_by) | Clinic | Yes — reassigned to recipient |
| Invoice | Staff (created_by) | Clinic | Yes — reassigned to recipient |
| Product | Clinic | Clinic | No |
| Report | Session | Clinic | No (follows Session) |
| Audit_Log entry | Staff (actor) | Organization | Never transferred |
| Webhook_Source config | Clinic | Clinic | No |

---

## Requirements

### OWN-1: Record Scoping

#### Acceptance Criteria

1. Every record SHALL be associated with exactly one Organization via its `organizationId` field.
2. Every clinical record (Patient, Session, Lead, Appointment, Invoice, Product, Medical_Document) SHALL be associated with exactly one Clinic via its `clinicId` field.
3. No GraphQL query or mutation SHALL return or modify records outside the authenticated user's Organization scope.
4. No Clinic-level Staff member SHALL access records belonging to a different Clinic within the same Organization.

#### Correctness Properties

- For any two Organizations O1 and O2, no query in the context of O1 SHALL return records with `organizationId = O2`.
- For any Clinic-level Staff member S in Clinic C, no query SHALL return records with `clinicId ≠ C`.

---

### OWN-2: Transferable Records on Staff Deletion

When a Staff member is deleted, the following records are transferred to the designated recipient. The transfer is atomic — either all records are transferred or none are.

#### Transferable Record Types

| Record Type | Transfer Rule |
|-------------|---------------|
| Sessions created by the staff member | `createdBy` field updated to recipient |
| Patient records created by the staff member | `createdBy` field updated to recipient |
| Assigned appointments | `assignedTo` field updated to recipient |
| Assigned leads | `assignedTo` field updated to recipient |
| Invoices created by the staff member | `createdBy` field updated to recipient |
| Uploaded medical documents | `uploadedBy` field updated to recipient |
| Doctor's notes | `authoredBy` field updated to recipient |

#### Non-Transferable Records

| Record Type | Rule |
|-------------|------|
| Audit_Log entries | Remain attributed to original staff name permanently |
| Unassigned leads | Remain unassigned — not transferred |
| Products | Belong to Clinic, not Staff — not transferred |
| Roles | Belong to Clinic, not Staff — not transferred |

#### Acceptance Criteria

1. THE Platform SHALL display the count and type of transferable records before deletion is confirmed.
2. THE Platform SHALL require selection of a recipient Staff member of equal or higher role level.
3. THE transfer SHALL be atomic — if any record transfer fails, the entire deletion is rolled back.
4. WHEN transfer is complete, THE Platform SHALL record the transfer in the Audit_Log including the list of transferred record types and counts.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| No recipient selected | `RECIPIENT_REQUIRED` |
| Recipient has lower role level | `RECIPIENT_INSUFFICIENT_ROLE` |
| Recipient is inactive | `RECIPIENT_INACTIVE` |
| Transfer fails mid-operation | `TRANSFER_FAILED` — full rollback |

#### Correctness Properties

- After deletion, every transferable record previously owned by S SHALL be owned by recipient R.
- Audit_Log entries attributed to S SHALL continue to reference S's original name, not R's name.
- The total count of transferable records before and after transfer SHALL be equal.

---

### OWN-3: Patient Record Permanence

#### Acceptance Criteria

1. Patient records SHALL NOT be deleted or archived by any Staff member under normal operations.
2. Patient records may only be removed via a verified GDPR right-to-erasure process (see `core/audit-compliance.md` AUD-3).
3. GDPR erasure anonymizes personal identifiers but does not delete the clinical record.

#### Correctness Properties

- For any Patient record P created at time T, P SHALL remain retrievable at all times T' > T unless a GDPR erasure has been processed.

---

### OWN-4: Session Data Permanence

#### Acceptance Criteria

1. Sessions in `Saved` or `Completed` status SHALL NOT be deleted.
2. Sessions in `Draft` status may be deleted by any Staff member with session delete permission; deletion is permanent and removes all associated data.
3. WHEN a Session is deleted, all associated Trichoscopy_Images, Global_Images, annotations, questionnaire answers, and doctor's notes are permanently deleted.

#### Correctness Properties

- After a Draft Session is deleted, no data associated with that Session SHALL be retrievable.
- A Session with status `Saved` or `Completed` SHALL NOT be deletable by any operation.
