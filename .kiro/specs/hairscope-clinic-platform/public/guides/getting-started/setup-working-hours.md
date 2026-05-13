# Set Up Working Hours

> Define when your clinic is open so that the booking system offers correct time slots.

## Prerequisites
- ClinicAdmin or OrganizationAdmin role
- Clinic timezone must be configured

## Steps

1. Navigate to Clinic Settings → Working Hours.
2. For each day of the week:
   - Set **Start Time** (e.g., 09:00).
   - Set **End Time** (e.g., 18:00).
   - Or mark the day as **Closed**.
3. Ensure start time is before end time for each open day.
4. Save the schedule.

## How It Affects Appointments

- Appointment slots are derived from working hours AND qualified staff availability.
- A slot is only available if the clinic is open AND at least one qualified staff member is available.
- Patients cannot book outside working hours.
- Changes apply to future slot calculations only — existing appointments are not affected.

## Notes
- Working hours are independent of individual staff availability (configured separately per staff member).
- Staff availability further restricts which slots are bookable for specific services.
