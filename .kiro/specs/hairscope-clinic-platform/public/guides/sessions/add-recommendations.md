# Add Recommendations to a Session

> Recommend catalog items (services, medications, cosmetics, supplements, or kits) to a patient as part of their treatment plan.

## Prerequisites

- The session is in **COMPLETED** status.
- You have `patients.edit` permission assigned to your staff role.
- Your clinic's catalog has items available to recommend.

## Steps

1. Open the **COMPLETED session** for the patient.
2. Go to the **Recommendations** section.
3. Search the catalog for items to recommend.
4. Add items to the session — you can include any mix of:
   - **Services** — procedures or treatments.
   - **Medications** — prescription or OTC medications.
   - **Cosmetics** — topical products.
   - **Supplements** — oral supplements.
   - **Treatment Kits** — bundled packages of multiple items.
5. For each recommendation, **customize the routine** if needed:
   - The catalog item's default routine is copied as a starting point.
   - Adjust frequency, duration, or instructions for this specific patient.
6. Click **Save** when all recommendations are added.

## Notes

- The **StressOMeter threshold** may automatically suggest stress-related items from your catalog based on the patient's questionnaire results.
- Recommendations are grouped by type for document generation:
  - **All recommendations** → Treatment Plan PDF.
  - **MEDICATION recommendations only** → Prescription PDF.
- You can edit recommendations after they are saved. If documents have already been generated and signed, editing requires re-approval and re-signing (see [Edit After Signing](./edit-after-signing.md)).
- A session with zero recommendations will not generate a Treatment Plan or Prescription — only the Clinical Trichoscopy Report is produced.
