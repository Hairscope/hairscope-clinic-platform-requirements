# Record a Refund

> Record a full or partial refund against a finalized invoice for record-keeping and analytics purposes.

## Prerequisites

- Staff account with billing edit permission
- The invoice must be in **FINALIZED** status (or **PARTIALLY_REFUNDED** for additional partial refunds)

## Steps

1. Open the **finalized invoice** from the Billing section.
2. Click **Record Refund** to open the refund form.
3. Enter the required fields:
   - **Amount** — the refund amount (full invoice total or a partial amount)
   - **Reason** — explanation for the refund
   - **Refund Date** — the date the refund was processed
4. Click **Save** to record the refund.

## Notes

- **Full refund**: If the refund amount equals the invoice total, the status changes to `REFUNDED`.
- **Partial refund**: If the refund amount is less than the total, the status changes to `PARTIALLY_REFUNDED`.
- **Multiple partial refunds** are allowed on the same invoice, as long as the cumulative refunded amount does not exceed the invoice total.
- The platform **does not process actual payments** — refunds are tracked for record-keeping and analytics only.
- Refunded amounts are **deducted from revenue totals** in billing analytics.
- An `InvoiceRefunded` event is emitted and the refund is recorded in the AuditLog.
- You can view the full refund history for any invoice.
