# Finalize an Invoice

> Lock an invoice to prevent further edits and mark it as ready for the patient.

## Prerequisites

- Staff account with billing edit permission
- The invoice must be in **DRAFT** status

## Steps

1. Open the **draft invoice** from the Billing section.
2. Review all **line items**, **miscellaneous charges**, **discounts**, and **tax** to ensure accuracy.
3. Click **Finalize** to lock the invoice.
4. Confirm the finalization when prompted.

## Notes

- Once finalized, the invoice is **permanently locked** — no further edits can be made to line items, charges, discounts, or tax.
- The invoice status changes from `DRAFT` to **FINALIZED**.
- You can no longer add, remove, or modify any items on a finalized invoice.
- An `InvoiceFinalized` event is emitted and the finalization is recorded in the AuditLog.
- The only valid status transition is `DRAFT → FINALIZED`.
- After finalization, the invoice total is included in the clinic's billing analytics.
- To correct a finalized invoice, you would need to record a refund (full or partial) rather than editing the invoice.
