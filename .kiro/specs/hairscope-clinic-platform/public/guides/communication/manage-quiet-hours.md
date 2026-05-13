# Manage Quiet Hours

> Configure time windows during which non-urgent notifications are held back to avoid disturbing recipients during off-hours.

## Prerequisites

- **OrganizationAdmin** role (or **ClinicAdmin** for clinic-level overrides)
- Access to Communication settings

## Steps

1. Navigate to **Communication → Quiet Hours**.
2. Set the **start time** (e.g., 22:00).
3. Set the **end time** (e.g., 08:00).
4. Select the **days of week** on which quiet hours apply.
5. Set the **timezone** for the quiet hours window.
6. Click **Save** to apply the configuration.

## Notes

- **Default quiet hours**: 22:00–08:00 local time, all days.
- Non-urgent notifications (priority `NORMAL` and `LOW`) are **held until quiet hours end**.
- **URGENT** and **HIGH** priority notifications **bypass quiet hours** and are delivered immediately.
- OrganizationAdmins set Organization-level quiet hours. ClinicAdmins can override for their specific clinic.
- Changes apply to all future notification scheduling immediately.
