# Export Invoices

> Export your clinic's invoice records in CSV or Excel format for accounting or external reporting.

## Prerequisites

- **ClinicAdmin** role, or staff with `import_export` permission
- Access to the Billing module

## Steps

1. Navigate to **Billing** from the main navigation menu.
2. Click **Export** to open the export dialog.
3. Select the **format**:
   - **CSV** — comma-separated values
   - **Excel** — .xlsx spreadsheet
4. Optionally filter by **date range** to export only invoices within a specific period.
5. Click **Submit** to queue the export.
6. The export runs in the **background** — you will receive a notification when it's ready.
7. Download the exported file from the notification or export history. The download link is available for **7 days**.

## Notes

- ⚠️ **Deferred feature** — this functionality will be available in a later version.
- The export is processed asynchronously to avoid blocking the UI for large datasets.
- The download link expires after 7 days.
- Export includes all invoice records accessible to the requesting user (scoped to their clinic).
