# Mark Appointment as Confirmed/Completed/No-Show

> Update an appointment's status to reflect the patient's attendance and visit outcome.

## Prerequisites

- Staff account with appointment edit permission
- The appointment must be in a valid status for the desired transition

## Steps

1. Open the **appointment details** (from the calendar view or appointment list).
2. Change the **status** using the status dropdown or action buttons.

### Valid Status Transitions

| From | To | Trigger |
|------|----|---------|
| SCHEDULED | CONFIRMED | Patient confirmed attendance (via email link, web component, or staff manually) |
| CONFIRMED | COMPLETED | Visit finished, treatment/consultation done |
| SCHEDULED | NO_SHOW | Patient did not attend the scheduled appointment |
| CONFIRMED | NO_SHOW | Patient did not attend the confirmed appointment |

## Notes

- **Confirmation** can be triggered by:
  - Staff manually (e.g., after calling the patient)
  - Patient clicking a confirmation link in their booking email
  - Patient confirming via the Appointment Booking web component
- When an appointment reaches **CONFIRMED** status with a `patientId`, a **DRAFT session** is automatically created for that patient (if one doesn't already exist for the same session type).
- **COMPLETED** and **NO_SHOW** are terminal statuses — no further transitions are allowed.
- Invalid status transitions are rejected with an `INVALID_APPOINTMENT_STATUS_TRANSITION` error.
- All status changes are recorded in the AuditLog.
