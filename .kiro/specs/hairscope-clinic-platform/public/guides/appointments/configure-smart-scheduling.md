# Configure Smart Scheduling

> Understand how the platform automatically assigns staff to appointments and how to override assignments when needed.

## Prerequisites

- **ClinicAdmin** role (for manual overrides)
- Staff availability and qualified staff must be configured for services

## Steps

The SmartScheduling engine runs automatically when any appointment is booked. It evaluates the following **4 priority rules** in order, moving to the next rule only if the current one yields no eligible candidate:

1. **Continuity of care** — If the patient has a previous completed appointment for the same service AND the previously assigned staff member is qualified for this service AND is available in the requested slot → assign that staff member.
2. **Least busy qualified staff** — From the qualified staff list for the service, select the staff member who is available in the requested slot AND has the fewest scheduled/confirmed appointments on that day.
3. **Any available qualified staff** — From the qualified staff list, select any staff member who is available in the requested slot, regardless of load.
4. **No assignment (flags for manual)** — If no qualified staff member is available (edge case), the appointment is created with no staff assignment and flagged for manual assignment by a ClinicAdmin.

## Notes

- **ClinicAdmin can manually override** the assigned staff member on any appointment at any time.
- Staff assignment is **internal** — it is never communicated to patients or leads.
- Only **active** staff members with configured availability are eligible for SmartScheduling.
- Inactive (deactivated) staff remain in the qualified staff list but are excluded from scheduling.
- The SmartScheduling engine is a pluggable component — its rules can be updated independently without changing the booking flow.
- Manual overrides are recorded in the AuditLog with previous and new assignee.
