# Requirements Document — Appointments

## Introduction

The Appointments module manages the scheduling, tracking, and management of clinic appointments. It supports service configuration per clinic, working-hours-driven slot availability, staff-initiated and patient/lead-initiated booking, calendar views, and status lifecycle management. Appointment booking is also available via the embeddable Stencil web component on clinic websites.

---

## Glossary

Refer to the master requirements glossary for platform-wide terms. Additional terms specific to this module:

- **Service**: A treatment offering configured per Clinic with name, description, image, price, currency, and duration.
- **Appointment_Slot**: A specific date and time window available for booking, derived from the Clinic's Working_Hours and existing appointments.
- **Appointment_Status**: The lifecycle state of an appointment: Scheduled, Confirmed, Completed, Cancelled, or No_Show.
- **Calendar_View**: The main appointments page displaying all appointments for a Clinic in a calendar layout.
- **Appointment_Web_Component**: The Stencil-based embeddable widget that allows leads and patients to book and manage appointments on a clinic website.
- **Reschedule**: The action of changing an existing appointment's date and/or time slot.
- **Cancellation**: The action of cancelling an existing appointment, setting its status to Cancelled.

---

## Requirements

### Requirement APT-1: Service Configuration

**User Story:** As a Clinic Admin, I want to configure the services my clinic offers so that staff and patients can select the correct treatment when booking appointments.

#### Acceptance Criteria

1. THE Platform SHALL allow Clinic Admins to create, edit, and delete Services for their Clinic.
2. THE Platform SHALL store the following fields for each Service: Name, Description, Image, Price, Currency, and Duration.
3. WHEN a Service is created, THE Platform SHALL require Name, Price, Currency, and Duration fields and return a validation error if any are missing.
4. THE Platform SHALL display the list of configured Services when a Staff member initiates an appointment booking.
5. WHEN a Service is deleted, THE Platform SHALL retain the Service name and details on all existing appointments that reference that Service.
6. WHEN a Service is created, edited, or deleted, THE Platform SHALL record the action in the Audit_Log.

#### Correctness Properties

- **Service reference preservation**: For any appointment A referencing Service S, if S is deleted, A.service_name and A.service_details SHALL remain unchanged.
- **Duration positivity**: For any Service S, S.duration SHALL be a positive integer representing minutes.

---

### Requirement APT-2: Working Hours Configuration

**User Story:** As a Clinic Admin, I want to configure my clinic's working hours so that the appointment booking system only offers valid time slots.

#### Acceptance Criteria

1. THE Platform SHALL allow Clinic Admins to configure Working_Hours per day of the week, with a start time and end time per day.
2. THE Platform SHALL allow individual days to be marked as closed (no appointments available).
3. WHEN Working_Hours are updated, THE Platform SHALL apply the new schedule to all future Appointment_Slot availability calculations.
4. THE Platform SHALL derive available Appointment_Slots from the configured Working_Hours and the duration of the selected Service, excluding slots already occupied by existing appointments.
5. WHEN a Staff member or patient attempts to book a slot outside the configured Working_Hours, THE Platform SHALL reject the booking and return a validation error.

#### Correctness Properties

- **Slot within working hours**: For any Appointment_Slot generated for Service S on day D, the slot's start time SHALL be ≥ Working_Hours[D].start and the slot's end time SHALL be ≤ Working_Hours[D].end.
- **No overlap**: For any two appointments A1 and A2 on the same day in the same Clinic, their time slots SHALL NOT overlap.
- **Closed day rejection**: For any day D marked as closed, no Appointment_Slot SHALL be generated for D.

---

### Requirement APT-3: Appointment Booking by Staff

**User Story:** As a Staff member with appointment create permission, I want to book appointments for leads and patients so that I can schedule consultations and treatments on their behalf.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to book an appointment by selecting a Lead or Patient from a dropdown, selecting a Service, and selecting an available date and Appointment_Slot.
2. THE Platform SHALL allow only one Service per appointment.
3. WHEN an appointment is booked, THE Platform SHALL set the initial Appointment_Status to Scheduled.
4. WHEN an appointment is booked, THE Platform SHALL send an email notification to the Lead's or Patient's email address.
5. THE Platform SHALL prevent double-booking of the same Appointment_Slot for the same Clinic.
6. WHEN an appointment is booked, THE Platform SHALL record the action in the Audit_Log.

#### Correctness Properties

- **No double-booking**: For any Clinic C and any Appointment_Slot T, the count of appointments in C with status Scheduled or Confirmed occupying slot T SHALL be ≤ 1.
- **Initial status**: For any newly booked appointment A, A.status SHALL equal Scheduled immediately after creation.
- **Email notification**: For any appointment A booked for Lead or Patient with email E, an email notification SHALL be sent to E within one processing cycle of the booking.

---

### Requirement APT-4: Appointment Booking via Web Component

**User Story:** As a lead or patient, I want to book an appointment on the clinic website after completing my selfie analysis so that I can schedule a consultation without calling the clinic.

#### Acceptance Criteria

1. THE Platform SHALL provide an Appointment_Web_Component built with Stencil that can be embedded on any clinic website.
2. WHEN a visitor completes the Selfie_Analysis flow, THE Platform SHALL offer the option to proceed to the Appointment_Web_Component to book an appointment.
3. THE Appointment_Web_Component SHALL display available Services and Appointment_Slots based on the Clinic's configuration.
4. WHEN a visitor books an appointment via the Appointment_Web_Component, THE Platform SHALL create an appointment record and send an email confirmation to the visitor.
5. THE Platform SHALL authenticate the Appointment_Web_Component using a clinic-specific API key.
6. IF the clinic-specific API key is invalid or missing, THEN THE Platform SHALL reject all booking requests from that web component instance.

#### Correctness Properties

- **Slot availability accuracy**: The Appointment_Slots displayed by the Appointment_Web_Component SHALL reflect the same availability as the Staff booking interface at the same point in time.

---

### Requirement APT-5: Appointment Calendar View

**User Story:** As a Staff member, I want to view all clinic appointments in a calendar so that I can quickly see the day's schedule and manage upcoming appointments.

#### Acceptance Criteria

1. THE Platform SHALL provide a Calendar_View as the main appointments page, displaying all appointments for the Clinic.
2. THE Calendar_View SHALL support day, week, and month display modes.
3. THE Calendar_View SHALL display each appointment with the patient/lead name, Service name, and Appointment_Status.
4. WHEN a Staff member clicks an appointment in the Calendar_View, THE Platform SHALL display the full appointment details.
5. THE Calendar_View SHALL update in real time when new appointments are booked or existing appointments are rescheduled or cancelled.

---

### Requirement APT-6: Appointment Status Management

**User Story:** As a Staff member, I want to update appointment statuses so that the calendar accurately reflects the current state of each appointment.

#### Acceptance Criteria

1. THE Platform SHALL support the following Appointment_Status values: Scheduled, Confirmed, Completed, Cancelled, and No_Show.
2. THE Platform SHALL allow Staff to transition an appointment's status according to the following valid transitions: Scheduled → Confirmed, Scheduled → Cancelled, Confirmed → Completed, Confirmed → Cancelled, Confirmed → No_Show, Scheduled → No_Show.
3. WHEN an appointment's status is changed, THE Platform SHALL record the change in the Audit_Log.
4. WHEN an appointment is marked as Completed, THE Platform SHALL trigger Invoice generation for that appointment's associated Session (if a Session exists).
5. IF a Staff member attempts an invalid status transition, THEN THE Platform SHALL reject the change and return a descriptive error.

#### Correctness Properties

- **Valid transitions only**: For any appointment A, A.status SHALL only change via the transitions defined in APT-6 AC2.
- **Completed triggers invoice**: For any appointment A transitioned to Completed with an associated Session S, an Invoice SHALL be generated for S within one processing cycle.

---

### Requirement APT-7: Appointment Rescheduling

**User Story:** As a Staff member or as a lead/patient, I want to reschedule an appointment so that I can change the date or time without cancelling and rebooking.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to reschedule any appointment in Scheduled or Confirmed status by selecting a new date and Appointment_Slot.
2. THE Platform SHALL allow leads and patients to reschedule their own appointments via the Appointment_Web_Component.
3. WHEN an appointment is rescheduled, THE Platform SHALL send an email notification to the Lead's or Patient's email address confirming the new date and time.
4. WHEN an appointment is rescheduled, THE Platform SHALL record the change in the Audit_Log, including the previous and new date/time.
5. THE Platform SHALL prevent rescheduling to a slot that is already occupied by another appointment.

#### Correctness Properties

- **No double-booking on reschedule**: After rescheduling appointment A to slot T, no other appointment in the same Clinic SHALL occupy slot T.
- **Notification on reschedule**: For any rescheduled appointment A, an email notification SHALL be sent to the associated Lead's or Patient's email within one processing cycle.

---

### Requirement APT-8: Appointment Cancellation

**User Story:** As a Staff member or as a lead/patient, I want to cancel an appointment so that the slot is freed up for other bookings.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to cancel any appointment in Scheduled or Confirmed status.
2. THE Platform SHALL allow leads and patients to cancel their own appointments via the Appointment_Web_Component.
3. WHEN an appointment is cancelled, THE Platform SHALL set the Appointment_Status to Cancelled and release the Appointment_Slot.
4. WHEN an appointment is cancelled, THE Platform SHALL send an email notification to the Lead's or Patient's email address.
5. WHEN an appointment is cancelled, THE Platform SHALL record the cancellation in the Audit_Log.
6. IF a Staff member attempts to cancel an appointment in Completed or No_Show status, THEN THE Platform SHALL reject the cancellation and return a descriptive error.

#### Correctness Properties

- **Slot release on cancellation**: After appointment A is cancelled, the Appointment_Slot previously occupied by A SHALL be available for new bookings.
- **Cancellation notification**: For any cancelled appointment A, an email notification SHALL be sent to the associated Lead's or Patient's email within one processing cycle.
