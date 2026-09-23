# Embed Selfie Analysis on Your Website

> Add the Selfie Analysis web component to your website so visitors can complete an AI-powered hair analysis and become leads automatically.

## Prerequisites

- Organization API key generated (via Organization Settings → Web Components)
- Your website domain added to the Allowed Domains list

## Steps

1. Get your **Organization API key** from Organization Settings → Web Components.
2. Ensure your website's domain is in the **Allowed Domains** list.
3. Include the **script tag** in your website's HTML with the `data-key` attribute set to your API key:
   ```html
   <script src="https://[platform-url]/components/selfie.js" data-key="YOUR_API_KEY"></script>
   ```
4. Add the **`<hairscope-selfie>`** element where you want the component to appear:
   ```html
   <hairscope-selfie></hairscope-selfie>
   ```
5. Configure optional settings:
   - **Theme** — customize colors and appearance
   - **Form fields** — control which fields are shown
   - **Locale** — set language via `data-locale` attribute
   - **Camera masks** — configure capture guides

## Notes

- The component handles the full flow: **camera capture**, **lead form**, **questions**, **AI analysis**, and **report display**.
- For **multi-clinic organizations**: visitors must select a clinic during the flow (mandatory).
- For **single-clinic organizations**: clinic selection is skipped automatically.
- After receiving their report, visitors are offered the option to **book an appointment** via the Appointment Booking component.
- The component will show "Access Denied" on domains not in the Allowed Domains list.
- Named **slots** are available for content injection: `top`, `bottom`, `camera-top`, `form-top`, etc.
- Use CSS `::part()` selectors for deep styling customization.
