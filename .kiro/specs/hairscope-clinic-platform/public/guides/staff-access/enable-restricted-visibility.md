# Enable Restricted Visibility Mode

> Restrict staff to only see records assigned to them (HIPAA minimum-necessary compliance).

## Prerequisites
- ClinicAdmin or OrganizationAdmin role

## Understanding Visibility Modes

| Mode | Behaviour |
|------|-----------|
| OPEN (default) | All staff with module permission see all records in their clinic |
| RESTRICTED | Staff only see records assigned to them. ClinicAdmins always see all records. |

## Steps (Clinic Level)

1. Navigate to Clinic Settings → Privacy & Compliance.
2. Set **Record Visibility Mode** to `RESTRICTED`.
3. Save.
4. Staff will now only see patients, leads, and appointments assigned to them.

## Steps (Organization Level)

1. Navigate to Organization Settings → Privacy & Compliance.
2. Set **Record Visibility Mode** to `RESTRICTED`.
3. Save.
4. All clinics in the organization are now in restricted mode — individual clinics cannot override this.

## What's Affected

- Patients (via session assignedTo or direct assignment)
- Leads (assignedTo)
- Appointments (assignedTo)

## What's NOT Affected

- Catalog items and Treatment Kits (always visible to all staff with catalog permission)
- Invoices (follow session visibility)

## Important Notes
- ClinicAdmins always see all records regardless of mode.
- Organization-level RESTRICTED overrides any clinic-level OPEN setting.
- Changing the mode does not modify any record assignments — it only changes query filtering.
