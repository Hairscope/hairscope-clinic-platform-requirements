# Requirements Document — Billing

## Introduction

The Billing module handles invoice generation for completed analysis sessions. Invoices are auto-generated when a session is completed, and staff can review and add miscellaneous charges before finalizing. The platform tracks invoice amounts for analytics purposes only — payment processing is not handled within the platform. Invoices are exported as PDFs and are generated on a per-session basis (no recurring billing).

---

## Glossary

Refer to the master requirements glossary for platform-wide terms. Additional terms specific to this module:

- **Invoice**: A PDF billing document auto-generated per completed Session, itemizing services, products, and miscellaneous charges.
- **Misc_Charge**: An additional charge added by Staff to an Invoice that is not associated with a predefined Service or Product.
- **Invoice_Status**: The lifecycle state of an Invoice: Draft, Finalized.
- **Subtotal**: The sum of all itemized charges on an Invoice before tax.
- **Tax**: A configurable tax amount or percentage applied to the Subtotal.
- **Total**: The final amount on an Invoice, equal to Subtotal plus Tax.
- **Invoice_Line_Item**: A single row on an Invoice representing a Service, Product, or Misc_Charge with its associated amount.

---

## Requirements

### Requirement BIL-1: Automatic Invoice Generation

**User Story:** As a Staff member, I want an invoice to be automatically generated when a session is completed so that billing is initiated without manual effort.

#### Acceptance Criteria

1. WHEN a Session transitions to Completed status, THE Platform SHALL automatically generate a Draft Invoice for that Session.
2. THE Draft Invoice SHALL include the following line items: the Service associated with the Session's Appointment (if applicable), all Products recommended in the Session with their prices, and a subtotal.
3. THE Platform SHALL set the initial Invoice_Status to Draft upon generation.
4. WHEN an Invoice is generated, THE Platform SHALL record the generation event in the Audit_Log.
5. THE Platform SHALL associate each Invoice with exactly one Session and one Patient.

#### Correctness Properties

- **Invoice per session**: For any Session S that transitions to Completed, exactly one Invoice SHALL be generated for S.
- **Line item completeness**: For any Invoice I generated for Session S, I SHALL contain a line item for every Service and Product associated with S that has a non-null price.
- **Initial status**: For any newly generated Invoice I, I.status SHALL equal Draft immediately after generation.

---

### Requirement BIL-2: Invoice Review and Miscellaneous Charges

**User Story:** As a Staff member with billing edit permission, I want to review and add miscellaneous charges to an invoice before finalizing it so that all costs are accurately captured.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to add Misc_Charges to a Draft Invoice.
2. WHEN a Misc_Charge is added, THE Platform SHALL require a description and an amount and return a validation error if either is missing.
3. THE Platform SHALL allow Staff to edit or remove Misc_Charges from a Draft Invoice.
4. WHEN Misc_Charges are added, edited, or removed, THE Platform SHALL recalculate the Subtotal, Tax, and Total on the Invoice.
5. THE Platform SHALL allow Staff to configure a tax rate per Clinic, which is applied to the Subtotal when calculating the Total.
6. WHEN a Misc_Charge is added, edited, or removed, THE Platform SHALL record the change in the Audit_Log.

#### Correctness Properties

- **Subtotal accuracy**: For any Invoice I, I.subtotal SHALL equal the sum of all Invoice_Line_Item amounts on I.
- **Total accuracy**: For any Invoice I with tax rate T, I.total SHALL equal I.subtotal × (1 + T).
- **Misc charge inclusion**: For any Invoice I with Misc_Charge M added, I.subtotal SHALL include M.amount.

---

### Requirement BIL-3: Invoice Finalization

**User Story:** As a Staff member with billing edit permission, I want to finalize an invoice so that it is locked and ready for the patient.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to finalize a Draft Invoice, transitioning its status to Finalized.
2. WHEN an Invoice is finalized, THE Platform SHALL lock the Invoice and prevent further edits to line items, Misc_Charges, and tax.
3. IF a Staff member attempts to edit a Finalized Invoice, THEN THE Platform SHALL reject the edit and return a descriptive error.
4. WHEN an Invoice is finalized, THE Platform SHALL record the finalization in the Audit_Log.

#### Correctness Properties

- **Finalization immutability**: After an Invoice I is finalized, I.line_items, I.misc_charges, I.subtotal, I.tax, and I.total SHALL remain unchanged.
- **Status transition**: The only valid Invoice status transition is Draft → Finalized.

---

### Requirement BIL-4: Invoice Contents

**User Story:** As a patient, I want to receive a detailed invoice so that I understand exactly what I am being charged for.

#### Acceptance Criteria

1. THE Invoice SHALL include the following sections: patient details (name, contact), clinic details (name, address, contact), invoice date, itemized Services, itemized Products, itemized Misc_Charges, Subtotal, Tax (amount and rate), and Total.
2. THE Platform SHALL display the currency for all monetary amounts on the Invoice.
3. THE Platform SHALL include the Invoice number as a unique identifier on each Invoice.
4. THE Platform SHALL generate Invoice numbers sequentially per Clinic.

#### Correctness Properties

- **Invoice number uniqueness**: For any two Invoices I1 and I2 within the same Clinic, I1.invoice_number ≠ I2.invoice_number.
- **Currency consistency**: For any Invoice I, all monetary amounts on I SHALL be expressed in the same currency.

---

### Requirement BIL-5: Invoice Export

**User Story:** As a Staff member, I want to export invoices as PDFs so that I can share them with patients and store them for accounting purposes.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to download any Invoice as a PDF.
2. THE PDF Invoice SHALL include all sections defined in BIL-4.
3. THE Platform SHALL generate the Invoice PDF on the server and return a download link to the application.
4. THE Platform SHALL NOT process payments within the platform — the Invoice amount is tracked for analytics purposes only.

#### Correctness Properties

- **PDF completeness**: For any Invoice I exported as PDF, the PDF SHALL contain all sections defined in BIL-4 with non-empty values for mandatory fields.
- **No payment processing**: The platform SHALL NOT store any payment transaction records, card details, or bank account information.

---

### Requirement BIL-6: Billing Analytics

**User Story:** As a Clinic Admin, I want to view billing totals across sessions so that I can track clinic revenue over time.

#### Acceptance Criteria

1. THE Platform SHALL track Invoice totals per Clinic for analytics purposes.
2. THE Platform SHALL allow Clinic Admins to view aggregated billing totals filtered by date range.
3. THE Platform SHALL NOT process, collect, or reconcile actual payments — analytics are based on Invoice totals only.
4. WHEN an Invoice is finalized, THE Platform SHALL include its Total in the Clinic's billing analytics.

#### Correctness Properties

- **Analytics accuracy**: For any date range [D1, D2], the aggregated billing total displayed SHALL equal the sum of Total values for all Finalized Invoices with invoice_date in [D1, D2] for that Clinic.
- **No payment data**: The billing analytics SHALL NOT include any actual payment received data, only Invoice totals.
