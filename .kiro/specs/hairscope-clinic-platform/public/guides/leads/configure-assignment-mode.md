# Configure Lead Assignment Mode

> Control whether incoming leads are automatically assigned to clinics or require OrganizationAdmin review before assignment.

## Prerequisites

- **OrganizationAdmin** role
- Access to Organization Settings

## Steps

1. Navigate to **Organization Settings → Lead Management**.
2. Locate the **Lead Assignment Mode** setting.
3. Select the desired mode:
   - **AUTO_ASSIGN** (default): Leads are automatically assigned to the clinic determined by their source (selfie analysis selection, webhook field mapping, or OrganizationAdmin's explicit choice). LeadDistributionAlgorithm assigns staff immediately.
   - **MANUAL_ASSIGN**: All incoming leads from API sources (webhook, selfie analysis) and OrganizationAdmin manual entries are created as Unassigned. The OrganizationAdmin must review and confirm the clinic assignment before staff distribution occurs.
4. Click **Save** to apply the new mode.

## Notes

- Changes apply to **future leads only** — existing leads are not retroactively reassigned.
- Leads created manually by **clinic-level staff** are always assigned to their current clinic regardless of the assignment mode setting.
- In `MANUAL_ASSIGN` mode, the suggested clinic (from the lead source) is pre-filled but editable by the OrganizationAdmin.
- The mode change is recorded in the AuditLog.
