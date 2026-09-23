# Book an Appointment for a Patient

> Schedule a consultation or treatment appointment for an existing patient in the system.

## Prerequisites

- Staff account with appointment create permission
- The patient must already exist in the system
- The clinic must have a configured timezone and at least one service with qualified staff

## Steps

1. Navigate to **Appointments** from the main navigation menu.
2. Click **Book** (or **New Appointment**) to open the booking form.
3. Select the **Patient** from the patient list or search by name/email/phone.
4. Select the **Service** to be performed (e.g., consultation, trichoscopy session).
5. Choose a **date** — the calendar shows available dates based on clinic working hours and staff availability for the selected service.
6. Choose an available **time slot** from the displayed options.
7. Click **Confirm** to finalize the booking.

## Notes

- The appointment is created with status **SCHEDULED**.
- An **email notification** is sent to the patient confirming the booking details.
- The **SmartScheduling engine** automatically assigns a qualified staff member based on: continuity of care, least busy qualified staff, or any available qualified staff.
- Staff assignment is internal — it is not communicated to the patient.
- Only slots where the clinic is open AND at least one qualified staff member is available are shown.
- Double-booking the same slot for the same clinic is prevented.
