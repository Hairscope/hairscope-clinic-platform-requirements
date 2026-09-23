# Handle Web Component Events

> Listen for events emitted by the web components to integrate with your CRM, analytics, or custom workflows.

## Prerequisites

- Web component already embedded on your website
- Basic knowledge of JavaScript event handling

## Steps

1. Add **event listeners** on the `window` object for the events you want to handle:
   ```javascript
   window.addEventListener('all-selfies-captured-event', (event) => {
     console.log('All selfies captured:', event.detail);
   });

   window.addEventListener('lead-captured', (event) => {
     console.log('New lead created:', event.detail);
     // Send to your CRM, analytics, etc.
   });

   window.addEventListener('result-data', (event) => {
     console.log('Analysis results:', event.detail);
   });
   ```

## Available Events

| Event Name | Description |
|-----------|-------------|
| `all-selfies-captured-event` | All required selfie photos have been taken |
| `lead-form-submit` | Visitor submitted the lead information form |
| `details-form-submit` | Visitor submitted additional details form |
| `result-data` | AI analysis results are ready |
| `lead-captured` | A new lead has been created in the platform |
| `hs-open-appointment` | Visitor clicked to open appointment booking |
| `application-error` | An error occurred in the component |

## Notes

- Events are dispatched on the `window` object as standard `CustomEvent` instances with data in `event.detail`.
- Use events for **CRM integration**, **analytics tracking**, **custom workflows**, or **UI coordination**.
- You can also configure a **`leadDataApi` webhook URL** on the component to automatically POST lead data to your own endpoint.
- Events fire regardless of whether the lead creation succeeds or fails — check `application-error` for failure cases.
- All events are client-side only and do not affect the platform's server-side processing.
