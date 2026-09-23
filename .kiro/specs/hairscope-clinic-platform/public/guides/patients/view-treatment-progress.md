# View Treatment Progress Graph

> Track a patient's hair health metrics over time using the Treatment Progress Graph, which plots data from completed sessions.

## Prerequisites

- You have `patients.view` permission assigned to your staff role.
- The patient has at least one COMPLETED session with AI analysis results.

## Steps

1. Navigate to the **Patient Page** for the relevant patient.
2. Scroll to the **Treatment Progress Graph** section.
3. Review the graph, which plots the following metrics over time:
   - **Hair Count** — total follicle count from trichoscopy analysis.
   - **Thickness** — average hair strand thickness.
   - **Coverage** — scalp coverage percentage.
4. Each data point represents one COMPLETED session, plotted chronologically on the time axis.

## Notes

- Only **COMPLETED** sessions contribute to the graph. Sessions in DRAFT or SAVED status are excluded.
- New data points appear on the graph after a session reaches COMPLETED status (i.e., after AI analysis finishes).
- The graph displays sessions in chronological order — earlier sessions appear to the left.
- If the graph appears empty, verify that the patient has at least one fully completed session with AI analysis results.
