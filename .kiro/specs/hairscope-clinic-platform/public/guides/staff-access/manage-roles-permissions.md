# Manage Roles and Permissions

> Create custom roles and configure what each staff member can do.

## Prerequisites
- ClinicAdmin role

## Understanding Roles

| Role Type | Editable | Deletable |
|-----------|----------|-----------|
| System roles (OrganizationAdmin, ClinicAdmin) | OrgAdmin: No. ClinicAdmin: Yes | No |
| Default roles (Doctor, Receptionist, Nurse, Sales, Marketing, Frontdesk) | Yes | Yes |
| Custom roles | Yes | Yes |

## Steps to Create a Custom Role

1. Navigate to Settings → Roles & Permissions.
2. Click "Create Role."
3. Enter a role name.
4. Select permissions for each module:
   - Patients: view, create, edit
   - Leads: view, create, edit
   - Appointments: view, create, edit, delete
   - Catalog: view, create, edit, delete
   - Billing: view, create, edit
5. Save the role.

## Steps to Edit a Role

1. Navigate to Settings → Roles & Permissions.
2. Click on the role to edit.
3. Modify the name or permissions.
4. Save changes.
5. Changes take effect immediately for all staff holding that role.

## Steps to Assign a Role to Staff

1. Navigate to Staff Management.
2. Select the staff member.
3. Add or remove roles.
4. Save. The staff member's effective permissions update immediately.

## Important Notes
- A staff member's effective permissions = union of all their assigned roles.
- OrganizationAdmin permissions cannot be edited.
- You cannot delete a role if it would leave the clinic with no active ClinicAdmin.
- All role changes are recorded in the audit log.
