# Reassign a Lead to Another Staff

> Transfer responsibility for a lead from one staff member to another within the same clinic.

## Prerequisites

- **ClinicAdmin** role, or staff with reassignment permission
- The lead must belong to your clinic

## Steps

1. Navigate to the **lead profile** page for the lead you want to reassign.
2. Click **Reassign** to open the reassignment dialog.
3. Select the **new staff member** from the list. The recipient must be:
   - Active (not deactivated)
   - In the same clinic as the lead
4. Confirm the reassignment.

## Notes

- **Regular staff** can only reassign leads that are in `NEW` or `LOST` status. Leads in `CONTACTED`, `QUALIFIED`, or `CONVERTED` status cannot be reassigned by regular staff.
- **ClinicAdmins** can reassign leads in any status, including `CONTACTED`, `QUALIFIED`, and `CONVERTED`.
- The reassignment is recorded in the AuditLog with the previous and new assignee.
- Attribution fields (`createdBy`) remain unchanged — only the `assignedTo` responsibility field is updated.
