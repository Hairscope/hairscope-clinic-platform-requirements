# Full Integration Guide

Complete step-by-step guide for integrating the Hairscope Selfie Analysis web component on your website, from initial setup to advanced configuration.

---

## Quick Start

### Step 1: Configure Your Clinic

1. Log in to [app.hairscope.ai](https://app.hairscope.ai).
2. Go to the **Clinic** tab.
3. Fill in your clinic details.
4. **Important:** Add your website URL (e.g., `https://yourwebsite.com`) to the Allowed Domains and save.

### Step 2: Get Your API Key

1. Go to your **Profile** (click the profile icon in the top right corner).
2. Navigate to the **Subscriptions** tab.
3. Copy your **API Key**.

### Step 3: Include the Scripts

Add the following scripts to your HTML. The `hairscope-embed-script` ID and `data-key` attribute are **mandatory**.

```html
<!-- MANDATORY: Script tag with ID and your API Key -->
<script id="hairscope-embed-script" data-key="YOUR_API_TOKEN_HERE"></script>

<!-- Component scripts -->
<script type="module"
  src="https://api.hairscope.ai/hairscope-selfie/dist/esm/hairscope-selfie.js">
</script>
```

> The `data-key` attribute authorizes all API requests. Without it, the component cannot load clinics, slots, or perform analysis.

### Step 4: Add the Component

Place the component tag where you want it to appear:

```html
<hairscope-selfie id="hairscope-comp"></hairscope-selfie>
```

---

## Full Copy-Paste Example

Copy this into a single `.html` file. Replace `YOUR_API_TOKEN_HERE` with your real key.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HairScope Integration</title>

    <script id="hairscope-embed-script" data-key="YOUR_API_TOKEN_HERE"></script>
    <script type="module"
      src="https://api.hairscope.ai/hairscope-selfie/dist/esm/hairscope-selfie.js">
    </script>

    <style>
      #analysis-container {
        max-width: 600px;
        margin: 40px auto;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      }
    </style>
  </head>
  <body>
    <div id="analysis-container">
      <hairscope-selfie id="hairscope-comp"></hairscope-selfie>
    </div>

    <script>
      const comp = document.getElementById('hairscope-comp');

      comp.config = {
        form: {
          centers: {
            en: [
              { label: 'London North', value: 'london_n' },
              { label: 'London South', value: 'london_s' },
            ]
          },
          detailsForm: {
            en: [
              {
                title: 'Hair Loss History',
                inputs: [
                  {
                    name: 'density',
                    label: 'How dense does your hair look overall?',
                    options: [
                      { label: 'Very dense, full coverage', value: '100' },
                      { label: 'Good overall density', value: '75' },
                      { label: 'Some scalp visible', value: '50' },
                      { label: 'Thin / patchy', value: '25' },
                    ],
                    isRequired: true,
                  },
                  {
                    name: 'thickness',
                    label: 'How thick are your individual hairs?',
                    options: [
                      { label: 'Very thick and coarse strands', value: '100' },
                      { label: 'Medium thickness overall', value: '75' },
                      { label: 'Thin and thick mixed', value: '50' },
                      { label: 'Too many thin / wispy hairs', value: '25' },
                    ],
                    isRequired: true,
                  },
                  {
                    name: 'chronicity',
                    label: 'When did you first notice hair fall?',
                    options: [
                      { label: 'Very recently, less than a month', value: '100' },
                      { label: 'Since a few months (1-6 months)', value: '75' },
                      { label: 'Over 6 months ago', value: '50' },
                      { label: 'Over a year or two (chronic)', value: '25' },
                    ],
                    isRequired: true,
                  },
                  {
                    name: 'genetics',
                    label: 'What is your family hair loss history?',
                    options: [
                      { label: 'No hair loss in the family', value: '100' },
                      { label: 'Grandparents / Relatives have hair loss', value: '75' },
                      { label: 'Direct parents or siblings have hair loss', value: '50' },
                      { label: 'Almost everyone in the family', value: '25' },
                    ],
                    isRequired: true,
                  },
                ],
              },
            ],
          },
        },
      };
    </script>
  </body>
</html>
```

---

## Theme Customization

```javascript
comp.config = {
  theme: {
    primaryColor: '#0070f3',
    bgMain: '#ffffff',
    bgSecondary: '#f9fafb',
    textMain: '#333333',
    textSecondary: '#666666',
  },
};
```

---

## Camera Mask Customization

Override the default guide masks for Front and Top (frontal) analysis:

```javascript
comp.config = {
  frontGuideMask: 'https://example.com/front-mask.png',
  frontActiveGuideMask: 'https://example.com/front-mask-success.png',
  frontalGuideMask: 'https://example.com/top-mask.png',
  frontalActiveGuideMask: 'https://example.com/top-mask-success.png',
};
```

---

## Localization

Supported locales: `en`, `es`, `it`, `nl`, `fr`, `ru`, `ar`, `de`

Set the locale via the embed script:

```html
<script id="hairscope-embed-script" data-key="..." data-locale="it"></script>
```

---

## Form Customization

### Rename Lead Form Fields

```javascript
comp.config = {
  form: {
    hideLabels: true,
    leadFormLabels: {
      en: {
        firstName: 'First And Middle Name',
        phone: 'WhatsApp Number',
      },
    },
  },
};
```

### Add Clinic/Center Selection

```javascript
comp.config = {
  form: {
    centers: {
      en: [
        { label: 'London North', value: 'london_n' },
        { label: 'London South', value: 'london_s' },
      ],
    },
  },
};
```

### Custom Details Form (Health Questionnaire)

```javascript
comp.config = {
  form: {
    detailsForm: {
      en: [
        {
          title: 'Hair Loss History',
          inputs: [
            {
              name: 'history',
              label: 'How long have you noticed hair loss?',
              options: [
                { label: 'Less than 6 months', value: '6m' },
                { label: '1-2 years', value: '1-2y' },
                { label: 'More than 2 years', value: '2y+' },
              ],
              isRequired: true,
            },
          ],
        },
      ],
    },
  },
};
```

### Character Limits

| Element | Max Characters |
|:--------|:--------------|
| Section Title | 30 |
| Input Label | 50 |
| Option Label | 50 |

---

## Webhook Integration

Send lead data to your server automatically on form submission:

```javascript
comp.config = {
  leadDataApi: 'https://your-domain.com/webhook/hairscope-lead',
};
```

The component will POST the following JSON to your URL:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+44 1234567890",
  "gender": "male",
  "age": "30",
  "clinic": "London North"
}
```

See the [Webhook Setup Guide](./webhook-setup.md) for full details.

---

## Events

Listen for window-level events to integrate with your CRM, analytics, or backend:

```javascript
// Analysis results
window.addEventListener('result-data', (e) => {
  const { analysisData, coverageData, predictedAge, capturedImages, selfieReportUrl } = e.detail;
  console.log('AI Analysis Results:', analysisData);
});

// Lead form submitted
window.addEventListener('lead-form-submit', (e) => {
  const { firstName, lastName, email, phone, gender, age, center } = e.detail.formData;
});

// Details form submitted
window.addEventListener('details-form-submit', (e) => {
  const { formData } = e.detail;
});

// All selfies captured
window.addEventListener('all-selfies-captured-event', (e) => {
  if (e.detail.allSelfiesCaptured) {
    console.log('Camera flow complete');
  }
});

// Lead saved to Hairscope
window.addEventListener('lead-captured', (e) => {
  console.log('Lead ID:', e.detail.leadId);
});
```

See the [Handle Events](./handle-events.md) guide for the full event reference.

---

## Disable Appointment Booking

If you don't want the "Book Appointment" button on the results screen:

```javascript
comp.config = {
  disableAppointment: true,
};
```

---

## Skip Data Retention

If you handle lead storage yourself and don't want Hairscope to store PII:

```javascript
comp.config = {
  skipDataRetention: true,
};
```

---

## Developer Mode

Enable the developer toolbar for testing different screens without completing the full flow:

```html
<hairscope-selfie id="hairscope-comp" is-dev="true"></hairscope-selfie>
```

The toolbar appears in the top-left corner and lets you jump between any state (lead-form, results, analysis-loader, etc.).

---

## Troubleshooting

**Component not loading:**
- Ensure your API Key is correct and the script `id` is exactly `hairscope-embed-script`.
- Check the browser console for 401 (Unauthorized) errors.
- Verify your domain is in the Allowed Domains list.

**Camera not working:**
- The component requires HTTPS (camera access is blocked on HTTP).
- Ensure the user has granted camera permissions.
- Check that no other application is using the camera.

**"Access Denied" message:**
- Your website domain is not in the Allowed Domains list. Add it in Organization Settings → Web Components.

---

## Support

- **Website:** https://hairscope.ai
- **Support Portal:** https://hairscope.ai/support
- **Email:** support@hairscope.ai
