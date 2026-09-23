# Deactivate a Clinic

> Suspend a clinic's operations without permanently deleting its data, revoking all staff access.

## Prerequisites

- **OrganizationAdmin** role
- The clinic must NOT be the last active clinic in the organization

## Steps

1. Navigate to **Organization → Clinics**.
2. Select the clinic you want to deactivate.
3. Click **Deactivate**.
4. Confirm the deactivation when prompted.

## Notes

- When a clinic is deactivated:
  - All **staff access is revoked** — staff assigned to that clinic can no longer authenticate.
  - **No new data** can be created (appointments, sessions, leads, invoices).
  - All **existing data is preserved** unchanged — nothing is deleted.
- You **cannot deactivate the last active clinic** in an organization. At least one active clinic must exist at all times.
- A deactivated clinic can be **reactivated** later by an OrganizationAdmin, restoring full access for its staff members (subject to their individual active/inactive status).
- Deactivation and reactivation are recorded in the AuditLog with the actor and timestamp.
