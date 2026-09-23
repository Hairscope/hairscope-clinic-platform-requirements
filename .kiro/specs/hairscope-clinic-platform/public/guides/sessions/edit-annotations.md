# Edit Trichoscopy Annotations

> Manually correct or supplement AI-generated hair analysis annotations on trichoscopy images using follicle and strand tools.

## Prerequisites

- The session is in **COMPLETED** status (AI analysis has finished).
- You have `patients.edit` permission assigned to your staff role.

## Steps

1. Open the **COMPLETED session**.
2. Select a **trichoscopy image** you want to annotate.
3. Click **Edit Annotations** to enter the editing mode.
4. Use the available tools:
   - **Follicle tool** — click anywhere on the image to place a circle marking a hair follicle at that position.
   - **Strand tool** — draw a 3-point rectangle: point 1 (root position), point 2 (direction), point 3 (thickness). The strand is rendered at the root position.
   - **Delete mode** — when active, click any follicle or strand (AI-generated or manually drawn) to remove it.
5. Adjust **brightness and contrast** as needed to better visualize the scalp.
6. Use **zoom and pan** to navigate the image at different magnification levels.
7. Click **Save** when you are done editing.

## Important Notes

- **No undo/redo** is available. Deletions and placements are immediate. If you accidentally delete an annotation, you must re-draw it manually.
- AI-generated and manually drawn annotations are **not visually differentiated** on the edit page — they look the same. The system tracks the source (AI vs. HUMAN) in the backend.
- Brightness and contrast settings are **persisted per image** — they will be retained when you return to view the image later.
- After saving edits, you are navigated to the view analysis page.
