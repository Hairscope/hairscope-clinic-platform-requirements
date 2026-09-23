# Configure Webhook Lead Ingestion

> Set up external marketing campaign webhooks to automatically capture leads in the platform without manual data entry.

## Prerequisites

- **OrganizationAdmin** role
- Access to Organization Settings

## Steps

1. Navigate to **Organization Settings → Webhooks**.
2. Click **Add Webhook Source** to create a new webhook configuration.
3. Configure the unique **endpoint URL** that the external campaign system will POST to.
4. Set up the **FieldMapping** — map each incoming webhook payload field to the corresponding lead profile field:
   - Map required fields (e.g., `name`, `email`, `phone`)
   - Optionally map `clinicId` to route leads to a specific clinic
   - Map `sourceDetail` to capture the campaign ID
5. Click **Save** to activate the webhook source.
6. Test the integration by sending a **sample payload** to the configured endpoint URL and verifying a lead is created in the platform.

## Notes

- Each webhook source has a unique endpoint URL and its own field mapping configuration.
- If a webhook payload is missing a required mapped field, the platform rejects the payload and logs the failure in the AuditLog.
- In `AUTO_ASSIGN` mode: leads with a valid `clinicId` in the payload are auto-assigned to that clinic. Leads without a `clinicId` become Unassigned Leads.
- In `MANUAL_ASSIGN` mode: all webhook leads are created as Unassigned Leads pending OrganizationAdmin confirmation, regardless of `clinicId` in the payload.
- Only OrganizationAdmins can create, edit, or delete webhook sources — ClinicAdmins and other staff cannot access this configuration.
