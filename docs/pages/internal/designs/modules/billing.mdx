# Module: Billing

> Covers: Invoice aggregate, invoice lifecycle, automatic generation, line item management, auto-sync with recommendations, manual entries, discounts, tax, finalization, refunds, and cross-module relationships.

---

# 1. Purpose

The Billing module represents the financial record-keeping
boundary of the platform.

It generates, manages, and finalizes invoices for clinical sessions
and product sales.

The Billing module owns:

- invoice generation
- invoice lifecycle state
- line item management
- discount and tax calculation
- refund tracking
- billing analytics

The platform does NOT process payments.

Invoices represent billing records, not financial settlement.

---

# 2. Responsibilities

The Billing module SHALL:

- generate invoices from session completion events
- support standalone invoices (product-only sales)
- auto-sync invoice line items with session recommendations
- support manual line item entry
- manage miscellaneous charges and discounts
- calculate subtotal, tax, and total
- enforce invoice finalization rules
- track refunds
- emit domain events for analytics
- provide billing analytics queries

The Billing module SHALL NOT:

- process payments
- collect payment information
- manage patient records
- manage session lifecycle
- manage catalog items
- deliver notifications

---

# 3. Aggregate

## 3.1 Invoice (Aggregate Root)

The Invoice aggregate represents a billing document.

An Invoice belongs to exactly one Clinic.

An Invoice belongs to exactly one Patient.

An Invoice MAY reference a Session (session-linked invoice)
OR exist independently (standalone invoice for product-only sales).

The Invoice aggregate is the authoritative source of:

- invoice line items
- invoice calculations
- invoice lifecycle state
- refund history

---

# 4. Entities

The Invoice aggregate SHALL contain:

- Invoice
- InvoiceLineItem (auto-generated or manual)
- MiscCharge
- Discount
- Refund

---

# 5. Value Objects

The Billing module MAY use value objects, including:

- InvoiceStatus
- InvoiceNumber (sequential per Clinic)
- LineItemType (AUTO, MANUAL)
- DiscountType (FIXED, PERCENTAGE)
- RefundType (FULL, PARTIAL)
- MonetaryAmount

---

# 6. Invariants

The system SHALL ensure:

- An Invoice belongs to exactly one Clinic
- An Invoice belongs to exactly one Patient
- Invoice numbers are sequential per Clinic and never reused
- A FINALIZED Invoice is immutable (no line item changes)
- Total SHALL NOT be negative (clamped to 0)
- Cumulative refunds SHALL NOT exceed Invoice total
- Only FINALIZED Invoices may receive refunds
- Auto-generated line items sync with session recommendations while DRAFT
- Manual line items are never auto-removed
- Zero-item and zero-total invoices are valid

---

# 7. Lifecycle

```text
DRAFT → FINALIZED
FINALIZED → REFUNDED
FINALIZED → PARTIALLY_REFUNDED
PARTIALLY_REFUNDED → REFUNDED
```

Rules:

- `DRAFT` → editable, line items may be added/removed/modified
- `FINALIZED` → locked, immutable, ready for patient
- `REFUNDED` → full refund recorded
- `PARTIALLY_REFUNDED` → partial refund(s) recorded, more may follow

---

# 8. Invoice Generation

Invoices are generated through two paths:

### Session-Linked Invoice

```text
SessionCompleted event
    ↓
Invoice auto-generated (DRAFT)
    ↓
Line items populated from:
  - Appointment SERVICE (if linked)
  - Session recommendations
    ↓
TreatmentPlanSigned / PrescriptionSigned events
    ↓
Invoice line items auto-updated with signed recommendations
```

### Standalone Invoice

```text
Staff creates invoice manually
    ↓
Invoice created (DRAFT) for a Patient
    ↓
Staff adds line items manually
```

---

# 9. Auto-Sync Behaviour

While an Invoice is in DRAFT status:

- Changes to session recommendations automatically update
  the corresponding auto-generated line items
- Adding a recommendation adds a line item
- Removing a recommendation removes the line item
- Editing a recommendation updates the line item
- Treatment Kit appears as a single line item with bundle price
- Manual line items are NEVER affected by auto-sync

Auto-sync stops when the Invoice is FINALIZED.

---

# 10. Calculation Model

```text
Subtotal = sum(auto line items) + sum(manual line items) + sum(MiscCharges)
DiscountAmount = sum(all Discounts)
TaxableAmount = Subtotal - DiscountAmount
Total = TaxableAmount × (1 + TaxRate)

If Total < 0, Total is clamped to 0.
```

Tax rate is configured per Clinic.

Currency is inherited from Clinic configuration.

---

# 11. Events

## 11.1 Emitted

The Billing module SHALL emit:

- `InvoiceGenerated`
- `InvoiceFinalized`
- `InvoiceRefunded`

## 11.2 Consumed

The Billing module SHALL consume:

- `SessionCompleted` → triggers invoice generation
- `TreatmentPlanSigned` → updates invoice line items
- `PrescriptionSigned` → ensures medication line items on invoice
- `TreatmentPlanRegenerated` → syncs updated recommendations
- `PrescriptionRegenerated` → syncs updated medications

---

# 12. Cross-Module Relationships

## 12.1 Sessions Module

Invoices MAY reference Sessions.

Session completion triggers invoice generation.

The Billing module does NOT own session state.

---

## 12.2 Catalog Module

Invoice line items reference CatalogItems by snapshot.

`TreatmentPlanSigned` and `PrescriptionSigned` events
provide the signed recommendations for line item population.

The Billing module does NOT own catalog state.

---

## 12.3 Patients Module

Invoices reference Patients.

The Billing module does NOT own patient state.

---

## 12.4 Appointments Module

Session-linked invoices include the appointment's SERVICE
as a line item (if the session has a linked appointment).

The Billing module does NOT own appointment state.

---

# 13. Access Control Boundary

Billing access SHALL be governed by Billing module permissions:

- `billing.view`
- `billing.create` (standalone invoices)
- `billing.edit` (line items, charges, discounts on DRAFT invoices)
- `billing.delete` (not applicable — invoices are not deletable)

OrganizationAdmins do NOT have access to the Billing module.

---

# 14. Data Ownership

The Billing module owns:

- Invoice state
- Line item state
- MiscCharge state
- Discount state
- Refund state
- Invoice number sequence

The Billing module does NOT own:

- Session state
- Patient state
- Catalog state
- Appointment state

---

# 15. Boundaries

The Billing module SHALL NOT:

- process payments
- store payment credentials
- manage session lifecycle
- manage catalog items
- manage patient records
- access another module's storage directly
- bypass tenant isolation boundaries

---
