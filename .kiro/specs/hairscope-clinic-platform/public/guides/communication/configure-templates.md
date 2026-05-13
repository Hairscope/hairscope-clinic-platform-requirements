# Configure Notification Templates

> Customize the messaging content for all notification types sent by the platform to ensure consistent branding and communication.

## Prerequisites

- **OrganizationAdmin** role
- Access to Organization Settings

## Steps

1. Navigate to **Organization Settings → Communication → Templates**.
2. Select the **notification type** you want to customize (e.g., appointment reminder, session report, booking confirmation).
3. Select the **channel** (email, WhatsApp, SMS, push).
4. Edit the **template body** using `{{placeholder}}` syntax for dynamic content (e.g., `{{patientName}}`, `{{appointmentDate}}`, `{{clinicName}}`).
5. For email templates, also configure the **subject line**.
6. Click **Save** to publish the updated template.

## Notes

- Templates are **versioned** — previous versions are retained for audit purposes.
- **Default templates** are provided for all platform-defined notification types until you customize them.
- Available placeholders are defined per notification type — the platform validates that all required placeholders are present before saving.
- Templates support all platform-supported **locales**: EN, ES, IT, NL, FR, RU, AR, DE.
- Only OrganizationAdmins can edit Organization-level templates. Clinic-level staff cannot modify templates.
- All template changes are recorded in the AuditLog.
