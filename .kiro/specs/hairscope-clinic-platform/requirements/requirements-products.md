# Requirements Document — Products

## Introduction

The Products module manages the per-clinic product catalog used for treatment recommendations within analysis sessions. Products are not sold through the platform; they are listed for recommendation purposes only and are included in generated reports. Medical products trigger prescription generation. Products can be recommended alongside usage routines in session reports.

---

## Glossary

Refer to the master requirements glossary for platform-wide terms. Additional terms specific to this module:

- **Product_Type**: The classification of a Product: Cosmetic (no prescription required) or Medical (prescription required).
- **Product_Catalog**: The complete set of Products configured for a specific Clinic.
- **Purchase_Link**: An external URL pointing to where the recommended Product can be purchased.
- **Routine**: A recommended usage schedule (e.g., frequency, dosage, application method) associated with a Product recommendation in a Session.

---

## Requirements

### Requirement PRD-1: Product Catalog Management

**User Story:** As a Clinic Admin, I want to manage a product catalog for my clinic so that doctors can recommend appropriate products to patients during analysis sessions.

#### Acceptance Criteria

1. THE Platform SHALL maintain a separate Product_Catalog per Clinic.
2. THE Platform SHALL allow Clinic Admins to create, edit, and delete Products in the Clinic's Product_Catalog.
3. THE Platform SHALL store the following fields for each Product: Name, Description, Image, Price, Purchase_Link, and Product_Type.
4. WHEN a Product is created, THE Platform SHALL require Name and Product_Type fields and return a validation error if either is missing.
5. THE Platform SHALL support two Product_Type values: Cosmetic and Medical.
6. WHEN a Product is created, edited, or deleted, THE Platform SHALL record the action in the Audit_Log.
7. THE Platform SHALL allow Staff to search and filter Products in the Product_Catalog by name and Product_Type.

#### Correctness Properties

- **Catalog isolation**: For any two Clinics C1 and C2, the Product_Catalog of C1 SHALL NOT contain Products belonging to C2.
- **Type constraint**: For any Product P, P.product_type ∈ {Cosmetic, Medical}.

---

### Requirement PRD-2: Product Recommendation in Sessions

**User Story:** As a Doctor, I want to recommend products from the clinic catalog during a session so that patients receive a tailored treatment plan in their report.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to link one or more Products from the Clinic's Product_Catalog to a Session as recommendations.
2. THE Platform SHALL allow Staff to associate a Routine with each recommended Product, specifying usage instructions.
3. WHEN a Medical Product is recommended in a Session, THE Platform SHALL include a Prescription in the generated Report for that Session.
4. WHEN only Cosmetic Products are recommended in a Session, THE Platform SHALL NOT include a Prescription in the generated Report.
5. THE Platform SHALL include all recommended Products and their associated Routines in the generated Report.
6. WHEN a Session is in Completed status, THE Platform SHALL allow Staff to edit product recommendations and Routines, triggering Report regeneration.
7. WHEN the Stress_O_Meter score meets the defined threshold, THE Platform SHALL suggest stress-related Products from the Product_Catalog for inclusion in the Session.

#### Correctness Properties

- **Prescription trigger**: For any Session S containing at least one Medical Product recommendation, the generated Report for S SHALL include a non-empty Prescription section.
- **No prescription for cosmetic-only**: For any Session S containing only Cosmetic Product recommendations, the generated Report for S SHALL NOT include a Prescription section.
- **Routine inclusion**: For any Product P recommended in Session S with Routine R, the generated Report for S SHALL include R alongside P.

---

### Requirement PRD-3: Product Display and Purchase Link

**User Story:** As a patient, I want to see product recommendations with purchase links in my report so that I can easily obtain the recommended treatments.

#### Acceptance Criteria

1. THE Platform SHALL include the Purchase_Link for each recommended Product in the generated Report.
2. THE Platform SHALL display the Product Image, Name, Description, and Price alongside the Purchase_Link in the Report.
3. THE Platform SHALL NOT process any product purchases within the platform — the Purchase_Link directs the patient to an external site.
4. IF a Product does not have a Purchase_Link configured, THE Platform SHALL omit the purchase link from the Report for that Product without error.

#### Correctness Properties

- **No in-platform purchase**: The platform SHALL NOT store any payment or order records related to Product purchases.
- **Optional link**: For any Product P with a null Purchase_Link, the Report SHALL render P's other fields (Name, Description, Price) without error.

---

### Requirement PRD-4: Medical Product Prescription Generation

**User Story:** As a Doctor, I want prescriptions to be automatically generated when I recommend medical products so that patients receive a compliant medication order as part of their report.

#### Acceptance Criteria

1. WHEN a Session contains at least one Medical Product recommendation, THE Platform SHALL generate a Prescription as part of the Report.
2. THE Prescription SHALL include: patient details, doctor details, clinic details, date, and a list of all Medical Products with their associated Routines.
3. THE Platform SHALL include the Prescription within the Report PDF.
4. WHEN Medical Product recommendations are edited after Session completion, THE Platform SHALL regenerate the Prescription and the Report to reflect the updated recommendations.

#### Correctness Properties

- **Prescription completeness**: For any Prescription generated for Session S, the Prescription SHALL list every Medical Product recommended in S with its associated Routine.
- **Prescription regeneration**: After any edit to Medical Product recommendations in Session S, the regenerated Prescription SHALL reflect the updated list of Medical Products.
