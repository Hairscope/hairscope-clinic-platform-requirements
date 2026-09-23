# Web Component API Reference

Complete reference for all properties, slots, CSS shadow parts, and configuration options exposed by the Hairscope web components.

---

## Component Properties

These attributes map directly to the `<hairscope-selfie>` element.

| Prop | Attribute | Type | Default | Description |
|:-----|:----------|:-----|:--------|:------------|
| `config` | `config` | `IConfig` | `undefined` | The primary configuration object |
| `isDev` | `is-dev` | `boolean` | `false` | Enables Developer Mode toolbar |
| `containerClass` | `container-class` | `string` | `''` | Custom class for the main wrapper |

```javascript
const comp = document.getElementById('hairscope-comp');
comp.config = {
  theme: { primaryColor: '#0070f3' },
  form: { hideLabels: false },
};
```

```html
<!-- Developer mode and custom container class -->
<hairscope-selfie id="hairscope-comp" is-dev="true" container-class="my-custom-wrapper"></hairscope-selfie>
```

---

## Slots

Slots allow you to inject custom HTML into specific parts of the component. If a slot is not provided, fallback content is rendered.

| Slot Name | Description | Fallback Content |
|:----------|:------------|:-----------------|
| `top` | Main header section | Hairscope logo & analysis guide image |
| `bottom` | Main footer section | Hairscope trust badges & copyright |
| `camera-top` | Viewfinder instruction overlay | "Position your scalp..." instructions |
| `camera-bottom` | Viewfinder footer | "Detecting hair health..." note |
| `form-top` | Popup form header | "Complete Your Profile" title |
| `form-bottom` | Popup form footer | Privacy note & Cancel/Continue buttons |
| `lead-form-top` | Text above the lead form | "Where should we send your report?" |
| `details-form-top` | Text above the details form | "Tell us more about your concerns." |
| `loading-top` | Loader header section | (Empty) |
| `loading-msg` | Loader message section | (Empty) |

### Slot Usage Examples

```html
<hairscope-selfie id="hairscope-comp">
  <!-- Header & Footer -->
  <header slot="top" style="padding: 10px; background: #333; text-align: center;">
    <h1 style="color: white; margin: 0;">AI Hair Analysis</h1>
  </header>
  <footer slot="bottom" style="padding: 10px; background: #333; text-align: center;">
    <p style="color: white; margin: 0;">© 2024 Your Clinic Name</p>
  </footer>

  <!-- Camera Instructions -->
  <div slot="camera-top" style="padding: 10px; background: rgba(0,0,0,0.5);">
    <p style="color: yellow;">Align your face within the oval.</p>
  </div>
  <div slot="camera-bottom">
    <p style="color: white; font-size: 12px;">Keep your camera fully steady.</p>
  </div>

  <!-- Form Customization -->
  <div slot="form-top" style="text-align: center;">
    <h2>Let's build your profile!</h2>
  </div>
  <div slot="form-bottom" style="font-size: 11px; text-align: center;">
    <p>We respect your privacy under GDPR mandates.</p>
  </div>

  <!-- Lead & Details Form Introductions -->
  <p slot="lead-form-top" style="color: darkblue;">Where should we email your free report?</p>
  <p slot="details-form-top" style="font-weight: bold;">Just a few more medical questions:</p>

  <!-- Loading Screens -->
  <h3 slot="loading-top">Hold tight...</h3>
  <p slot="loading-msg">AI is processing your images securely.</p>
</hairscope-selfie>
```

---

## CSS Shadow Parts

Use `::part()` pseudo-element to style internal Shadow DOM elements.

### Camera Preview

| Part Name | Description |
|:----------|:------------|
| `hsap-camera-frame` | The main camera container |
| `hsap-density` | Density indicator progress bar |
| `hsap-stage` | Stage indicator progress bar |
| `hsap-age` | Predicted age indicator |
| `hsap-error` | Error screen container |
| `hsap-loader` | Camera loading spinner |
| `hsap-powered-by` | Powered-by logo link |

```css
::part(hsap-camera-frame) {
  border: 4px solid #10b981;
  border-radius: 20px;
}
::part(hsap-density) {
  background-color: #34d399;
}
::part(hsap-stage) {
  background-color: #f59e0b;
}
::part(hsap-age) {
  font-size: 1.2rem;
  color: #3b82f6;
}
::part(hsap-error) {
  background: #fef2f2;
  border: 2px solid #ef4444;
}
::part(hsap-loader) {
  border-top-color: #3b82f6;
}
::part(hsap-powered-by) {
  opacity: 0.5;
  filter: grayscale(1);
}
```

### Popups & Forms

| Part Name | Description |
|:----------|:------------|
| `hsap-popup-backdrop` | The semi-transparent overlay |
| `hsap-popup-container` | The main popup box container |
| `hsap-popup-body` | Content area within the popup |
| `hsap-loading-container` | Loading screen container within popup |
| `hsap-input` | Form input fields |
| `hsap-input-error-msg` | Input validation error messages |
| `hsap-required-star` | The asterisk for required fields |
| `hsap-label` | Form labels |
| `hsap-select` | Selection dropdowns |
| `hsap-lead-form-container` | The wrapper around the lead form |
| `hsap-lead-form` | The lead form element itself |
| `hsap-details-form-container` | The wrapper around the details form |
| `hsap-details-form` | The details form element itself |

```css
::part(hsap-popup-backdrop) {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
}
::part(hsap-popup-container) {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
}
::part(hsap-popup-body) {
  padding: 24px;
}
::part(hsap-label) {
  font-size: 14px;
  font-weight: 500;
  color: #334155;
}
::part(hsap-input) {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
}
::part(hsap-input):focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
::part(hsap-select) {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  background-color: #f8fafc;
}
::part(hsap-input-error-msg) {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}
::part(hsap-required-star) {
  color: #ef4444;
}
```

### Buttons

| Part Name | Description |
|:----------|:------------|
| `button` | All secondary buttons |
| `hsap-button` | Primary themed buttons |

```css
::part(button) {
  font-family: inherit;
  cursor: pointer;
  transition: opacity 0.2s;
}
::part(button):hover {
  opacity: 0.8;
}
::part(hsap-button) {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
}
```

### Results Display

| Part Name | Description |
|:----------|:------------|
| `hsap-results` | The entire results screen |
| `hsap-section` | Individual result sections |
| `hs-appointment-btn` | The "Book Appointment" button |
| `hs-treatment-btn` | The treatment call-to-action button |
| `hsap-result-btn-container` | The container wrapping the result buttons |

```css
::part(hsap-results) {
  background-color: #f8fafc;
}
::part(hsap-section) {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
}
::part(hs-appointment-btn) {
  background: #10b981;
  color: white;
  width: 100%;
}
::part(hs-treatment-btn) {
  background: #8b5cf6;
  color: white;
}
```

### Appointment Flow

| Part Name | Description |
|:----------|:------------|
| `hsap-appointment-container` | The main booking container |
| `hsap-appointment-title` | Booking screen titles |
| `hsap-appointment-subtitle` | Booking screen subtitles |
| `hsap-appointment-back-btn` | Navigation back button |
| `hsap-appointment-summary-card` | Confirmation cards |
| `hsap-appointment-trigger-btn` | External trigger button |
| `hsap-appointment-close-btn` | Popup close button |
| `hsap-appointment-search-trigger` | Appointment search link |
| `hsap-appointment-action-btn` | Modal primary action buttons |
| `hsap-appointment-error-msg` | Error message displays |
| `hsap-appointment-submit-btn` | Primary "Confirm Booking" button |

### Calendar

| Part Name | Description |
|:----------|:------------|
| `hsap-calendar-header` | Month/Year navigation header |
| `hsap-calendar-month` | Current month name |
| `hsap-calendar-nav` | Next/Prev month buttons |
| `hsap-calendar-grid` | The date selection grid |
| `hsap-calendar-weekday` | Weekday column headers |
| `hsap-calendar-day` | Standard day cell |
| `hsap-calendar-day-today` | Today's date highlight |
| `hsap-calendar-day-selected` | User-selected date |
| `hsap-calendar-day-available` | Dates with available slots |

### Time Slots

| Part Name | Description |
|:----------|:------------|
| `hsap-slot-grid` | The time slot container |
| `hsap-slot-btn` | Individual time slot button |
| `hsap-slot-selected` | User-selected time slot |

```css
::part(hsap-calendar-header) {
  background: #1e293b;
  color: white;
  border-radius: 8px 8px 0 0;
}
::part(hsap-calendar-day-selected) {
  background: #3b82f6;
  color: white;
}
::part(hsap-calendar-day-available) {
  background: #dbeafe;
  color: #1e40af;
}
::part(hsap-slot-btn) {
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 8px 12px;
}
::part(hsap-slot-selected) {
  background: #3b82f6;
  color: white;
  border-color: #2563eb;
}
::part(hsap-appointment-submit-btn) {
  background: #22c55e;
  color: white;
}
```

---

## Full Configuration Reference (`IConfig`)

```typescript
interface IConfig {
  theme?: IThemeConfig;
  frontGuideMask?: string;           // Static Front guide image URL
  frontActiveGuideMask?: string;     // Front guide image when aligned
  frontalGuideMask?: string;         // Static Top guide image URL
  frontalActiveGuideMask?: string;   // Top guide image when aligned
  skipDataRetention?: boolean;       // Skip internal lead saving/PII storage
  disableAppointment?: boolean;      // Hide "Book Appointment" button on results
  form?: IFormConfig;
  result?: IResult;                  // Custom results text (per locale)
  leadDataApi?: string;              // Custom webhook URL
  defaultCountryCode?: string;       // Default country code for phone input (e.g. 'de', 'us')
}
```

### Theme Config

```typescript
interface IThemeConfig {
  primaryColor?: string;     // Action buttons & accents
  secondaryColor?: string;
  highlightColor?: string;
  textMain?: string;         // Primary text
  textSecondary?: string;    // Secondary text
  bgMain?: string;           // Page background
  bgSecondary?: string;      // Card/Form background
}
```

### Form Config

```typescript
interface IFormConfig {
  hideLabels?: boolean;
  leadFormLabels?: { [locale: string]: ILeadFormLabels };
  detailsFormSubmitButtonLabel?: { [locale: string]: string };
  detailsForm?: { [locale: string]: IDetailsSection[] };
  centers?: { [locale: string]: { label: string; value: string | number }[] };
}

interface ILeadFormLabels {
  firstName?: string;
  lastName?: string;
  gender?: string;
  age?: string;
  phone?: string;
  email?: string;
  center?: string;
  submitButtonLabel?: string;
}

interface IDetailsSection {
  title: string;              // Max 30 characters
  isHalfWidth?: boolean;
  inputs: IDetailsInput[];
}

interface IDetailsInput {
  name: string;
  label: string;              // Max 50 characters
  isRequired?: boolean;
  options?: {
    label: string;            // Max 50 characters
    value: string | number;
  }[];
}
```

### Character Limits

| Element | Max Characters |
|:--------|:--------------|
| Section Title | 30 |
| Input Label | 50 |
| Option Label | 50 |

---

## Localization

Supported locales: `en`, `es`, `it`, `nl`, `fr`, `ru`, `ar`, `de`

Set the locale via the embed script:

```html
<script id="hairscope-embed-script" data-key="..." data-locale="it"></script>
```

---

## Form Customization Example

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
    centers: {
      en: [
        { label: 'London North', value: 'london_n' },
        { label: 'London South', value: 'london_s' },
      ],
    },
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
  defaultCountryCode: 'de',
};
```

---

## Events Reference

| Event Name | Detail Type | Description |
|:-----------|:------------|:------------|
| `all-selfies-captured-event` | `ISelfieCaptured` | User finished taking all required selfies |
| `lead-form-submit` | `ILeadFormEvent` | User submitted the lead contact form |
| `details-form-submit` | `IDetailsFormEvent` | User submitted the custom questions form |
| `result-data` | `IResultData` | AI analysis is complete with results |
| `hs-open-appointment` | `undefined` | "Book Appointment" button clicked |
| `hs-appointment-close` | `undefined` | Booking popup was closed |
| `lead-captured` | `{ leadId: string }` | Lead was successfully saved to Hairscope API |
| `application-error` | `undefined` | A critical error occurred |

### `result-data` Payload

```javascript
window.addEventListener('result-data', (e) => {
  const {
    analysisData,     // { hairfallStage: number, hairfallScale: string }
    coverageData,     // { coverage, highDensity, mediumDensity, lowDensity, image }
    predictedAge,     // number
    capturedImages,   // { front: string, frontal: string } (Base64)
    selfieReportUrl,  // string (PDF link)
  } = e.detail;
});
```

### `lead-form-submit` Payload

```javascript
window.addEventListener('lead-form-submit', (e) => {
  const { firstName, lastName, email, phone, gender, age, center } = e.detail.formData;
});
```

### `details-form-submit` Payload

```javascript
window.addEventListener('details-form-submit', (e) => {
  const { formData } = e.detail; // Map of question keys to selected values
});
```

---

## Appointment Flow Component

| Prop | Type | Default | Description |
|:-----|:-----|:--------|:------------|
| `isOpen` | `boolean` | `false` | Controls popup visibility |
| `showButton` | `boolean` | `false` | Show built-in trigger button |
| `buttonText` | `string` | `'Book...'` | Trigger button text |

Features:
- Users can search for appointments by email
- Reschedule or cancel existing bookings via "Check all appointments" link
- Pre-fills patient details from previous lead form submission
