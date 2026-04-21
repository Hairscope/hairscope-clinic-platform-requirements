# Billing

> Covers: Invoice generation, miscellaneous charges, invoice finalization, PDF export, and billing analytics.
> Events emitted: `InvoiceGenerated`, `InvoiceFinalized`
> Events consumed: `AppointmentCompleted` (triggers invoice generation)

---

## Glossary

- **Invoice**: A PDF billing document auto-generated per completed Session, itemizing services, products, and miscellaneous charges.
- **Misc_Charge**: An additional charge added by Staff to an Invoice that is not associated with a predefined Service or Product.
- **Invoice_Status**: `DRAFT` | `FINALIZED` — see `shared/enums.md`.
- **Subtotal**: The sum of all itemized charges on an Invoice before tax.
- **Tax**: A configurable tax rate (percentage) applied to the Subtotal.
- **Total**: The final amount on an Invoice = `Subtotal × (1 + Tax)`.
- **Invoice_Line_Item**: A single row on an Invoice representing a Service, Product, or Misc_Charge with its associated amount.

---

## Requirements

### BIL-1: Automatic Invoice Generation

**User Story:** As a Staff member, I want an invoice to be automatically generated when a session is completed so that billing is initiated without manual effort.

#### Acceptance Criteria

1. WHEN an `AppointmentCompleted` event is received with an associated Session, THE Platform SHALL automatically generate a Draft Invoice for that Session.
2. THE Draft Invoice SHALL include line items for: the Service associated with the Session's Appointment (if applicable), all Products recommended in the Session with their prices, and a subtotal.
3. THE Platform SHALL set the initial status to `DRAFT`.
4. WHEN an Invoice is generated, THE Platform SHALL emit `InvoiceGenerated` and record the generation in the Audit_Log.
5. Each Invoice is associated with exactly one Session and one Patient.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Session not found | `SESSION_NOT_FOUND` |
| Invoice already exists for Session | `VALIDATION_ERROR` |

#### Correctness Properties

- For any Session S that transitions to `COMPLETED`: exactly one Invoice SHALL be generated for S.
- For any Invoice I generated for Session S: I SHALL contain a line item for every Service and Product associated with S that has a non-null price.
- For any newly generated Invoice I: `I.status = DRAFT` immediately after generation.

---

### BIL-2: Invoice Review and Miscellaneous Charges

**User Story:** As a Staff member with billing edit permission, I want to review and add miscellaneous charges to an invoice before finalizing it so that all costs are accurately captured.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to add Misc_Charges to a `DRAFT` Invoice.
2. WHEN a Misc_Charge is added, `description` and `amount` are required.
3. THE Platform SHALL allow Staff to edit or remove Misc_Charges from a `DRAFT` Invoice.
4. WHEN Misc_Charges are added, edited, or removed, THE Platform SHALL recalculate `subtotal`, `tax`, and `total`.
5. THE Platform SHALL allow Staff to configure a tax rate per Clinic, applied to the Subtotal when calculating the Total.
6. WHEN a Misc_Charge is added, edited, or removed, THE Platform SHALL record the change in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `description` | `VALIDATION_ERROR` (field: `description`) |
| Missing `amount` | `VALIDATION_ERROR` (field: `amount`) |
| Editing a FINALIZED Invoice | `INVOICE_ALREADY_FINALIZED` |
| Invoice not found | `INVOICE_NOT_FOUND` |

#### Correctness Properties

- For any Invoice I: `I.subtotal = sum(all line item amounts on I)`.
- For any Invoice I with tax rate T: `I.total = I.subtotal × (1 + T)`.
- For any Invoice I with Misc_Charge M added: `I.subtotal` SHALL include `M.amount`.

---

### BIL-3: Invoice Finalization

**User Story:** As a Staff member with billing edit permission, I want to finalize an invoice so that it is locked and ready for the patient.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to finalize a `DRAFT` Invoice, transitioning its status to `FINALIZED`.
2. WHEN an Invoice is finalized, THE Platform SHALL lock the Invoice and prevent further edits to line items, Misc_Charges, and tax.
3. IF a Staff member attempts to edit a `FINALIZED` Invoice, THE Platform SHALL reject the edit.
4. WHEN an Invoice is finalized, THE Platform SHALL emit `InvoiceFinalized` and record the finalization in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Editing a FINALIZED Invoice | `INVOICE_ALREADY_FINALIZED` |
| Invoice not found | `INVOICE_NOT_FOUND` |

#### Correctness Properties

- After an Invoice I is finalized: `I.lineItems`, `I.miscCharges`, `I.subtotal`, `I.tax`, and `I.total` SHALL remain unchanged.
- The only valid Invoice status transition is `DRAFT → FINALIZED`.

---

### BIL-4: Invoice Contents

**User Story:** As a patient, I want to receive a detailed invoice so that I understand exactly what I am being charged for.

#### Acceptance Criteria

1. THE Invoice SHALL include: patient details (name, contact), clinic details (name, address, contact), invoice date, itemized Services, itemized Products, itemized Misc_Charges, Subtotal, Tax (amount and rate), and Total.
2. THE Platform SHALL display the currency for all monetary amounts on the Invoice.
3. THE Platform SHALL include a unique Invoice number on each Invoice.
4. THE Platform SHALL generate Invoice numbers sequentially per Clinic (GI-19).

#### Correctness Properties

- For any two Invoices I1 and I2 within the same Clinic: `I1.invoiceNumber ≠ I2.invoiceNumber`.
- For any Invoice I: all monetary amounts on I SHALL be expressed in the same currency.

---

### BIL-5: Invoice Export

**User Story:** As a Staff member, I want to export invoices as PDFs so that I can share them with patients and store them for accounting purposes.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to download any Invoice as a PDF.
2. THE PDF Invoice SHALL include all sections defined in BIL-4.
3. THE Platform SHALL generate the Invoice PDF on the server and return a download link.
4. THE Platform SHALL NOT process payments within the platform — the Invoice amount is tracked for analytics purposes only.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| PDF generation service unavailable | `SERVICE_UNAVAILABLE` |
| PDF generation fails after retries | `ASYNC_OPERATION_FAILED` |
| Invoice not found | `INVOICE_NOT_FOUND` |

#### Correctness Properties

- For any Invoice I exported as PDF: the PDF SHALL contain all sections defined in BIL-4 with non-empty values for mandatory fields.
- The platform SHALL NOT store any payment transaction records, card details, or bank account information.

---

### BIL-6: Billing Analytics

**User Story:** As a Clinic_Admin, I want to view billing totals across sessions so that I can track clinic revenue over time.

#### Acceptance Criteria

1. THE Platform SHALL track Invoice totals per Clinic for analytics purposes.
2. THE Platform SHALL allow Clinic_Admins to view aggregated billing totals filtered by date range.
3. THE Platform SHALL NOT process, collect, or reconcile actual payments — analytics are based on Invoice totals only.
4. WHEN an `InvoiceFinalized` event is received, THE Platform SHALL include its Total in the Clinic's billing analytics.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Date range invalid | `VALIDATION_ERROR` |

#### Correctness Properties

- For any date range [D1, D2]: the aggregated billing total displayed SHALL equal the sum of Total values for all `FINALIZED` Invoices with `invoiceDate` in [D1, D2] for that Clinic.
- The billing analytics SHALL NOT include any actual payment received data, only Invoice totals.
