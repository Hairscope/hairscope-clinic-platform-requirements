# Products

> Covers: Per-clinic product catalog, product recommendations in sessions, prescription generation, and purchase links.
> Events emitted: none (products are referenced by Sessions; report regeneration is triggered via `AnnotationEditSaved` with trigger `PRODUCT_EDIT`)
> Events consumed: none

---

## Glossary

- **Product_Type**: `COSMETIC` (no prescription required) | `MEDICAL` (prescription required) — see `shared/enums.md`.
- **Product_Catalog**: The complete set of Products configured for a specific Clinic.
- **Purchase_Link**: An external URL pointing to where the recommended Product can be purchased.
- **Routine**: A recommended usage schedule (frequency, dosage, application method) associated with a Product recommendation in a Session.
- **Prescription**: A formal medication order included in the Report when Medical Products are recommended.

---

## Requirements

### PRD-1: Product Catalog Management

**User Story:** As a Clinic_Admin, I want to manage a product catalog for my clinic so that doctors can recommend appropriate products to patients during analysis sessions.

#### Acceptance Criteria

1. THE Platform SHALL maintain a separate Product_Catalog per Clinic.
2. THE Platform SHALL allow Clinic_Admins to create, edit, and delete Products in the Clinic's Product_Catalog.
3. THE Platform SHALL store the following fields per Product: `name`, `description`, `image`, `price`, `currency`, `purchaseLink` (optional), `productType`.
4. WHEN a Product is created, `name` and `productType` are required.
5. THE Platform SHALL support two `productType` values: `COSMETIC` and `MEDICAL`.
6. WHEN a Product is created, edited, or deleted, THE Platform SHALL record the action in the Audit_Log.
7. THE Platform SHALL allow Staff to search and filter Products by `name` and `productType`.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` | `VALIDATION_ERROR` (field: `name`) |
| Missing `productType` | `VALIDATION_ERROR` (field: `productType`) |
| Invalid `productType` value | `VALIDATION_ERROR` (field: `productType`) |
| Product not found | `NOT_FOUND` |

#### Correctness Properties

- For any two Clinics C1 and C2: the Product_Catalog of C1 SHALL NOT contain Products belonging to C2.
- For any Product P: `P.productType ∈ {COSMETIC, MEDICAL}`.

---

### PRD-2: Product Recommendation in Sessions

**User Story:** As a Doctor, I want to recommend products from the clinic catalog during a session so that patients receive a tailored treatment plan in their report.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to link one or more Products from the Clinic's Product_Catalog to a Session as recommendations.
2. THE Platform SHALL allow Staff to associate a Routine with each recommended Product.
3. WHEN a `MEDICAL` Product is recommended in a Session, THE Platform SHALL include a Prescription in the generated Report.
4. WHEN only `COSMETIC` Products are recommended, THE Platform SHALL NOT include a Prescription in the generated Report.
5. THE Platform SHALL include all recommended Products and their associated Routines in the generated Report.
6. WHEN a Session is in `COMPLETED` status, THE Platform SHALL allow Staff to edit product recommendations and Routines; editing triggers Report regeneration via `AnnotationEditSaved` (trigger: `PRODUCT_EDIT`).
7. WHEN the Stress_O_Meter score meets the defined threshold, THE Platform SHALL suggest stress-related Products from the Product_Catalog for inclusion in the Session.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Product not in Clinic's catalog | `NOT_FOUND` |
| Editing recommendations on non-COMPLETED Session | `FORBIDDEN` |

#### Correctness Properties

- For any Session S containing at least one `MEDICAL` Product: the generated Report SHALL include a non-empty Prescription section.
- For any Session S containing only `COSMETIC` Products: the generated Report SHALL NOT include a Prescription section.
- For any Product P recommended in Session S with Routine R: the generated Report SHALL include R alongside P.

---

### PRD-3: Product Display and Purchase Link

**User Story:** As a patient, I want to see product recommendations with purchase links in my report so that I can easily obtain the recommended treatments.

#### Acceptance Criteria

1. THE Platform SHALL include the `purchaseLink` for each recommended Product in the generated Report.
2. THE Platform SHALL display `image`, `name`, `description`, and `price` alongside the `purchaseLink` in the Report.
3. THE Platform SHALL NOT process any product purchases within the platform — the `purchaseLink` directs the patient to an external site.
4. IF a Product does not have a `purchaseLink` configured, THE Platform SHALL omit the purchase link from the Report for that Product without error.

#### Correctness Properties

- The platform SHALL NOT store any payment or order records related to Product purchases.
- For any Product P with a null `purchaseLink`: the Report SHALL render P's other fields without error.

---

### PRD-4: Medical Product Prescription Generation

**User Story:** As a Doctor, I want prescriptions to be automatically generated when I recommend medical products so that patients receive a compliant medication order as part of their report.

#### Acceptance Criteria

1. WHEN a Session contains at least one `MEDICAL` Product recommendation, THE Platform SHALL generate a Prescription as part of the Report.
2. THE Prescription SHALL include: patient details, doctor details, clinic details, date, and a list of all `MEDICAL` Products with their associated Routines.
3. THE Platform SHALL include the Prescription within the Report PDF.
4. WHEN `MEDICAL` Product recommendations are edited after Session completion, THE Platform SHALL regenerate the Prescription and the Report.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Report generation fails | `ASYNC_OPERATION_FAILED` |

#### Correctness Properties

- For any Prescription generated for Session S: the Prescription SHALL list every `MEDICAL` Product recommended in S with its associated Routine.
- After any edit to `MEDICAL` Product recommendations in Session S: the regenerated Prescription SHALL reflect the updated list.
