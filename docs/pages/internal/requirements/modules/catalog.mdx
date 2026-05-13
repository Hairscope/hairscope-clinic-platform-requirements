# Catalog

> Covers: Catalog item management (services, medications, cosmetics, supplements), routines, treatment kits, service-specific scheduling fields, and catalog item deletion behavior.
> Events emitted: `CatalogItemCreated`, `CatalogItemUpdated`, `CatalogItemDeleted`, `TreatmentKitCreated`, `TreatmentKitUpdated`, `TreatmentKitDeleted`
> Events consumed: none

> **Architectural note:** The Catalog Module is the single source of truth for all clinic offerings — services, medications, cosmetics, and supplements. It replaces the previous Products module and absorbs Service configuration from the Appointments module. Appointments reference catalog items of type `SERVICE` for booking. Sessions reference any catalog item type for recommendations.

---

## Glossary

- **CatalogItem**: Any offering configured by a Clinic — a service, medication, cosmetic product, or supplement. All types share common fields and type-specific extensions.
- **CatalogItemType**: `SERVICE` | `MEDICATION` | `COSMETIC` | `SUPPLEMENT` — determines behavior, validation rules, and which documents the item appears in.
- **Routine**: A customizable usage/schedule instruction attached to every catalog item. Describes frequency, duration, and application method. Required for medications; recommended for all types.
- **TreatmentKit**: A named bundle of catalog items (any mix of types) with their individual routines, a combined description, its own price, and an external link.
- **QualifiedStaff**: The set of Staff members configured as able to provide a specific Service. Used by the SmartScheduling engine for appointment assignment. Only applicable to `SERVICE` type.
- **ExternalLink**: A URL associated with a catalog item — product purchase link, appointment booking link, or payment link for a kit. The platform never processes payments.
- **DigitalSignature**: An image uploaded to a Staff member's profile, used to sign Treatment Plans and Prescriptions.

---

## Permission Model

| Permission | What it covers |
|-----------|---------------|
| `catalog.view` | View all catalog items and treatment kits |
| `catalog.create` | Create new catalog items and treatment kits |
| `catalog.edit` | Edit catalog items and treatment kits |
| `catalog.delete` | Delete catalog items and treatment kits |

OrganizationAdmins do NOT have access to the `catalog` module (consistent with GI-8 clinical module restriction).

---

## Requirements

### CAT-1: Catalog Item Management

**User Story:** As a ClinicAdmin, I want to manage a unified catalog of services and products for my clinic so that all offerings are configured in one place and available for appointments, session recommendations, and treatment plans.

#### Acceptance Criteria

1. THE Platform SHALL maintain a separate catalog per Clinic.
2. THE Platform SHALL allow Staff with `catalog.create` permission to create catalog items with the following shared fields: `name`, `description`, `image`, `price` (required, ≥ 0), `externalLink` (optional), `catalogItemType`, `routine`.
3. THE Platform SHALL support four `catalogItemType` values: `SERVICE`, `MEDICATION`, `COSMETIC`, `SUPPLEMENT`.
4. WHEN `catalogItemType` is `SERVICE`, THE Platform SHALL additionally require: `duration` (minutes) and accept optional `qualifiedStaff[]` (list of Staff member IDs).
5. WHEN `catalogItemType` is `MEDICATION`, THE Platform SHALL require a `routine` to be provided. A medication cannot be saved without a routine.
6. FOR all other types (`SERVICE`, `COSMETIC`, `SUPPLEMENT`), `routine` is optional at creation but recommended.
7. THE Platform SHALL allow Staff with `catalog.edit` permission to edit any field on a catalog item at any time.
8. THE Platform SHALL allow Staff to search and filter catalog items by `name`, `catalogItemType`, and `price` range.
9. WHEN a catalog item is created, edited, or deleted, THE Platform SHALL record the action in the AuditLog.
10. THE `qualifiedStaff` list on SERVICE items SHALL NOT be exposed to patients or leads — it is used exclusively by the SmartScheduling engine.
11. Catalog items SHALL NOT have an individual `currency` field. All catalog items inherit the currency configured at the Clinic level (see ORG-3).

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` | `VALIDATION_ERROR` (field: `name`) |
| Missing `price` | `VALIDATION_ERROR` (field: `price`) |
| `price` < 0 | `VALIDATION_ERROR` (field: `price`) |
| Missing `catalogItemType` | `VALIDATION_ERROR` (field: `catalogItemType`) |
| Invalid `catalogItemType` value | `VALIDATION_ERROR` (field: `catalogItemType`) |
| SERVICE missing `duration` | `VALIDATION_ERROR` (field: `duration`) |
| SERVICE `duration` ≤ 0 | `VALIDATION_ERROR` (field: `duration`) |
| MEDICATION missing `routine` | `VALIDATION_ERROR` (field: `routine`) |
| Catalog item not found | `NOT_FOUND` |

#### Correctness Properties

- For any two Clinics C1 and C2: the catalog of C1 SHALL NOT contain items belonging to C2.
- For any catalog item I: `I.catalogItemType ∈ {SERVICE, MEDICATION, COSMETIC, SUPPLEMENT}`.
- For any SERVICE item S: `S.duration > 0`.
- For any MEDICATION item M: `M.routine` is non-null and non-empty.
- `qualifiedStaff` is never returned in any patient-facing or web-component-facing GraphQL query.

---

### CAT-2: Routine Configuration

**User Story:** As a Doctor, I want to define customizable routines for each catalog item so that patients receive clear usage instructions in their treatment plans and prescriptions.

#### Acceptance Criteria

1. THE Platform SHALL store a `routine` on every catalog item as a structured object containing: `frequency` (e.g., "twice daily", "once a month"), `duration` (e.g., "6 months", "3 months"), `instructions` (free text, e.g., "apply morning and night", "take with food").
2. THE Platform SHALL allow routines to be customized per session recommendation — the catalog item's default routine serves as a template, but the doctor may override it for a specific patient.
3. WHEN a catalog item is recommended in a session, THE Platform SHALL copy the item's default routine as the starting point, allowing the doctor to modify it for that recommendation.
4. THE Platform SHALL include the routine (default or customized) in the Treatment Plan and Prescription PDFs.
5. THE Platform SHALL validate that MEDICATION items always have a non-empty routine before the item can be saved.

#### Correctness Properties

- For any MEDICATION item M in the catalog: `M.routine` is always non-null.
- For any session recommendation R referencing catalog item I: `R.routine` may differ from `I.routine` (doctor override).
- The routine displayed in the Treatment Plan/Prescription SHALL be the session-specific routine, not the catalog default (unless unchanged).

---

### CAT-3: Service-Specific Configuration

**User Story:** As a ClinicAdmin, I want to configure which staff members can provide each service and set service durations so that the scheduling engine can assign the right person and calculate correct time slots.

#### Acceptance Criteria

1. THE Platform SHALL allow ClinicAdmins to add or remove Staff members from a SERVICE item's `qualifiedStaff` list at any time.
2. THE Platform SHALL require at least one Staff member in `qualifiedStaff` before a SERVICE can be booked as an appointment.
3. THE Platform SHALL display the list of configured SERVICE items when a Staff member or patient initiates an appointment booking.
4. THE `duration` field on a SERVICE item SHALL be used by the Appointments module to calculate slot availability.
5. WHEN a SERVICE item's `qualifiedStaff` is updated, THE Platform SHALL apply the change to all future appointment assignments. Existing appointments are not affected.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Booking a SERVICE with no `qualifiedStaff` configured | `SERVICE_NO_QUALIFIED_STAFF` |
| Staff member not found when adding to `qualifiedStaff` | `NOT_FOUND` |

#### Correctness Properties

- For any SERVICE item S used in appointment booking: `count(S.qualifiedStaff) ≥ 1`.
- `qualifiedStaff` changes do not retroactively affect existing appointment assignments.

---

### CAT-4: Catalog Item Deletion

**User Story:** As a ClinicAdmin, I want to understand the impact of deleting a catalog item before confirming so that I don't accidentally cancel appointments or break existing records.

#### Acceptance Criteria

1. WHEN a Staff member attempts to delete a SERVICE item, THE Platform SHALL display a warning showing the count of future appointments that will be cancelled if deletion proceeds.
2. THE Platform SHALL require explicit confirmation (`confirmed: true`) before deleting a SERVICE item with active appointments.
3. WHEN a SERVICE item is deleted and confirmed, THE Platform SHALL cancel all future appointments (`SCHEDULED` or `CONFIRMED` status) that reference that service, emit `AppointmentCancelled` for each, and send cancellation notifications.
4. WHEN a SERVICE item is deleted, THE Platform SHALL retain the service name and details on all past (COMPLETED, CANCELLED, NO_SHOW) appointments as a snapshot (soft reference preservation).
5. WHEN a non-SERVICE catalog item (MEDICATION, COSMETIC, SUPPLEMENT) is deleted, THE Platform SHALL retain the item's name, description, and routine on all existing session recommendations and generated Treatment Plans/Prescriptions. The `externalLink` will no longer resolve but the document content remains intact.
6. WHEN a catalog item that is part of a Treatment Kit is deleted, THE Platform SHALL remove it from the kit and update the kit accordingly.
7. WHEN a Treatment Kit is deleted, THE Platform SHALL retain the kit's name, description, items, and routines on all existing session recommendations as a snapshot. The `externalLink` will no longer resolve but the document content remains intact.
8. WHEN a catalog item or Treatment Kit is deleted, THE Platform SHALL record the action in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Deleting SERVICE with active appointments without confirmation | `CONFIRMATION_REQUIRED` |
| Catalog item not found | `NOT_FOUND` |

#### Correctness Properties

- After a SERVICE item S is deleted: no new appointments can reference S.
- After a SERVICE item S is deleted: all future appointments referencing S SHALL have status `CANCELLED`.
- After any catalog item I is deleted: existing Treatment Plans and Prescriptions referencing I SHALL retain I's snapshot data unchanged.
- After deletion, the `externalLink` on existing documents may be broken — this is expected and acceptable.

---

### CAT-5: Treatment Kits

**User Story:** As a ClinicAdmin, I want to create treatment kits that bundle services and products together so that doctors can recommend comprehensive treatment plans to patients.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with `catalog.create` permission to create Treatment Kits.
2. A Treatment Kit SHALL contain: `name`, `description`, `image`, `price` (required, ≥ 0), `externalLink` (optional), and a list of `kitItems` — each referencing a catalog item with an optional routine override. Currency is inherited from the Clinic.
3. A Treatment Kit MAY contain any mix of catalog item types (services, medications, cosmetics, supplements).
4. THE Platform SHALL allow the kit's `price` to differ from the sum of individual item prices (bundle pricing).
5. THE Platform SHALL allow Staff to add or remove items from a kit at any time.
6. WHEN a Treatment Kit is recommended in a session, THE Platform SHALL include all kit items with their routines in the Treatment Plan PDF.
7. IF a Treatment Kit contains MEDICATION items, THE Platform SHALL include those medications in the Prescription PDF (with doctor signature required).
8. WHEN a Treatment Kit is created, edited, or deleted, THE Platform SHALL record the action in the AuditLog.
9. THE Platform SHALL allow Staff to search and filter Treatment Kits by name.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` | `VALIDATION_ERROR` (field: `name`) |
| Kit with zero items | `VALIDATION_ERROR` (field: `kitItems`) |
| Referenced catalog item not found | `NOT_FOUND` |
| Kit not found | `NOT_FOUND` |

#### Correctness Properties

- For any Treatment Kit K: `count(K.kitItems) ≥ 1`.
- For any Treatment Kit K containing at least one MEDICATION item: recommending K in a session SHALL trigger Prescription generation (with doctor signature).
- Treatment Kits are scoped per Clinic — a kit in Clinic C1 SHALL NOT reference catalog items from Clinic C2.

---

### CAT-6: Session Recommendations from Catalog

**User Story:** As a Doctor, I want to recommend any catalog item (services, products, or kits) to a patient during a session so that the patient receives a complete treatment plan.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to recommend any catalog item (SERVICE, MEDICATION, COSMETIC, SUPPLEMENT) or Treatment Kit in a session.
2. WHEN recommending a catalog item, THE Platform SHALL copy the item's default routine as a starting point. The doctor MAY customize the routine for this specific recommendation.
3. THE Platform SHALL allow multiple recommendations per session (any mix of types and kits).
4. WHEN a session is in `COMPLETED` status, THE Platform SHALL allow editing of recommendations and routines. Editing after Treatment Plan/Prescription generation requires re-generation and re-signing.
5. THE Platform SHALL group recommendations by type for document generation:
   - All recommendations → Treatment Plan PDF
   - MEDICATION recommendations only → Prescription PDF
6. WHEN the StressOMeter score meets the defined threshold, THE Platform SHALL suggest stress-related catalog items for inclusion in the session.

#### Correctness Properties

- For any session S with at least one recommendation: a Treatment Plan SHALL be generatable for S (pending doctor approval).
- For any session S with at least one MEDICATION recommendation: a Prescription SHALL be generatable for S (pending doctor approval and signature).
- For any session S with zero recommendations: no Treatment Plan or Prescription is generated. Only the Clinical Trichoscopy Report and Invoice are produced.

---

### CAT-7: Document Generation and Signing

**User Story:** As a Staff member with treatment plan/prescription generation permission, I want to review recommendations, approve them, and digitally sign the treatment plan and prescription so that patients receive professionally signed documents.

#### Acceptance Criteria

1. WHEN a session has recommendations and a Staff member is ready to generate documents, THE Platform SHALL present a review screen showing all recommendations with routines.
2. THE Staff member SHALL explicitly approve the recommendations and trigger document generation.
3. WHEN generating the Treatment Plan PDF, THE Platform SHALL include: patient details, generating staff member's details (name, specialization), clinic details, session date, all recommendations with routines, and the staff member's digital signature image.
4. WHEN generating the Prescription PDF (if MEDICATION items exist), THE Platform SHALL include: patient details, generating staff member's details (name, specialization, license number), clinic details, date, all MEDICATION items with routines, and the staff member's digital signature image.
5. THE Platform SHALL require the generating staff member to have a digital signature image uploaded in their profile. If no signature exists, generation SHALL be blocked.
6. THE Platform SHALL record in the AuditLog: who generated the documents, when, and which session.
7. IF recommendations are edited after documents have been generated, THE Platform SHALL NOT delete the previous recommendations from the document. Instead:
   - The removed/changed item SHALL remain in the PDF with a strike-through formatting.
   - A reason for the change, the date of change, and the signing staff member's signature SHALL be displayed alongside the struck-through item.
   - The new/replacement item SHALL be added as a new line item below with the current date and signature.
   - This creates an immutable audit trail within the document itself for clinical trust.
8. WHEN recommendations are edited after signing, THE Platform SHALL regenerate the Treatment Plan and/or Prescription PDF incorporating the strike-through history. The new PDF version supersedes the previous one.
9. THE Clinical Trichoscopy Report SHALL include the name and details of the staff member who saved the session (captured images), NOT the staff member who signs the Treatment Plan.
10. Any Staff member with the appropriate permission may generate Treatment Plans and Prescriptions — there is no role-specific restriction. The generating staff member's name and signature appear on the document, and they are liable for the recommendations. It is the ClinicAdmin's responsibility to assign appropriate permissions.
11. THE Platform SHALL allow Staff to share generated Treatment Plans and Prescriptions with the Patient via: PDF download, email, WhatsApp, and shareable link (same mechanisms as the Clinical Trichoscopy Report). Sharing is only possible AFTER the document has been generated and signed.
12. Treatment Plans and Prescriptions SHALL NOT be shareable before they are generated and signed.
13. THE Platform SHALL maintain a version history of all generated Treatment Plan and Prescription PDFs. Previous versions remain accessible for audit purposes but are marked as superseded.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Staff member has no digital signature uploaded | `SIGNATURE_REQUIRED` |
| Session has no recommendations (attempting to generate Treatment Plan) | `NO_RECOMMENDATIONS` |
| Session has no MEDICATION recommendations (attempting to generate Prescription) | `NO_MEDICATION_RECOMMENDATIONS` |
| Staff member lacks permission to generate documents | `FORBIDDEN` |
| Missing reason when editing a previously signed recommendation | `VALIDATION_ERROR` (field: `reason`) |

#### Correctness Properties

- The Treatment Plan PDF SHALL display the generating staff member's name and signature, not the staff who captured images.
- The Clinical Trichoscopy Report SHALL display the staff member's name who saved the session.
- After recommendations are edited post-signing: the regenerated PDF SHALL show struck-through items with reason, date, and signature — plus new items as additions. No information is lost.
- For any Treatment Plan or Prescription generated at time T: the AuditLog SHALL contain an entry recording the signing staff member, session, and timestamp T.
- All previous PDF versions SHALL remain accessible for audit purposes. Only the latest version is the active document.
- The strike-through edit history applies to ALL recommendation types: medications, cosmetics, supplements, and services.

---

### CAT-8: Digital Signature Management

**User Story:** As a Staff member, I want to upload my digital signature to my profile so that it can be used when I generate treatment plans and prescriptions.

#### Acceptance Criteria

1. THE Platform SHALL allow any Staff member to upload a digital signature image to their profile.
2. THE Platform SHALL accept `image/png` and `image/jpeg` formats for signature images, with a maximum size of 2MB.
3. THE Platform SHALL store exactly one active signature per Staff member. Uploading a new signature replaces the previous one.
4. THE Platform SHALL allow a Staff member to delete their signature.
5. WHEN a signature is uploaded or deleted, THE Platform SHALL record the action in the AuditLog.
6. THE Platform SHALL NOT allow document generation (Treatment Plan, Prescription) by a Staff member who has no signature uploaded.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Signature file exceeds 2MB | `FILE_TOO_LARGE` |
| Invalid file type (not PNG or JPEG) | `INVALID_FILE_TYPE` |
| Attempting to generate documents without signature | `SIGNATURE_REQUIRED` |

#### Correctness Properties

- For any Staff member S: at most one active signature image exists at any time.
- For any document generation request by Staff member S: if `S.signature` is null, the request SHALL fail.


---

## Import / Export

> **Status: Deferred** — Import and Export functionality for this module will be available in later versions. See `requirements.md` Section 10.3 for the platform-wide import/export rules. This module will support bulk import and export via CSV and Excel formats.
