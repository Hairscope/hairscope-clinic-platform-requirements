# Module 8: Billing — Frontend Tasks

> Implementation tasks for the Billing module frontend (invoices, line items, discounts, refunds, PDF export, analytics).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/billing`

### Task 1: Billing Service
- 1.1 Create `src/services/billing.service.ts`
- 1.2 Add INVOICES_LIST query (pagination, filters by status/date range)
- 1.3 Add GET_INVOICE query (single by ID, full detail)
- 1.4 Add CREATE_STANDALONE_INVOICE mutation
- 1.5 Add ADD_LINE_ITEM mutation
- 1.6 Add UPDATE_LINE_ITEM mutation
- 1.7 Add REMOVE_LINE_ITEM mutation
- 1.8 Add ADD_MISC_CHARGE mutation
- 1.9 Add REMOVE_MISC_CHARGE mutation
- 1.10 Add ADD_DISCOUNT mutation
- 1.11 Add REMOVE_DISCOUNT mutation
- 1.12 Add ISSUE_INVOICE, MARK_PAID (records amount + free-text method label `CASH`/`CARD`/`BANK_TRANSFER`/`OTHER`, no card/bank details), and CANCEL_INVOICE mutations
- 1.13 Add RECORD_REFUND mutation
- 1.14 Add EXPORT_INVOICE_PDF mutation (returns download URL)

### Task 2: Billing Analytics Service
- 2.1 Add GET_BILLING_ANALYTICS query (date range, clinic)
- 2.2 Add GET_INVOICE_REFUND_HISTORY query

---

## Section 2: Custom Hooks

**Branch:** `feature/billing`

### Task 3: Invoice List Hook
- 3.1 Create `src/hooks/useInvoiceList.ts`
- 3.2 Apollo useQuery with INVOICES_LIST, page size 20
- 3.3 Cursor-based pagination (loadMore via fetchMore)
- 3.4 Status filter (DRAFT, ISSUED, PAID, PARTIALLY_REFUNDED, REFUNDED, CANCELLED)
- 3.5 Date range filter
- 3.6 Return `{ invoices, loading, error, hasNextPage, loadMore, setFilters, refetch }`

### Task 4: Invoice Detail Hook
- 4.1 Create `src/hooks/useInvoice.ts`
- 4.2 Fetch single invoice by ID with useQuery
- 4.3 Return `{ invoice, loading, error, refetch }`

### Task 5: Billing Analytics Hook
- 5.1 Create `src/hooks/useBillingAnalytics.ts`
- 5.2 Fetch aggregated billing totals by date range
- 5.3 Return `{ analytics, loading, error, setDateRange }`

---

## Section 3: Pages

**Branch:** `feature/billing`

### Task 6: Billing List Page
- 6.1 Create `src/app/(dashboard)/billing/page.tsx`
- 6.2 Filter bar: status tabs, date range picker
- 6.3 Invoice table with columns: Invoice #, Patient, Date, Total, Status, Actions
- 6.4 Create Standalone Invoice button
- 6.5 Billing analytics summary cards (total revenue, refunds, outstanding)
- 6.6 Load More pagination button
- 6.7 Wrap in PermissionGate module="billing" action="view"

### Task 7: Invoice Detail Page
- 7.1 Create `src/app/(dashboard)/billing/[invoiceId]/page.tsx`
- 7.2 Invoice header: number, patient, date, status badge
- 7.3 Line items table (auto-generated + manual)
- 7.4 Misc charges section
- 7.5 Discounts section
- 7.6 Totals breakdown: Subtotal, Discount, Taxable, Tax, Total
- 7.7 Actions: Add Line Item, Add Misc Charge, Add Discount (DRAFT only)
- 7.8 Issue button (DRAFT → ISSUED); Mark Paid (ISSUED → PAID, capture method label); Cancel (DRAFT/ISSUED → CANCELLED, then regenerate)
- 7.9 Export PDF button
- 7.10 Record Refund button (ISSUED/PAID only)
- 7.11 Refund history section

---

## Section 4: Module Components

**Branch:** `feature/billing`

### Task 8: Invoice Table
- 8.1 Create `src/components/modules/billing/InvoiceTable.tsx`
- 8.2 @tanstack/react-table: Invoice #, Patient, Date, Total (formatted with currency), Status, Actions
- 8.3 Status badges: DRAFT=warning, ISSUED=info, PAID=success, PARTIALLY_REFUNDED=orange, REFUNDED=danger, CANCELLED=muted
- 8.4 Row click navigates to invoice detail page

### Task 9: Add Line Item Modal
- 9.1 Create `src/components/modules/billing/AddLineItemModal.tsx`
- 9.2 react-hook-form + zod: name required, quantity > 0, unitPrice required
- 9.3 Total auto-calculated (`quantity` x `unitPrice`)
- 9.4 Optional: select from catalog items (auto-fills name and price)
- 9.5 Call ADD_LINE_ITEM mutation

### Task 10: Add Misc Charge Modal
- 10.1 Create `src/components/modules/billing/AddMiscChargeModal.tsx`
- 10.2 react-hook-form + zod: description required, amount required
- 10.3 Call ADD_MISC_CHARGE mutation

### Task 11: Add Discount Modal
- 11.1 Create `src/components/modules/billing/AddDiscountModal.tsx`
- 11.2 react-hook-form + zod: description required
- 11.3 Toggle: fixed amount OR percentage (not both)
- 11.4 Percentage validation: max 100
- 11.5 Call ADD_DISCOUNT mutation

### Task 12: Issue / Pay / Cancel Invoice Dialogs
- 12.1 Create `src/components/modules/billing/IssueInvoiceDialog.tsx` (and Mark-Paid + Cancel dialogs)
- 12.2 Issue: confirmation that the invoice will be locked
- 12.3 Mark Paid: capture free-text payment method label (no card/bank details); Cancel: reason + note that a new invoice should be generated
- 12.4 Call ISSUE_INVOICE / MARK_PAID / CANCEL_INVOICE mutations
- 12.5 On success: refetch invoice, show success toast

### Task 13: Record Refund Modal
- 13.1 Create `src/components/modules/billing/RecordRefundModal.tsx`
- 13.2 react-hook-form + zod: amount required, reason required, refundDate required
- 13.3 Full refund toggle (auto-fills amount with invoice total)
- 13.4 Remaining refundable amount display
- 13.5 Error handling: REFUND_EXCEEDS_TOTAL; enabled only for ISSUED/PAID invoices
- 13.6 Call RECORD_REFUND mutation

### Task 14: Invoice Totals Breakdown
- 14.1 Create `src/components/modules/billing/InvoiceTotals.tsx`
- 14.2 Display: Subtotal, Discount Amount, Taxable Amount, Tax (rate + amount), Total
- 14.3 Currency formatting based on clinic currency
- 14.4 Refunded amount display (if applicable)

### Task 15: Billing Analytics Cards
- 15.1 Create `src/components/modules/billing/BillingAnalyticsCards.tsx`
- 15.2 Total revenue card (sum of issued/paid invoices)
- 15.3 Total refunds card
- 15.4 Net revenue card
- 15.5 Date range selector for analytics period

---

## Section 5: Integration

**Branch:** `feature/billing`

### Task 16: Sidebar Navigation
- 16.1 Add Billing link to sidebar (/billing)
- 16.2 Wrap in PermissionGate module="billing" action="view"
- 16.3 Use Receipt icon for Billing

### Task 17: Cross-Module Links
- 17.1 Link from session detail to linked invoice
- 17.2 Link from invoice to linked session/patient
- 17.3 Invoice auto-sync indicator on session recommendations panel
