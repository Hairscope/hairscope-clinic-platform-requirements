# Create a Lead Manually

> Capture a prospective patient from phone calls, walk-ins, or other offline channels by manually entering their information into the platform.

## Prerequisites

- Staff account with lead create permission
- Access to the Leads module

## Steps

1. Navigate to **Leads** from the main navigation menu.
2. Click **Create** (or **Add Lead**) to open the new lead form.
3. Enter at least a `firstName` or `lastName` — all other fields (age, gender, email, phone, priority, tags) are optional.
4. If you are an **OrganizationAdmin**, select the target **Clinic** from the clinic selector. If no clinic is selected, the lead will be created as an Unassigned Lead.
5. Click **Save** to create the lead.

The lead is created with status **NEW** and is automatically assigned to a staff member within the selected clinic via the **LeadDistributionAlgorithm** (round-robin across eligible staff).

## Notes

- Clinic-level staff do not see a clinic selector — the lead is automatically assigned to their current clinic.
- In `MANUAL_ASSIGN` mode, OrganizationAdmins must explicitly confirm the clinic assignment; any pre-filled value is a suggestion only.
- Duplicate leads are allowed — the same email or phone may exist across multiple lead records.
- The `leadSource` is automatically set to `MANUAL`.
