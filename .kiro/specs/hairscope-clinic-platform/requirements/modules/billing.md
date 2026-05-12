# Billing

> Covers: Invoice generation, miscellaneous charges, discounts, refunds, invoice finalization, PDF export, and billing analytics.
> Events emitted: `InvoiceGenerated`, `InvoiceFinalized`, `InvoiceRefunded`
> Events consumed: `SessionCompleted` (triggers invoice generation)

---

## Glossary

- **Invoice**: A PDF billing document auto-generated per completed Session, itemizing services, catalog items, miscellaneous charges, and discounts.
- **MiscCharge**: An additional charge added by Staff to an Invoice that is not associated with a predefined Service or catalog item.
- **Discount**: A reduction applied to an Invoice, either as a fixed amount or a percentage of the Subtotal.
- **Refund**: A full or partial reversal of a Finalized Invoice amount. Tracked for analytics; no payment processing occurs within the platform.
- **InvoiceStatus**: `DRAFT` | `FINALIZED` | `REFUNDED` | `PARTIALLY_REFUNDED` - see `shared/enums.md`.
- **Subtotal**: The sum of all itemized charges on an Invoice before discount and tax.
- **DiscountAmount**: The total discount applied to the Invoice, calculated from all Discount entries.
- **TaxableAmount**: `Subtotal - DiscountAmount`.
- **Tax**: A configurable tax rate (percentage) applied to the TaxableAmount.
- **Total**: The final amount on an Invoice = `(Subtotal - DiscountAmount) × (1 + Tax)`.
- **RefundAmount**: The amount refunded on a Finalized Invoice. May be partial or full.
- **InvoiceLineItem**: A single row on an Invoice representing a Service, Product, MiscCharge, or Discount with its associated amount.

---

## Requirements

### BIL-1: Automatic Invoice Generation

**User Story:** As a Staff member, I want an invoice to be automatically generated when a session is completed so that billing is initiated without manual effort.

#### Acceptance Criteria

1. WHEN a `SessionCompleted` event is received for a Session, THE Platform SHALL automatically generate a Draft Invoice for that Session.
2. IF the Session has a linked `appointmentId`, THE Draft Invoice SHALL automatically include the appointment's SERVICE catalog item as a line item.
3. THE Draft Invoice SHALL include line items for all catalog items recommended in the Session with their prices.
4. IF the Session has no linked appointment, THE Draft Invoice SHALL contain only the recommended catalog items (no service line item unless manually added by Staff).
5. THE Platform SHALL allow Staff with billing edit permission to manually add SERVICE catalog items to a Draft Invoice (e.g., services provided during the session that were not pre-booked).
6. WHILE the Invoice is in `DRAFT` status, THE Platform SHALL auto-sync line items with session recommendations: if recommendations are added, edited, or removed (including strike-through edits on Treatment Plan/Prescription), the corresponding auto-generated line items on the Invoice SHALL update automatically. Manual line items added by Staff are never auto-removed.
7. WHEN a Treatment Kit is recommended in a session, THE Invoice SHALL display it as a single line item with the kit's bundle price. The kit description MAY include the names of individual items within the kit.
8. THE Platform SHALL set the initial status to `DRAFT`.
8. WHEN an Invoice is generated, THE Platform SHALL emit `InvoiceGenerated` and record the generation in the AuditLog.
9. Each Invoice is associated with exactly one Session and one Patient.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Session not found | `SESSION_NOT_FOUND` |
| Invoice already exists for Session | `VALIDATION_ERROR` |

#### Correctness Properties

- For any Session S that transitions to `COMPLETED`: exactly one Invoice SHALL be generated for S.
- Zero-item and zero-total invoices are valid — staff may add line items later.
- For any Invoice I generated for Session S with a linked appointment: I SHALL contain a line item for the appointment's SERVICE catalog item.
- For any Invoice I generated for Session S without a linked appointment: I SHALL contain line items for recommended catalog items only (staff may add services manually).
- For any newly generated Invoice I: `I.status = DRAFT` immediately after generation.
- Invoices are only generated on `SessionCompleted`. NO_SHOW and CANCELLED appointments do NOT trigger invoice generation.

---

### BIL-2: Invoice Review, Manual Line Items, Miscellaneous Charges, and Discounts

**User Story:** As a Staff member with billing edit permission, I want to review, add manual line items, add miscellaneous charges, and apply discounts to an invoice before finalizing it so that all costs and adjustments are accurately captured.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to add manual line items to a `DRAFT` Invoice.
2. WHEN a manual line item is added, THE Platform SHALL require: `name`, `quantity`, `unitPrice`. Total for the line item is calculated as `quantity × unitPrice`.
3. THE Platform SHALL allow Staff to edit or remove manual line items from a `DRAFT` Invoice.
4. THE Platform SHALL allow Staff with billing edit permission to add MiscCharges to a `DRAFT` Invoice.
5. WHEN a MiscCharge is added, `description` and `amount` are required.
6. THE Platform SHALL allow Staff to edit or remove MiscCharges from a `DRAFT` Invoice.
7. THE Platform SHALL allow Staff with billing edit permission to add one or more Discounts to a `DRAFT` Invoice.
8. WHEN a Discount is added, THE Platform SHALL require a `description` and either a `fixedAmount` or a `percentage` (not both).
9. THE Platform SHALL allow Staff to edit or remove Discounts from a `DRAFT` Invoice.
10. WHEN line items, MiscCharges, or Discounts are added, edited, or removed, THE Platform SHALL recalculate `subtotal`, `discountAmount`, `taxableAmount`, `tax`, and `total`.
11. THE Platform SHALL allow Staff to configure a tax rate per Clinic, applied to the TaxableAmount when calculating the Total.
12. WHEN any line item, MiscCharge, or Discount is added, edited, or removed, THE Platform SHALL record the change in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` on manual line item | `VALIDATION_ERROR` (field: `name`) |
| Missing `quantity` on manual line item | `VALIDATION_ERROR` (field: `quantity`) |
| `quantity` ≤ 0 on manual line item | `VALIDATION_ERROR` (field: `quantity`) |
| Missing `unitPrice` on manual line item | `VALIDATION_ERROR` (field: `unitPrice`) |
| Missing `description` on MiscCharge or Discount | `VALIDATION_ERROR` (field: `description`) |
| Missing `amount` on MiscCharge | `VALIDATION_ERROR` (field: `amount`) |
| Both `fixedAmount` and `percentage` provided on Discount | `VALIDATION_ERROR` |
| Discount `percentage` > 100 | `VALIDATION_ERROR` (field: `percentage`) |
| Editing a FINALIZED Invoice | `INVOICE_ALREADY_FINALIZED` |
| Invoice not found | `INVOICE_NOT_FOUND` |

#### Correctness Properties

- For any Invoice I: `I.subtotal = sum(all auto-generated line items) + sum(all manual line items where each = quantity × unitPrice) + sum(all MiscCharge amounts)`.
- For any Invoice I: `I.discountAmount = sum(all Discount amounts on I)`.
- For any Invoice I: `I.taxableAmount = I.subtotal - I.discountAmount`.
- For any Invoice I with tax rate T: `I.total = I.taxableAmount × (1 + T)`.
- `I.total` SHALL NOT be negative - if discounts exceed the subtotal, total is clamped to 0.

---

### BIL-3: Invoice Finalization

**User Story:** As a Staff member with billing edit permission, I want to finalize an invoice so that it is locked and ready for the patient.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to finalize a `DRAFT` Invoice, transitioning its status to `FINALIZED`.
2. WHEN an Invoice is finalized, THE Platform SHALL lock the Invoice and prevent further edits to line items, MiscCharges, and tax.
3. IF a Staff member attempts to edit a `FINALIZED` Invoice, THE Platform SHALL reject the edit.
4. WHEN an Invoice is finalized, THE Platform SHALL emit `InvoiceFinalized` and record the finalization in the AuditLog.

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

1. THE Invoice SHALL include: patient details (name, contact), clinic details (name, address, contact), invoice date, itemized Services, itemized catalog items (medications, cosmetics, supplements), itemized MiscCharges, itemized Discounts (description and amount), Subtotal, Discount Amount, Taxable Amount, Tax (amount and rate), and Total.
2. THE Platform SHALL display the currency for all monetary amounts on the Invoice.
3. THE Platform SHALL include a unique Invoice number on each Invoice.
4. THE Platform SHALL generate Invoice numbers sequentially per Clinic (GI-22).

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
4. THE Platform SHALL NOT process payments within the platform - the Invoice amount is tracked for analytics purposes only.

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

**User Story:** As a ClinicAdmin, I want to view billing totals across sessions so that I can track clinic revenue over time.

#### Acceptance Criteria

1. THE Platform SHALL track Invoice totals per Clinic for analytics purposes.
2. THE Platform SHALL allow ClinicAdmins to view aggregated billing totals filtered by date range.
3. THE Platform SHALL NOT process, collect, or reconcile actual payments - analytics are based on Invoice totals only.
4. WHEN an `InvoiceFinalized` event is received, THE Platform SHALL include its Total in the Clinic's billing analytics.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Date range invalid | `VALIDATION_ERROR` |

#### Correctness Properties

- For any date range [D1, D2]: the aggregated billing total displayed SHALL equal the sum of Total values for all `FINALIZED` Invoices with `invoiceDate` in [D1, D2] for that Clinic.
- The billing analytics SHALL NOT include any actual payment received data, only Invoice totals.

---

### BIL-7: Refunds

**User Story:** As a Staff member with billing edit permission, I want to record refunds against finalized invoices so that the clinic's billing records accurately reflect money returned to patients.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff with billing edit permission to record a Refund against a `FINALIZED` Invoice.
2. A Refund may be full (entire Total) or partial (any amount up to the Total).
3. WHEN a Refund is recorded, THE Platform SHALL require: `amount`, `reason`, and `refundDate`.
4. WHEN a full Refund is recorded, THE Platform SHALL set the Invoice status to `REFUNDED`.
5. WHEN a partial Refund is recorded, THE Platform SHALL set the Invoice status to `PARTIALLY_REFUNDED` and store the `refundedAmount` on the Invoice.
6. THE Platform SHALL NOT process actual payment refunds - refunds are tracked for record-keeping and analytics only.
7. Multiple partial refunds may be recorded against the same Invoice, provided the cumulative refunded amount does not exceed the Invoice Total.
8. WHEN a Refund is recorded, THE Platform SHALL emit `InvoiceRefunded` and record the action in the AuditLog including actor, amount, reason, and date.
9. THE Platform SHALL allow Staff to view the full refund history for any Invoice.
10. Refunded amounts SHALL be reflected in billing analytics (deducted from revenue totals).

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Refund amount exceeds Invoice Total | `REFUND_EXCEEDS_TOTAL` |
| Cumulative refunds exceed Invoice Total | `REFUND_EXCEEDS_TOTAL` |
| Refunding a non-FINALIZED Invoice | `INVOICE_NOT_REFUNDABLE` |
| Missing `amount`, `reason`, or `refundDate` | `VALIDATION_ERROR` |
| Invoice not found | `INVOICE_NOT_FOUND` |

#### Correctness Properties

- For any Invoice I: `sum(all Refund amounts on I) ≤ I.total`.
- After a full refund: `I.status = REFUNDED` and `I.refundedAmount = I.total`.
- After a partial refund: `I.status = PARTIALLY_REFUNDED` and `I.refundedAmount = sum(all partial refund amounts)`.
- Refunded amounts SHALL be subtracted from the Clinic's billing analytics totals for the relevant date range.
- The platform SHALL NOT store any payment transaction records, card details, or bank account information related to refunds.


---

## Import / Export

> **Status: Deferred** — Import and Export functionality for this module will be available in later versions. See `requirements.md` Section 10.3 for the platform-wide import/export rules. This module will support bulk import and export via CSV and Excel formats.
