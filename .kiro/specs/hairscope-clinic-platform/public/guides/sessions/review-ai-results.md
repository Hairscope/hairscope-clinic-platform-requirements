# Review AI Analysis Results

> View the AI-generated hair analysis results after the system has processed your session images.

## Prerequisites

- The session has been saved and AI analysis has completed.
- You received a notification that analysis is ready.

## Steps

1. Receive the notification that AI analysis is complete (in-app toaster or push notification).
2. Open the session — it is now in **COMPLETED** status.
3. Review the **per-image results** for each trichoscopy image:
   - **Hair Count** — number of detected hair follicles.
   - **Density** — follicle density measurement.
   - **Thickness** — average strand thickness.
4. Review the **overall hair loss stage** derived from global images.
5. The **Clinical Trichoscopy Report** has been auto-generated and is available for viewing.

## Notes

- AI results are generated per trichoscopy image using specialized models (Hair Root Model, Hair Strand Model, Tricho Coverage Model).
- The overall hair loss stage is classified from global images using the Hairfall Stage Model.
- You can **edit annotations** on any trichoscopy image if you want to correct or supplement the AI findings (see [Edit Annotations](./edit-annotations.md)).
- If any image shows a FAILED status, you can manually resubmit it for AI analysis.
- The Clinical Trichoscopy Report is shareable immediately — no additional approval is needed.
