# Configure Allowed Domains

> Restrict which websites can embed your organization's web components by managing the allowed domains list.

## Prerequisites

- **OrganizationAdmin** role
- Access to Organization Settings

## Steps

1. Navigate to **Organization Settings → Web Components → Allowed Domains**.
2. Click **Add Domain** to add a new allowed domain.
3. Enter your website's domain (e.g., `www.myclinic.com`, `booking.myclinic.com`).
4. Click **Save** to update the allowed domains list.
5. Repeat for any additional domains where you want to embed the components.

## Notes

- Web components (Selfie Analysis and Appointment Booking) will show **"Access Denied"** on any domain not in the allowed list.
- Add all domains where you plan to embed components, including staging/development domains if needed.
- Domain changes take effect immediately for new page loads.
- Only **OrganizationAdmins** can manage the allowed domains list.
- The same allowed domains list applies to both the Selfie Analysis and Appointment Booking components.
- Configuration changes are recorded in the AuditLog.
