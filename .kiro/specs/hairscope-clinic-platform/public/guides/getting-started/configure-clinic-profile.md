# Configure Clinic Profile

> Set up timezone, currency, language, and working hours for your clinic.

## Prerequisites
- ClinicAdmin or OrganizationAdmin role

## Steps

1. Navigate to Clinic Settings → Profile.
2. Set the **Timezone** (IANA format, e.g., "Asia/Dubai", "Europe/London").
   - Required before appointments can be booked.
   - Used for appointment slot calculations and reminder scheduling.
3. Set the **Currency** (ISO 4217 code, e.g., "USD", "EUR", "AED").
   - Required before catalog items can be created.
   - If the organization enforces a single currency, this field is locked to the org's currency.
4. Set the **Language** (locale code: EN, ES, IT, NL, FR, RU, AR, DE).
   - All generated documents will use this language.
   - Documents remain in the configured language permanently.
5. Configure **Working Hours**:
   - Set start time and end time for each day of the week.
   - Mark days as closed (no appointments available).
6. Save changes.

## Notes
- Changes to timezone apply to all future appointment slot calculations.
- Changes to working hours apply to all future slot availability.
- Currency changes are blocked if the organization enforces a single currency.
- All changes are recorded in the audit log.
