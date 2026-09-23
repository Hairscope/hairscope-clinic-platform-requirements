# Process GDPR Erasure

> Anonymize a patient's personal identifiers in response to a verified right-to-erasure request, in compliance with GDPR obligations.

## Prerequisites

- You have **ClinicAdmin** or **OrgAdmin** role. Regular staff members cannot perform erasure.
- You have received and verified a legitimate right-to-erasure request from the patient.

## Steps

1. Navigate to the **Patient Page** for the patient requesting erasure.
2. Click **GDPR Erasure** (typically found in the patient settings or actions menu).
3. Review what will be anonymized:
   - **First Name** — replaced with a placeholder.
   - **Last Name** — replaced with a placeholder.
   - **Email** — replaced with a placeholder.
   - **Phone** — replaced with a placeholder.
   - **Date of Birth** — replaced with a placeholder.
   - **Age** — replaced with a placeholder.
4. Provide **explicit confirmation** to proceed (you must confirm you understand this is irreversible).
5. The system processes the erasure and records the action in the audit log.

## Important Notes

- **This action is irreversible.** There is no undo mechanism. Once erasure is processed, the original personal identifiers cannot be recovered.
- **Clinical data is preserved.** Sessions, images, AI analysis results, and reports remain intact — only personal identifiers are anonymized.
- **Scope is per-clinic.** Erasure only affects the patient record in your clinic. If the same person has records at other clinics, those are unaffected unless separate erasure requests are submitted to each clinic.
- **Shareable links are invalidated.** Any previously shared report links for this patient will no longer be accessible.
- The erasure action is recorded in the audit log with the actor and timestamp for compliance documentation.
