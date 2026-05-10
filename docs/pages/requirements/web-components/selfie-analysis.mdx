# Selfie Analysis Web Component

> Covers: Camera capture, lead/anonymous form collection, dynamic questionnaire, AI analysis submission, report generation, result display, error handling, and customization model.
> Events emitted (to host page): `all-selfies-captured-event`, `lead-form-submit`, `details-form-submit`, `result-data`, `lead-captured`, `application-error`
> Platform events emitted: `LeadCreated` (lead mode only)
> Platform events consumed: none

> **Architectural note:** The Selfie Analysis Web Component is a reusable, embeddable Stencil-based client application. It is a UI shell and workflow orchestration client — NOT an AI engine and NOT a business module. It captures guided images, collects user responses, submits analysis payloads to the external AI Analysis API, persists results through the Hairscope Platform API, and renders generated reports. The AI model is a separate external API and is not in scope of this document.

---

## Glossary

- **SelfieAnalysisComponent**: The `<hairscope-selfie>` custom element. A standalone embeddable web component that orchestrates the selfie analysis flow.
- **LeadMode**: The component creates a Lead record in the platform with the visitor's contact details and analysis results. Default mode.
- **AnonymousMode**: The component runs the AI analysis and displays results without storing personally identifiable information. Analysis data is stored anonymously per GDPR/HIPAA requirements.
- **OrganizationAPIKey**: The authentication credential embedded in the component. Authorizes all platform API requests. Scoped to a single Organization.
- **AllowedDomain**: The domain(s) configured for an Organization where the component is permitted to run. Requests from non-allowed domains are rejected.
- **GuideMask**: An overlay image shown on the camera viewfinder to guide the user into the correct position for image capture.
- **QualityControl (QC)**: Real-time checks performed during camera capture — lighting, blur, glare, and pose validation — to ensure image quality before submission.
- **DetailsForm**: A dynamic questionnaire configured per Organization. Questions and answers are submitted to the AI model as part of the analysis payload.
- **SelfieAnalysisReport**: The PDF report generated from AI analysis results. Embedded in the result screen and available for download.

---

## Modes

| Mode | PII Stored | Lead Created | Authentication | Use Case |
|------|-----------|-------------|----------------|----------|
| `LEAD` | Yes | Yes | Organization API Key | Clinic website — capture prospect + analysis |
| `ANONYMOUS` | No (anonymized) | No | Organization API Key | Demo, try-it-out, or privacy-first contexts |

---

## Requirements

### SA-1: Camera Capture Screen

**User Story:** As a visitor, I want to capture guided selfie images so that the AI can analyze my hair condition accurately.

#### Acceptance Criteria

1. THE Component SHALL request camera access from the browser on initialization.
2. IF camera access is denied, THE Component SHALL display a clear error message explaining that camera permission is required and how to enable it.
3. IF the browser does not support the required camera APIs, THE Component SHALL display an unsupported browser error.
4. IF the Organization API Key is invalid or the current domain is not in the Organization's allowed domain list, THE Component SHALL display an "Access Denied" error and SHALL NOT initialize the camera.
5. THE Component SHALL display a guide mask overlay on the camera viewfinder to help the user position correctly.
6. THE Component SHALL perform real-time Quality Control (QC) checks during capture: lighting validation, blur detection, glare detection, and pose verification.
7. THE Component SHALL only accept a capture when all QC checks pass simultaneously.
8. THE Component SHALL support capturing multiple images as required by the analysis (e.g., front view, top view) with appropriate guide masks for each position.
9. WHEN all required images are captured, THE Component SHALL emit an `all-selfies-captured-event` to the host page and proceed to the next step.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| Camera permission denied | Error screen with instructions to enable |
| Unsupported browser | Error screen with supported browser list |
| Invalid/missing API key | "Access Denied" error screen |
| Domain not in allowed list | "Access Denied" error screen |
| QC check fails (blur/lighting/glare) | Real-time feedback, capture blocked until resolved |

#### Correctness Properties

- THE Component SHALL NOT submit images that fail QC checks to the AI model.
- THE Component SHALL NOT initialize if the API key is invalid or the domain is not allowed.

---

### SA-2: Profile Form (Lead Capture)

**User Story:** As a visitor, I want to provide my contact details so that the clinic can follow up with me about my results.

#### Acceptance Criteria

1. IN `LEAD` mode, THE Component SHALL display a profile form collecting: `firstName`, `lastName`, `email`, `phone`, `gender`, `age`. At minimum, one of `firstName`/`lastName` and `gender` are required.
2. IN `ANONYMOUS` mode, THE Component SHALL skip the profile form entirely or collect only non-identifying fields (e.g., `gender`, `age`) needed for AI analysis accuracy.
3. IF the Organization has multiple active Clinics, THE Component SHALL display a clinic selector (mandatory in Lead mode). In single-clinic Organizations, the clinic is auto-assigned.
4. THE Component SHALL emit a `lead-form-submit` event to the host page when the form is submitted.
5. THE Component SHALL validate all required fields client-side before submission.
6. THE Component SHALL support configurable form field labels per locale via the `config.form.leadFormLabels` property.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| Required fields missing | Inline validation errors, submission blocked |
| Multi-clinic org without clinic selection | Submission blocked |

#### Correctness Properties

- In `LEAD` mode: a Lead record SHALL be created in the platform after successful form submission and analysis completion.
- In `ANONYMOUS` mode: no PII SHALL be stored in the platform. Only anonymized analysis data is persisted.

---

### SA-3: Additional Questions (Dynamic Questionnaire)

**User Story:** As a visitor, I want to answer questions about my hair condition so that the AI analysis is more accurate and personalized.

#### Acceptance Criteria

1. THE Component SHALL display a dynamic questionnaire configured per Organization via `config.form.detailsForm`.
2. THE questionnaire SHALL support multiple sections, each with a title and a list of single-select questions with predefined options.
3. THE Component SHALL support marking questions as required or optional.
4. THE Component SHALL enforce character limits: section title (30 chars), question label (50 chars), option label (50 chars).
5. THE Component SHALL emit a `details-form-submit` event to the host page with all answers when submitted.
6. THE questionnaire answers SHALL be included in the payload submitted to the AI Analysis API.
7. THE Component SHALL support localized questionnaires — different question sets per locale.

#### Correctness Properties

- All required questions MUST be answered before the form can be submitted.
- The answers submitted to the AI model SHALL exactly match what the user selected.

---

### SA-4: Processing Overlay

**User Story:** As a visitor, I want to see that my images are being analyzed so that I know the system is working and I should wait.

#### Acceptance Criteria

1. AFTER images and questionnaire are submitted, THE Component SHALL display the last captured image with a loading animation overlay.
2. THE Component SHALL display partial visual results (e.g., density indicator, stage indicator) as they become available from the AI model during processing.
3. THE Component SHALL remain on this screen until the AI analysis completes or fails.

#### Correctness Properties

- THE Component SHALL NOT navigate away from the processing screen until a definitive result (success or failure) is received from the AI API.

---

### SA-5: Report Generation Screen

**User Story:** As a visitor, I want to know that my personalized report is being prepared so that I understand there's a brief wait before seeing my results.

#### Acceptance Criteria

1. AFTER AI analysis completes successfully, THE Component SHALL display a "report is being prepared" loading state while the PDF report is generated.
2. THE Component SHALL transition to the result screen once the report PDF URL is available.

---

### SA-6: Result Screen

**User Story:** As a visitor, I want to see my AI analysis results and download my report so that I understand my hair condition and can take action.

#### Acceptance Criteria

1. THE Component SHALL display the generated PDF report embedded in the result page.
2. THE Component SHALL display key analysis metrics visually (hair loss stage, density, coverage).
3. THE Component SHALL emit a `result-data` event to the host page containing: `analysisData`, `coverageData`, `predictedAge`, `capturedImages`, `selfieReportUrl`.
4. THE Component SHALL display a "Book Appointment" call-to-action button (unless disabled via `config.disableAppointment`).
5. THE Component SHALL display a treatment recommendation call-to-action button (if configured).
6. IN `LEAD` mode, THE Component SHALL emit a `lead-captured` event with the `leadId` after the Lead is successfully persisted.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| PDF report URL not available | Show results without embedded PDF, offer retry |

#### Correctness Properties

- The `result-data` event payload SHALL contain all analysis outputs returned by the AI API.
- In `LEAD` mode: a Lead record SHALL exist in the platform by the time `lead-captured` is emitted.

---

### SA-7: Failure State

**User Story:** As a visitor, I want to see a clear error message when something goes wrong so that I know what happened and what I can do next.

#### Acceptance Criteria

1. IF the AI analysis API fails or times out, THE Component SHALL display an error screen with a human-readable message.
2. THE Component SHALL offer a "Try Again" button to retry the analysis submission.
3. THE Component SHALL emit an `application-error` event to the host page when a critical error occurs.
4. THE Component SHALL NOT expose technical error details (stack traces, API responses) to the visitor.
5. IF retry also fails, THE Component SHALL display a fallback message suggesting the visitor contact the clinic directly.

#### Correctness Properties

- No technical/internal error details SHALL be visible to the end user.
- The `application-error` event SHALL be emitted for every critical failure, enabling host page error tracking.

---

### SA-8: Authentication and Domain Restriction

**User Story:** As an OrganizationAdmin, I want the selfie analysis component to only work on my authorized domains so that unauthorized websites cannot use my API key.

#### Acceptance Criteria

1. THE Component SHALL authenticate all platform API requests using the Organization API Key embedded via the `data-key` attribute on the script tag.
2. THE Platform SHALL validate that the requesting domain matches one of the Organization's configured allowed domains.
3. IF the domain is not in the allowed list, THE Platform SHALL reject the request and THE Component SHALL display an "Access Denied" error.
4. THE Organization API Key is configured and managed by OrganizationAdmins only (see LM-12).
5. THE Component SHALL NOT function without a valid API key — all screens SHALL show an error state.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Invalid or missing API key | `WEBHOOK_INVALID_API_KEY` |
| Domain not in allowed list | `FORBIDDEN` |

#### Correctness Properties

- For any domain D not in the Organization's allowed domain list: all API requests from D SHALL be rejected.
- The API key SHALL NOT be exposed in client-side JavaScript beyond the `data-key` attribute (it is transmitted server-side via the script tag mechanism).

---

### SA-9: Customization Model

**User Story:** As a developer integrating the component, I want to customize the look, feel, and behavior so that it matches my website's branding and workflow.

#### Acceptance Criteria

1. THE Component SHALL support theming via a `config.theme` object: `primaryColor`, `secondaryColor`, `highlightColor`, `textMain`, `textSecondary`, `bgMain`, `bgSecondary`.
2. THE Component SHALL support content injection via named slots: `top`, `bottom`, `camera-top`, `camera-bottom`, `form-top`, `form-bottom`, `lead-form-top`, `details-form-top`, `loading-top`, `loading-msg`.
3. THE Component SHALL support deep CSS customization via `::part()` selectors on Shadow DOM elements.
4. THE Component SHALL support custom camera guide masks via `config.frontGuideMask`, `config.frontActiveGuideMask`, `config.frontalGuideMask`, `config.frontalActiveGuideMask`.
5. THE Component SHALL support localization via the `data-locale` attribute on the script tag. Supported locales: `en`, `es`, `it`, `nl`, `fr`, `ru`, `ar`, `de`.
6. THE Component SHALL support a developer mode (`is-dev="true"`) that renders a toolbar for jumping between screens during development.
7. THE Component SHALL support a `config.leadDataApi` webhook URL for forwarding lead data to external systems.
8. THE Component SHALL support `config.skipDataRetention` to prevent PII storage (anonymous mode).
9. THE Component SHALL support `config.disableAppointment` to hide the appointment booking CTA on the result screen.

#### Correctness Properties

- Theme changes SHALL apply consistently across all screens of the component.
- Slot content SHALL render in the correct position without breaking the component's internal layout.
- Locale changes SHALL affect all user-facing text within the component.
