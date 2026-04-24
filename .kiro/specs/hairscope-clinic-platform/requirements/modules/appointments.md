# Appointments

> Covers: Service configuration, working hours, appointment booking (staff and web component), calendar view, status lifecycle, rescheduling, and cancellation.
> Events emitted: `AppointmentBooked`, `AppointmentRescheduled`, `AppointmentCancelled`, `AppointmentCompleted`
> Events consumed: none

---

## Glossary

- **Service**: A treatment offering configured per Clinic with name, description, image, price, currency, duration, and a list of Qualified_Staff.
- **Qualified_Staff**: The set of Staff members configured as able to provide a specific Service. Used by the Smart_Scheduling engine for assignment.
- **Appointment_Slot**: A specific date/time window available for booking, derived from Clinic_Working_Hours and existing appointments. Slot availability is patient-facing and does not expose staff details.
- **Appointment_Status**: `SCHEDULED` | `CONFIRMED` | `COMPLETED` | `CANCELLED` | `NO_SHOW` - see `shared/enums.md`.
- **Calendar_View**: The main appointments page displaying all appointments for a Clinic in a calendar layout.
- **Appointment_Web_Component**: The Stencil-based embeddable widget for leads/patients to book and manage appointments on a clinic website.
- **Clinic_Working_Hours**: Per-day operating schedule for a Clinic. Drives patient-facing slot availability.
- **Staff_Availability**: Per-staff working schedule. Used internally by Smart_Scheduling. Never exposed to patients.
- **Smart_Scheduling**: The internal engine that assigns a qualified, available Staff member to a booked appointment. The assignment logic is pluggable and can be updated independently.

---

## Requirements

### APT-1: Service Configuration

**User Story:** As a Clinic_Admin or Organization_Admin, I want to configure the services my clinic offers - including which staff can provide them - so that the scheduling engine can assign the right person to each appointment.

#### Acceptance Criteria

1. THE Platform SHALL allow Clinic_Admins and Organization_Admins to create, edit, and delete Services for a Clinic.
2. THE Platform SHALL store the following fields per Service: `name`, `description`, `image`, `price`, `currency`, `duration` (minutes), `qualifiedStaff[]` (list of Staff member IDs).
3. WHEN a Service is created, `name`, `price`, `currency`, and `duration` are required. `qualifiedStaff` is optional at creation but required before the service can be booked.
4. THE Platform SHALL allow Clinic_Admins to add or remove Staff members from a Service's `qualifiedStaff` list at any time.
5. THE Platform SHALL display the list of configured Services when a Staff member initiates an appointment booking.
6. THE `qualifiedStaff` list SHALL NOT be exposed to patients or leads - it is used exclusively by the Smart_Scheduling engine.
7. WHEN a Service is deleted, THE Platform SHALL retain the Service name and details on all existing appointments that reference that Service (soft reference preservation).
8. WHEN a Service is created, edited, or deleted, THE Platform SHALL record the action in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing `name` | `VALIDATION_ERROR` (field: `name`) |
| Missing `price` | `VALIDATION_ERROR` (field: `price`) |
| Missing `currency` | `VALIDATION_ERROR` (field: `currency`) |
| Missing `duration` | `VALIDATION_ERROR` (field: `duration`) |
| `duration` ≤ 0 | `VALIDATION_ERROR` (field: `duration`) |
| Booking a Service with no `qualifiedStaff` configured | `SERVICE_NO_QUALIFIED_STAFF` |

#### Correctness Properties

- For any appointment A referencing Service S, if S is deleted: `A.serviceName` and `A.serviceDetails` SHALL remain unchanged.
- For any Service S: `S.duration > 0`.
- `qualifiedStaff` is never returned in any patient-facing or web-component-facing GraphQL query.

---

### APT-2: Working Hours and Slot Availability

**User Story:** As a Clinic_Admin or Organization_Admin, I want to configure my clinic's working hours so that the booking system only offers valid time slots to patients.

#### Acceptance Criteria

1. THE Platform SHALL allow Clinic_Admins and Organization_Admins to configure Clinic_Working_Hours per day of the week, with `startTime` and `endTime` per day.
2. THE Platform SHALL allow individual days to be marked as closed (no appointments available).
3. WHEN Clinic_Working_Hours are updated, THE Platform SHALL apply the new schedule to all future slot availability calculations.
4. THE Platform SHALL derive available Appointment_Slots from Clinic_Working_Hours and the duration of the selected Service, excluding already-occupied slots.
5. Appointment_Slot availability shown to patients is based on Clinic_Working_Hours only - Staff_Availability is not factored into patient-facing slot display.
6. WHEN a Staff member or patient attempts to book a slot outside Clinic_Working_Hours, THE Platform SHALL reject the booking.
7. IF a Clinic has not configured a timezone, THE Platform SHALL reject any attempt to view or book appointment slots and return a `CLINIC_TIMEZONE_NOT_SET` error.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Booking slot outside Clinic_Working_Hours | `SLOT_OUTSIDE_WORKING_HOURS` |
| Booking on a closed day | `SLOT_OUTSIDE_WORKING_HOURS` |
| `startTime` ≥ `endTime` for a day | `VALIDATION_ERROR` |
| Clinic timezone not configured | `CLINIC_TIMEZONE_NOT_SET` |

#### Correctness Properties

- For any Appointment_Slot on day D: `slot.start ≥ Clinic_Working_Hours[D].start` and `slot.end ≤ Clinic_Working_Hours[D].end`.
- For any two appointments A1 and A2 on the same day in the same Clinic: their time slots SHALL NOT overlap.
- For any day D marked as closed: no Appointment_Slot SHALL be generated for D.

---

### APT-3: Appointment Booking by Staff

**User Story:** As a Staff member with appointment create permission, I want to book appointments for leads and patients so that I can schedule consultations on their behalf.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to book an appointment by selecting a Lead or Patient, a Service, and an available Appointment_Slot.
2. Each appointment has exactly one Service.
3. WHEN an appointment is booked, THE Platform SHALL set the initial status to `SCHEDULED`.
4. WHEN an appointment is booked, THE Platform SHALL send an email notification to the Lead's or Patient's email address.
5. THE Platform SHALL prevent double-booking of the same Appointment_Slot for the same Clinic.
6. WHEN an appointment is booked, THE Platform SHALL emit `AppointmentBooked` and record the action in the Audit_Log.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Selected slot already occupied | `SLOT_NOT_AVAILABLE` |
| Slot outside Working_Hours | `SLOT_OUTSIDE_WORKING_HOURS` |
| Lead or Patient not found | `NOT_FOUND` |
| Service not found | `NOT_FOUND` |

#### Correctness Properties

- For any Clinic C and any Appointment_Slot T: count of appointments in C with status `SCHEDULED` or `CONFIRMED` occupying slot T ≤ 1.
- For any newly booked appointment A: `A.status = SCHEDULED` immediately after creation.

---

### APT-4: Appointment Booking via Web Component

**User Story:** As a lead or patient, I want to book an appointment on the clinic website after completing my selfie analysis so that I can schedule a consultation without calling the clinic.

#### Acceptance Criteria

1. THE Platform SHALL provide an Appointment_Web_Component built with Stencil, embeddable on any clinic website.
2. WHEN a visitor completes the Selfie_Analysis flow, THE Platform SHALL offer the option to proceed to the Appointment_Web_Component.
3. THE Appointment_Web_Component SHALL display available Services and Appointment_Slots based on the Clinic's configuration.
4. WHEN a visitor books via the Appointment_Web_Component, THE Platform SHALL create an appointment record, emit `AppointmentBooked`, and send an email confirmation.
5. THE Platform SHALL authenticate the Appointment_Web_Component using a clinic-specific API key.
6. IF the clinic-specific API key is invalid or missing, THE Platform SHALL reject all booking requests.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Invalid or missing API key | `WEBHOOK_INVALID_API_KEY` |
| Selected slot already occupied | `SLOT_NOT_AVAILABLE` |
| Slot outside Working_Hours | `SLOT_OUTSIDE_WORKING_HOURS` |

#### Correctness Properties

- The Appointment_Slots displayed by the web component SHALL reflect the same availability as the Staff booking interface at the same point in time.

---

### APT-5: Appointment Calendar View

**User Story:** As a Staff member, I want to view all clinic appointments in a calendar so that I can quickly see the schedule and manage upcoming appointments.

#### Acceptance Criteria

1. THE Platform SHALL provide a Calendar_View as the main appointments page, displaying all appointments for the Clinic.
2. THE Calendar_View SHALL support day, week, and month display modes.
3. THE Calendar_View SHALL display each appointment with: patient/lead name, Service name, and Appointment_Status.
4. WHEN a Staff member clicks an appointment, THE Platform SHALL display the full appointment details.
5. THE Calendar_View SHALL reflect real-time updates when appointments are booked, rescheduled, or cancelled (via `appointmentStatusChanged` subscription).

---

### APT-6: Appointment Status Management

**User Story:** As a Staff member, I want to update appointment statuses so that the calendar accurately reflects the current state of each appointment.

#### Acceptance Criteria

1. THE Platform SHALL support the following valid status transitions:
   - `SCHEDULED → CONFIRMED`
   - `SCHEDULED → CANCELLED`
   - `SCHEDULED → NO_SHOW`
   - `CONFIRMED → COMPLETED`
   - `CONFIRMED → CANCELLED`
   - `CONFIRMED → NO_SHOW`
2. WHEN an appointment's status is changed, THE Platform SHALL record the change in the Audit_Log.
3. WHEN an appointment transitions to `COMPLETED`, THE Platform SHALL emit `AppointmentCompleted`.
4. IF a Staff member attempts an invalid status transition, THE Platform SHALL reject the change.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Invalid status transition | `INVALID_APPOINTMENT_STATUS_TRANSITION` |
| Appointment not found | `APPOINTMENT_NOT_FOUND` |

#### Correctness Properties

- For any appointment A: `A.status` SHALL only change via the valid transitions listed above.
- For any appointment A transitioned to `COMPLETED` with an associated Session S: an Invoice SHALL be generated for S within one processing cycle (via `AppointmentCompleted` event consumed by Billing module).

---

### APT-7: Appointment Rescheduling

**User Story:** As a Staff member or as a lead/patient, I want to reschedule an appointment so that I can change the date or time without cancelling and rebooking.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to reschedule any appointment in `SCHEDULED` or `CONFIRMED` status.
2. THE Platform SHALL allow leads and patients to reschedule their own appointments via the Appointment_Web_Component.
3. WHEN rescheduled, THE Platform SHALL send an email notification confirming the new date and time.
4. WHEN rescheduled, THE Platform SHALL emit `AppointmentRescheduled` and record the change in the Audit_Log including previous and new date/time.
5. THE Platform SHALL prevent rescheduling to a slot already occupied by another appointment.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| New slot already occupied | `SLOT_NOT_AVAILABLE` |
| New slot outside Working_Hours | `SLOT_OUTSIDE_WORKING_HOURS` |
| Appointment not in SCHEDULED or CONFIRMED status | `INVALID_APPOINTMENT_STATUS_TRANSITION` |
| Appointment not found | `APPOINTMENT_NOT_FOUND` |

#### Correctness Properties

- After rescheduling appointment A to slot T: no other appointment in the same Clinic SHALL occupy slot T.

---

### APT-8: Appointment Cancellation

**User Story:** As a Staff member or as a lead/patient, I want to cancel an appointment so that the slot is freed up for other bookings.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to cancel any appointment in `SCHEDULED` or `CONFIRMED` status.
2. THE Platform SHALL allow leads and patients to cancel their own appointments via the Appointment_Web_Component.
3. WHEN cancelled, THE Platform SHALL set status to `CANCELLED`, release the Appointment_Slot, emit `AppointmentCancelled`, and send an email notification.
4. WHEN cancelled, THE Platform SHALL record the cancellation in the Audit_Log.
5. IF a Staff member attempts to cancel an appointment in `COMPLETED` or `NO_SHOW` status, THE Platform SHALL reject the cancellation.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Cancelling a COMPLETED or NO_SHOW appointment | `APPOINTMENT_NOT_CANCELLABLE` |
| Appointment not found | `APPOINTMENT_NOT_FOUND` |

#### Correctness Properties

- After appointment A is cancelled, the Appointment_Slot previously occupied by A SHALL be available for new bookings.

---

### APT-9: Smart Scheduling Engine

> **Design note:** The Smart_Scheduling engine is intentionally defined as a separate, pluggable component. Its assignment logic can be updated independently without changing the booking flow or patient-facing API. New rules can be added or reordered without modifying other appointment requirements.

**User Story:** As a Clinic_Admin, I want the platform to automatically assign the most appropriate available staff member to each booked appointment so that patients are served by the right person without manual intervention.

#### Scheduling Trigger

WHEN an appointment is booked (by Staff or via web component), THE Platform SHALL invoke the Smart_Scheduling engine to assign a Staff member to that appointment. The assignment is internal and is NOT communicated to the patient.

#### Assignment Rules (evaluated in priority order)

The Smart_Scheduling engine SHALL apply the following rules in order, moving to the next rule only if the current rule yields no eligible candidate:

| Priority | Rule | Condition |
|----------|------|-----------|
| 1 | **Continuity of care** | If the booker is an existing Patient in this Clinic AND that Patient has a previous completed appointment for the same Service AND the previously assigned Staff member is in the `qualifiedStaff` list for this Service AND is available in the requested slot → assign that Staff member. |
| 2 | **Least busy qualified staff** | From the `qualifiedStaff` list for the Service, select the Staff member who is available in the requested slot AND has the fewest `SCHEDULED` or `CONFIRMED` appointments on that day. |
| 3 | **Any available qualified staff** | From the `qualifiedStaff` list, select any Staff member who is available in the requested slot, regardless of load. |
| 4 | **No assignment** | If no qualified Staff member is available in the requested slot, THE Platform SHALL still create the appointment with `assignedStaff = null` and flag it for manual assignment by a Clinic_Admin. |

#### Acceptance Criteria

1. THE Smart_Scheduling engine SHALL run automatically after every successful appointment booking.
2. THE assignment result SHALL be stored on the appointment record as `assignedStaffId`.
3. THE `assignedStaffId` SHALL NOT be exposed to patients or leads in any patient-facing or web-component-facing query.
4. WHEN no qualified Staff member is available (Rule 4), THE Platform SHALL notify the Clinic_Admin that the appointment requires manual staff assignment.
5. THE Platform SHALL allow a Clinic_Admin to manually override the assigned Staff member on any appointment at any time.
6. WHEN the assigned Staff member is manually overridden, THE Platform SHALL record the change in the Audit_Log including the previous and new assignee.
7. THE Smart_Scheduling logic SHALL be implemented as a separate, independently deployable service so that assignment rules can be updated without modifying the booking flow.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Service has no `qualifiedStaff` configured | `SERVICE_NO_QUALIFIED_STAFF` |

#### Correctness Properties

- For any appointment A with `assignedStaffId` set, the assigned Staff member SHALL be in the `qualifiedStaff` list of `A.service`.
- `assignedStaffId` is never returned in any patient-facing or web-component-facing GraphQL query.
- Rule priority is deterministic - for any given appointment, the same input state SHALL always produce the same assignment result.
- An appointment with `assignedStaff = null` SHALL be bookable - the slot is reserved even without an assignment.
