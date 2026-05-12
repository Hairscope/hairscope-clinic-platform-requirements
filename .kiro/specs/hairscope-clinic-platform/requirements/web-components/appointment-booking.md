# Appointment Booking Web Component

> Covers: Service selection, date/slot picking, booking confirmation, appointment search, rescheduling, cancellation, and customization model.
> Events emitted (to host page): `hs-open-appointment`, `hs-appointment-close`
> Platform events emitted: `AppointmentBooked`, `AppointmentRescheduled`, `AppointmentCancelled`
> Platform events consumed: none

> **Architectural note:** The Appointment Booking Web Component is a reusable, embeddable Stencil-based client application. It provides a self-service booking interface for leads and patients on clinic websites or within other Hairscope applications. It is a UI client only — all business logic (slot availability, double-booking prevention, SmartScheduling) is enforced server-side.

---

## Glossary

- **AppointmentBookingComponent**: The `<appointment-flow>` custom element (or embedded within `<hairscope-selfie>`). A standalone embeddable web component for appointment booking and management.
- **ServiceSelection**: The step where the visitor selects which SERVICE catalog item they want to book.
- **DateSelection**: The step where the visitor picks a date from a calendar showing available days.
- **SlotSelection**: The step where the visitor picks a time slot from the available slots on the selected date.
- **BookingConfirmation**: The final step showing a summary and confirming the appointment.
- **AppointmentSearch**: A feature allowing visitors to find their existing appointments by email address.
- **OrganizationAPIKey**: The authentication credential. Same key as used by the Selfie Analysis component — scoped to the Organization.

---

## Requirements

### AB-1: Service Selection

**User Story:** As a visitor on a clinic website, I want to see what services the clinic offers so that I can choose the right one for my appointment.

#### Acceptance Criteria

1. THE Component SHALL display all active SERVICE catalog items for the Clinic, showing: `name`, `description`, `image`, `price`, and `duration`.
2. THE Component SHALL NOT display `qualifiedStaff` or any internal scheduling details to the visitor.
3. THE visitor SHALL select exactly one service to proceed with booking.
4. THE Component SHALL display the clinic's currency alongside prices.
5. IF no services are configured for the Clinic, THE Component SHALL display a message indicating no services are available for booking.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| No services configured | "No services available" message |
| API key invalid | "Access Denied" error |

#### Correctness Properties

- The services displayed SHALL match the active SERVICE catalog items for the Clinic at the time of display.
- `qualifiedStaff` SHALL NOT be exposed in any response to the component.

---

### AB-2: Date and Slot Selection

**User Story:** As a visitor, I want to pick a date and time for my appointment so that I can book at a time that works for me.

#### Acceptance Criteria

1. AFTER selecting a service, THE Component SHALL display a calendar showing available dates based on the Clinic's working hours.
2. THE Component SHALL visually distinguish: available dates, today's date, selected date, and unavailable/closed dates.
3. THE Component SHALL NOT show dates in the past.
4. WHEN a date is selected, THE Component SHALL display available time slots for that date, calculated from the Clinic's working hours and the selected service's duration, excluding already-booked slots.
5. THE visitor SHALL select exactly one time slot to proceed.
6. THE Component SHALL display dates and times in the Clinic's configured timezone.
7. IF no slots are available on a selected date, THE Component SHALL display a "No available slots" message for that date.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| Clinic timezone not configured | Error: `CLINIC_TIMEZONE_NOT_SET` |
| No available slots on selected date | "No slots available" message |
| Selected slot becomes unavailable (race condition) | Error on submission: `SLOT_NOT_AVAILABLE` |

#### Correctness Properties

- Displayed slot availability SHALL reflect the same availability as the Staff booking interface at the same point in time.
- No slot outside Clinic working hours SHALL be displayed.
- No slot in the past SHALL be displayed.

---

### AB-3: Visitor Details and Booking Confirmation

**User Story:** As a visitor, I want to provide my contact details and confirm my booking so that the clinic has my information and I receive a confirmation.

#### Acceptance Criteria

1. AFTER selecting a slot, THE Component SHALL display a form collecting: `firstName`, `lastName`, `email`, `phone`. Email is required.
2. IF the visitor came from the Selfie Analysis flow, THE Component SHALL pre-fill the form with previously captured lead data (stored in `localStorage` as `hs_lead_data`).
3. THE Component SHALL display a booking summary showing: selected service, date, time, and clinic details.
4. WHEN the visitor confirms, THE Component SHALL submit the booking to the platform API.
5. ON successful booking, THE Platform SHALL:
   - Create an appointment record with status `SCHEDULED`
   - Emit `AppointmentBooked`
   - Send an email confirmation to the visitor's email
   - Invoke the SmartScheduling engine (server-side, not visible to visitor)
6. THE Component SHALL display a confirmation screen with the appointment details after successful booking.

#### Failure Cases

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| Slot already taken | `SLOT_NOT_AVAILABLE` | Error message, return to slot selection |
| Slot outside working hours | `SLOT_OUTSIDE_WORKING_HOURS` | Error message |
| Missing required fields | Client-side validation | Inline errors |
| API key invalid | `WEBHOOK_INVALID_API_KEY` | "Access Denied" error |

#### Correctness Properties

- For any successful booking: exactly one appointment record SHALL be created with status `SCHEDULED`.
- The confirmation email SHALL be sent to the email address provided by the visitor.
- Pre-filled data from Selfie Analysis SHALL match what the visitor previously entered.

---

### AB-4: Appointment Search

**User Story:** As a visitor who previously booked an appointment, I want to find my booking by email so that I can view, reschedule, or cancel it.

#### Acceptance Criteria

1. THE Component SHALL provide a "Check appointments" link/button accessible from the main booking screen.
2. WHEN clicked, THE Component SHALL display a search form asking for the visitor's email address.
3. AFTER the visitor enters their email, THE Platform SHALL send a one-time verification code (OTP) to that email address. The visitor must enter the OTP before appointment data is displayed.
4. AFTER successful OTP verification, THE Component SHALL query the platform for all appointments matching that email for the Clinic.
5. THE Component SHALL display matching appointments with: service name, date, time, and status.
6. FOR each appointment in `SCHEDULED` or `CONFIRMED` status, THE Component SHALL display "Reschedule" and "Cancel" actions.
7. THE Component SHALL NOT display appointments in `COMPLETED`, `CANCELLED`, or `NO_SHOW` status.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| No appointments found for email | "No appointments found" message |
| Invalid email format | Client-side validation error |
| Invalid or expired OTP | "Invalid code" error, allow retry |

#### Correctness Properties

- The search SHALL only return appointments for the authenticated Organization's Clinics.
- No appointment data from other Organizations SHALL be accessible.
- Appointment data SHALL NOT be displayed without successful OTP verification.

---

### AB-5: Appointment Rescheduling via Web Component

**User Story:** As a visitor, I want to reschedule my appointment to a different date/time so that I can adjust my schedule without calling the clinic.

#### Acceptance Criteria

1. WHEN a visitor selects "Reschedule" on an existing appointment, THE Component SHALL display the date/slot selection flow (same as AB-2) for the same service.
2. THE Component SHALL prevent selecting the same slot as the current appointment.
3. WHEN the visitor confirms the new slot, THE Platform SHALL:
   - Update the appointment's slot
   - Emit `AppointmentRescheduled`
   - Send an email confirmation with the new date/time
   - Record the change in the AuditLog
4. THE Component SHALL only allow rescheduling of appointments in `SCHEDULED` or `CONFIRMED` status.

#### Failure Cases

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| New slot already taken | `SLOT_NOT_AVAILABLE` | Error, return to slot selection |
| Appointment not in reschedulable status | `INVALID_APPOINTMENT_STATUS_TRANSITION` | Error message |

#### Correctness Properties

- After rescheduling: the old slot SHALL be released and available for new bookings.
- After rescheduling: the new slot SHALL be occupied and unavailable.

---

### AB-6: Appointment Cancellation via Web Component

**User Story:** As a visitor, I want to cancel my appointment so that the slot is freed up and the clinic is notified.

#### Acceptance Criteria

1. WHEN a visitor selects "Cancel" on an existing appointment, THE Component SHALL display a confirmation prompt.
2. WHEN confirmed, THE Platform SHALL:
   - Set the appointment status to `CANCELLED`
   - Release the slot for new bookings
   - Emit `AppointmentCancelled`
   - Send a cancellation email to the visitor
   - Record the cancellation in the AuditLog
3. THE Component SHALL only allow cancellation of appointments in `SCHEDULED` or `CONFIRMED` status.
4. AFTER cancellation, THE Component SHALL display a confirmation message and remove the appointment from the list.

#### Failure Cases

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| Appointment not cancellable | `APPOINTMENT_NOT_CANCELLABLE` | Error message |

#### Correctness Properties

- After cancellation: the slot previously occupied SHALL be available for new bookings.
- The cancelled appointment SHALL NOT appear in subsequent searches by the same visitor.

---

### AB-7: Authentication and Domain Restriction

**User Story:** As an OrganizationAdmin, I want the appointment booking component to only work on my authorized domains so that unauthorized websites cannot access my clinic's booking system.

#### Acceptance Criteria

1. THE Component SHALL authenticate all platform API requests using the Organization API Key (same key as Selfie Analysis component).
2. THE Platform SHALL validate that the requesting domain matches one of the Organization's configured allowed domains.
3. IF the domain is not in the allowed list, THE Platform SHALL reject the request and THE Component SHALL display an "Access Denied" error.
4. THE Component SHALL NOT function without a valid API key.

#### Correctness Properties

- Same domain restriction rules as the Selfie Analysis component (SA-8) SHALL apply.

---

### AB-8: Customization Model

**User Story:** As a developer integrating the component, I want to customize the booking interface so that it matches my website's design.

#### Acceptance Criteria

1. THE Component SHALL support theming via CSS `::part()` selectors on all major UI elements (calendar, slots, buttons, forms, cards).
2. THE Component SHALL support the following CSS parts for deep customization: `hsap-appointment-container`, `hsap-appointment-title`, `hsap-appointment-subtitle`, `hsap-calendar-*`, `hsap-slot-*`, `hsap-appointment-action-btn`, `hsap-appointment-submit-btn`, `hsap-appointment-error-msg`.
3. THE Component SHALL support localization via the same `data-locale` attribute as the Selfie Analysis component.
4. THE Component SHALL support being triggered externally via a `showButton` prop or programmatically by setting `isOpen = true`.
5. THE Component SHALL emit `hs-open-appointment` when opened and `hs-appointment-close` when closed, enabling host page integration.
6. THE Component SHALL support custom trigger button text via the `buttonText` prop.

#### Correctness Properties

- Theme/styling changes SHALL NOT affect the component's functional behavior.
- Locale changes SHALL affect all user-facing text within the component.

---

### AB-9: Integration with Selfie Analysis Flow

**User Story:** As a visitor who just completed a selfie analysis, I want to seamlessly book an appointment without re-entering my details.

#### Acceptance Criteria

1. WHEN the Selfie Analysis component displays results with the "Book Appointment" CTA enabled, clicking it SHALL open the Appointment Booking component.
2. THE Appointment Booking component SHALL pre-fill visitor details from the Selfie Analysis session (stored in `localStorage`).
3. THE two components are architecturally separate — the Appointment Booking component CAN function independently without the Selfie Analysis component.
4. THE integration between the two components is via shared `localStorage` keys (`hs_lead_data`) and host-page event coordination.

#### Correctness Properties

- The Appointment Booking component SHALL function correctly whether or not it was launched from the Selfie Analysis flow.
- Pre-filled data SHALL be treated as editable — the visitor can modify any field before confirming.
