# Add a New Patient

> Create a new patient record in your clinic so you can begin documenting their treatment journey.

## Prerequisites

- You have `patients.create` permission assigned to your staff role.

## Steps

1. Navigate to **Patients** from the main menu.
2. Click **Create New Patient**.
3. Fill in the required fields:
   - **First Name** — the patient's given name.
   - **Last Name** — the patient's family name.
   - **Email** — the patient's email address (must be unique within your clinic).
   - **Gender Assigned at Birth** — select the appropriate value.
4. Fill in optional fields as available:
   - **Date of Birth** — if provided, age is auto-calculated.
   - **Age** — enter manually only if date of birth is not known.
   - **Phone** — the patient's phone number (must be unique within your clinic if provided).
   - **External Patient ID** — alphanumeric identifier for mapping to your external clinic system.
5. Click **Save**.

## Notes

- **Email must be unique** within your clinic. If another patient already has the same email, creation will be rejected.
- **Phone must be unique** within your clinic if provided. Leaving phone empty is allowed and does not trigger a uniqueness check.
- **Date of birth auto-calculates age.** If you provide a date of birth, the system calculates and stores the age automatically — any manually entered age value is overridden.
- If neither date of birth nor age is provided, both fields remain empty on the patient record.
- The same person can have patient records at multiple clinics (including across different organizations). There is no global uniqueness constraint.
- Patient records cannot be deleted — only anonymized via GDPR erasure.
