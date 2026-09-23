# Configure Notification Branding

> Customize the visual identity and sender information for all outgoing notifications from your organization.

## Prerequisites

- **OrganizationAdmin** role
- Access to Organization Settings

## Steps

1. Navigate to **Organization Settings → Communication → Branding**.
2. Configure the following branding elements:
   - **Sender Name** — the name that appears as the notification sender
   - **Reply-To Email** — the email address recipients can reply to
   - **Logo URL** — your organization's logo for email headers
   - **Primary Color** — brand color used in email templates
   - **Footer Text** — text displayed at the bottom of email notifications
3. Click **Save** to apply the branding.

## Notes

- **Default branding** (Hairscope platform branding) is used until custom branding is configured.
- **ClinicAdmins** can override `senderName` and `replyToEmail` at the clinic level for notifications sent on behalf of their clinic.
- Clinic-level branding overrides take precedence over Organization-level branding for notifications originating from that clinic.
- Branding changes apply to **all future notifications** — previously sent notifications are not affected.
- The Notification Engine applies branding when rendering templates.
