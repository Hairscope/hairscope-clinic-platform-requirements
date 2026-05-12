# Appointments

> Covers: Service configuration, working hours, appointment booking (staff and web component), calendar view, status lifecycle, rescheduling, and cancellation.
> Events emitted: `AppointmentBooked`, `AppointmentRescheduled`, `AppointmentCancelled`
> Events consumed: none

---

## Glossary

- **Service**: A treatment offering configured per Clinic with name, description, image, price, currency, duration, and a list of QualifiedStaff.
- **QualifiedStaff**: The set of Staff members configured as able to provide a specific Service. Used by the SmartScheduling engine for assignment.
- **AppointmentSlot**: A specific date/time window available for booking, derived from ClinicWorkingHours and existing appointments. Slot availability is patient-facing and does not expose staff details.
- **AppointmentStatus**: `SCHEDULED` | `CONFIRMED` | `COMPLETED` | `CANCELLED` | `NO_SHOW` - see `shared/enums.md`.
- **CalendarView**: The main appointments page displaying all appointments for a Clinic in a calendar layout.
- **AppointmentWebComponent**: The Stencil-based embeddable widget for leads/patients to book and manage appointments on a clinic website.
- **ClinicWorkingHours**: Per-day operating schedule for a Clinic. Drives patient-facing slot availability.
- **StaffAvailability**: Per-staff working schedule. Used internally by SmartScheduling. Never exposed to patients.
- **SmartScheduling**: The internal engine that assigns a qualified, available Staff member to a booked appointment. The assignment logic is pluggable and can be updated independently.

---

## Requirements

### APT-1: Service Selection for Appointments

**User Story:** As a Staff member with appointment create permission, I want to select a service from the clinic's catalog when booking an appointment so that the scheduling engine knows the duration and qualified staff.

> **Note:** Service configuration (creation, editing, deletion, qualifiedStaff management) is owned by the Catalog Module (`modules/catalog.md`, CAT-1 and CAT-3). The Appointments module consumes catalog items of type `SERVICE` for booking.

#### Acceptance Criteria

1. THE Platform SHALL display the list of configured SERVICE catalog items when a Staff member or patient initiates an appointment booking.
2. Each appointment references exactly one SERVICE catalog item.
3. THE Platform SHALL use the SERVICE item's `duration` field to calculate slot availability.
4. THE Platform SHALL NOT allow booking a SERVICE that has no `qualifiedStaff` configured.
5. THE `qualifiedStaff` list SHALL NOT be exposed to patients or leads — it is used exclusively by the SmartScheduling engine.
6. WHEN a SERVICE catalog item is deleted (handled by Catalog Module CAT-4), all future appointments referencing that service are cancelled with notifications.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Booking a Service with no `qualifiedStaff` configured | `SERVICE_NO_QUALIFIED_STAFF` |
| Service not found | `NOT_FOUND` |

#### Correctness Properties

- For any appointment A referencing SERVICE item S: `S.duration > 0`.
- For any appointment A referencing a deleted SERVICE item S: `A.serviceName` and `A.serviceDetails` SHALL remain unchanged (snapshot preserved by Catalog Module).
- `qualifiedStaff` is never returned in any patient-facing or web-component-facing GraphQL query.

---

### APT-2: Working Hours and Slot Availability

**User Story:** As a ClinicAdmin or OrganizationAdmin, I want to configure my clinic's working hours so that the booking system only offers valid time slots to patients.

#### Acceptance Criteria

1. THE Platform SHALL allow ClinicAdmins and OrganizationAdmins to configure ClinicWorkingHours per day of the week, with `startTime` and `endTime` per day.
2. THE Platform SHALL allow individual days to be marked as closed (no appointments available).
3. WHEN ClinicWorkingHours are updated, THE Platform SHALL apply the new schedule to all future slot availability calculations.
4. THE Platform SHALL derive available AppointmentSlots from ClinicWorkingHours and the duration of the selected Service, excluding already-occupied slots.
5. AppointmentSlot availability shown to patients is based on ClinicWorkingHours only - StaffAvailability is not factored into patient-facing slot display.
6. WHEN a Staff member or patient attempts to book a slot outside ClinicWorkingHours, THE Platform SHALL reject the booking.
7. IF a Clinic has not configured a timezone, THE Platform SHALL reject any attempt to view or book appointment slots and return a `CLINIC_TIMEZONE_NOT_SET` error.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Booking slot outside ClinicWorkingHours | `SLOT_OUTSIDE_WORKING_HOURS` |
| Booking on a closed day | `SLOT_OUTSIDE_WORKING_HOURS` |
| `startTime` ≥ `endTime` for a day | `VALIDATION_ERROR` |
| Clinic timezone not configured | `CLINIC_TIMEZONE_NOT_SET` |

#### Correctness Properties

- For any AppointmentSlot on day D: `slot.start ≥ ClinicWorkingHours[D].start` and `slot.end ≤ ClinicWorkingHours[D].end`.
- For any two appointments A1 and A2 on the same day in the same Clinic: their time slots SHALL NOT overlap.
- For any day D marked as closed: no AppointmentSlot SHALL be generated for D.

---

### APT-3: Appointment Booking by Staff

**User Story:** As a Staff member with appointment create permission, I want to book appointments for leads and patients so that I can schedule consultations on their behalf.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to book an appointment by selecting a Lead or Patient, a Service, and an available AppointmentSlot.
2. Each appointment has exactly one Service.
3. Each appointment record SHALL store both `leadId` (nullable) and `patientId` (nullable). `leadId` is set when the appointment is booked for a Lead. `patientId` is set when booked for a Patient.
4. WHEN a Lead is converted to a Patient (LM-10) and that Lead has active appointments (`SCHEDULED` or `CONFIRMED`), THE Platform SHALL update those appointments to also set `patientId` to the newly created Patient's ID. The `leadId` remains unchanged for reference.
5. WHEN an appointment with a `patientId` transitions to `CONFIRMED` status, THE Platform SHALL automatically create a `DRAFT` Session for that Patient (if one does not already exist for the same `sessionType` in that Clinic).
6. WHEN an appointment is booked, THE Platform SHALL set the initial status to `SCHEDULED`.
7. WHEN an appointment is booked, THE Platform SHALL send an email notification to the Lead's or Patient's email address.
8. THE Platform SHALL prevent double-booking of the same AppointmentSlot for the same Clinic.
9. WHEN an appointment is booked, THE Platform SHALL emit `AppointmentBooked` and record the action in the AuditLog.
10. THE Platform SHALL support walk-in appointments: Staff can create an appointment directly from the calendar page without prior booking, setting the status immediately to `CONFIRMED`.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Selected slot already occupied | `SLOT_NOT_AVAILABLE` |
| Slot outside WorkingHours | `SLOT_OUTSIDE_WORKING_HOURS` |
| Lead or Patient not found | `NOT_FOUND` |
| Service not found | `NOT_FOUND` |

#### Correctness Properties

- For any Clinic C and any AppointmentSlot T: count of appointments in C with status `SCHEDULED` or `CONFIRMED` occupying slot T ≤ 1.
- For any newly booked appointment A: `A.status = SCHEDULED` immediately after creation.

---

### APT-4: Appointment Booking via Web Component

**User Story:** As a lead or patient, I want to book an appointment on the clinic website after completing my selfie analysis so that I can schedule a consultation without calling the clinic.

#### Acceptance Criteria

1. THE Platform SHALL provide an AppointmentWebComponent built with Stencil, embeddable on any clinic website.
2. WHEN a visitor completes the SelfieAnalysis flow, THE Platform SHALL offer the option to proceed to the AppointmentWebComponent.
3. THE AppointmentWebComponent SHALL display available SERVICE catalog items and AppointmentSlots based on the Clinic's configuration.
4. WHEN a visitor books via the AppointmentWebComponent, THE Platform SHALL create an appointment record, emit `AppointmentBooked`, and send an email confirmation.
5. THE Platform SHALL authenticate the AppointmentWebComponent using a organization-specific API key.
6. IF the organization-specific API key is invalid or missing, THE Platform SHALL reject all booking requests.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Invalid or missing API key | `WEBHOOK_INVALID_API_KEY` |
| Selected slot already occupied | `SLOT_NOT_AVAILABLE` |
| Slot outside WorkingHours | `SLOT_OUTSIDE_WORKING_HOURS` |

#### Correctness Properties

- The AppointmentSlots displayed by the web component SHALL reflect the same availability as the Staff booking interface at the same point in time.

---

### APT-5: Appointment Calendar View

**User Story:** As a Staff member, I want to view all clinic appointments in a calendar so that I can quickly see the schedule and manage upcoming appointments.

#### Acceptance Criteria

1. THE Platform SHALL provide a CalendarView as the main appointments page, displaying all appointments for the Clinic.
2. THE CalendarView SHALL support day, week, and month display modes.
3. THE CalendarView SHALL display each appointment with: patient/lead name, Service name, and AppointmentStatus.
4. WHEN a Staff member clicks an appointment, THE Platform SHALL display the full appointment details.
5. THE CalendarView SHALL reflect real-time updates when appointments are booked, rescheduled, or cancelled (via `appointmentStatusChanged` subscription).

---

### APT-6: Appointment Status Management

**User Story:** As a Staff member, I want to update appointment statuses so that the calendar accurately reflects the current state of each appointment.

#### Acceptance Criteria

1. THE Platform SHALL support the following valid status transitions:
   - `SCHEDULED → CONFIRMED` (by Staff manually, or by Patient via confirmation link/web component)
   - `SCHEDULED → CANCELLED`
   - `SCHEDULED → NO_SHOW`
   - `CONFIRMED → COMPLETED`
   - `CONFIRMED → CANCELLED`
   - `CONFIRMED → NO_SHOW`
2. THE Platform SHALL allow both Staff and Patients/Leads to trigger `SCHEDULED → CONFIRMED`. Staff may confirm after calling the patient; patients may confirm via a link in their booking confirmation email or via the web component.
2. WHEN an appointment's status is changed, THE Platform SHALL record the change in the AuditLog.
3. IF a Staff member attempts an invalid status transition, THE Platform SHALL reject the change.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Invalid status transition | `INVALID_APPOINTMENT_STATUS_TRANSITION` |
| Appointment not found | `APPOINTMENT_NOT_FOUND` |

#### Correctness Properties

- For any appointment A: `A.status` SHALL only change via the valid transitions listed above.

---

### APT-7: Appointment Rescheduling

**User Story:** As a Staff member or as a lead/patient, I want to reschedule an appointment so that I can change the date or time without cancelling and rebooking.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to reschedule any appointment in `SCHEDULED` or `CONFIRMED` status.
2. THE Platform SHALL allow leads and patients to reschedule their own appointments via the AppointmentWebComponent.
3. WHEN rescheduled, THE Platform SHALL send an email notification confirming the new date and time.
4. WHEN rescheduled, THE Platform SHALL emit `AppointmentRescheduled` and record the change in the AuditLog including previous and new date/time.
5. THE Platform SHALL prevent rescheduling to a slot already occupied by another appointment.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| New slot already occupied | `SLOT_NOT_AVAILABLE` |
| New slot outside WorkingHours | `SLOT_OUTSIDE_WORKING_HOURS` |
| Appointment not in SCHEDULED or CONFIRMED status | `INVALID_APPOINTMENT_STATUS_TRANSITION` |
| Appointment not found | `APPOINTMENT_NOT_FOUND` |

#### Correctness Properties

- After rescheduling appointment A to slot T: no other appointment in the same Clinic SHALL occupy slot T.

---

### APT-8: Appointment Cancellation

**User Story:** As a Staff member or as a lead/patient, I want to cancel an appointment so that the slot is freed up for other bookings.

#### Acceptance Criteria

1. THE Platform SHALL allow Staff to cancel any appointment in `SCHEDULED` or `CONFIRMED` status.
2. THE Platform SHALL allow leads and patients to cancel their own appointments via the AppointmentWebComponent.
3. WHEN cancelled, THE Platform SHALL set status to `CANCELLED`, release the AppointmentSlot, emit `AppointmentCancelled`, and send an email notification.
4. WHEN cancelled, THE Platform SHALL record the cancellation in the AuditLog.
5. IF a Staff member attempts to cancel an appointment in `COMPLETED` or `NO_SHOW` status, THE Platform SHALL reject the cancellation.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Cancelling a COMPLETED or NO_SHOW appointment | `APPOINTMENT_NOT_CANCELLABLE` |
| Appointment not found | `APPOINTMENT_NOT_FOUND` |

#### Correctness Properties

- After appointment A is cancelled, the AppointmentSlot previously occupied by A SHALL be available for new bookings.

---

### APT-9: Smart Scheduling Engine

> **Design note:** The SmartScheduling engine is intentionally defined as a separate, pluggable component. Its assignment logic can be updated independently without changing the booking flow or patient-facing API. New rules can be added or reordered without modifying other appointment requirements.

**User Story:** As a ClinicAdmin, I want the platform to automatically assign the most appropriate available staff member to each booked appointment so that patients are served by the right person without manual intervention.

#### Scheduling Trigger

WHEN an appointment is booked (by Staff or via web component), THE Platform SHALL invoke the SmartScheduling engine to assign a Staff member to that appointment. The assignment is internal and is NOT communicated to the patient.

#### Assignment Rules (evaluated in priority order)

The SmartScheduling engine SHALL apply the following rules in order, moving to the next rule only if the current rule yields no eligible candidate:

> **Note:** Inactive (deactivated) Staff members remain in the `qualifiedStaff` list but are excluded from SmartScheduling consideration. Only `ACTIVE` Staff members with configured availability are eligible for assignment.

| Priority | Rule | Condition |
|----------|------|-----------|
| 1 | **Continuity of care** | If the booker is an existing Patient in this Clinic AND that Patient has a previous completed appointment for the same Service AND the previously assigned Staff member is in the `qualifiedStaff` list for this Service AND is available in the requested slot → assign that Staff member. |
| 2 | **Least busy qualified staff** | From the `qualifiedStaff` list for the Service, select the Staff member who is available in the requested slot AND has the fewest `SCHEDULED` or `CONFIRMED` appointments on that day. |
| 3 | **Any available qualified staff** | From the `qualifiedStaff` list, select any Staff member who is available in the requested slot, regardless of load. |
| 4 | **No assignment** | If no qualified Staff member is available in the requested slot, THE Platform SHALL still create the appointment with `assignedStaff = null` and flag it for manual assignment by a ClinicAdmin. |

#### Acceptance Criteria

1. THE SmartScheduling engine SHALL run automatically after every successful appointment booking.
2. THE assignment result SHALL be stored on the appointment record as `assignedStaffId`.
3. THE `assignedStaffId` SHALL NOT be exposed to patients or leads in any patient-facing or web-component-facing query.
4. WHEN no qualified Staff member is available (Rule 4), THE Platform SHALL notify the ClinicAdmin that the appointment requires manual staff assignment.
5. THE Platform SHALL allow a ClinicAdmin to manually override the assigned Staff member on any appointment at any time.
6. WHEN the assigned Staff member is manually overridden, THE Platform SHALL record the change in the AuditLog including the previous and new assignee.
7. THE SmartScheduling logic SHALL be implemented as a separate, independent engine so that assignment rules can be updated without modifying the booking flow.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Service has no `qualifiedStaff` configured | `SERVICE_NO_QUALIFIED_STAFF` |

#### Correctness Properties

- For any appointment A with `assignedStaffId` set, the assigned Staff member SHALL be in the `qualifiedStaff` list of `A.service`.
- `assignedStaffId` is never returned in any patient-facing or web-component-facing GraphQL query.
- Rule priority is deterministic - for any given appointment, the same input state SHALL always produce the same assignment result.
- An appointment with `assignedStaff = null` SHALL be bookable - the slot is reserved even without an assignment.


---

### APT-10: Appointment Completion and Next Visit Scheduling

**User Story:** As a Staff member, I want to mark an appointment as completed and optionally schedule the patient's next visit so that continuity of care is maintained.

#### Acceptance Criteria

1. WHEN a Staff member marks an appointment as `COMPLETED`, THE Platform SHALL present an option to schedule a next visit appointment for the same Patient.
2. IF the Staff member chooses to schedule a next visit, THE Platform SHALL display the service selection and slot booking flow (same as APT-3) pre-populated with the same service and patient.
3. THE next visit appointment SHALL be a new independent appointment record — not linked to the completed one.
4. THE Platform SHALL allow the Staff member to skip next visit scheduling and simply complete the appointment without booking a follow-up.
5. Appointment completion is independent of session completion — an appointment can be completed without a session, and a session can be completed without the appointment being marked complete.

#### Correctness Properties

- Completing an appointment SHALL NOT automatically complete any linked session.
- Completing a session SHALL NOT automatically complete any linked appointment.
- The next visit appointment (if created) SHALL follow all standard booking rules (slot availability, SmartScheduling, etc.).

---

### APT-11: Appointment Cancellation Cascade

**User Story:** As a Staff member, I want draft sessions to be automatically cleaned up when their linked appointment is cancelled so that orphaned data doesn't accumulate.

#### Acceptance Criteria

1. WHEN an appointment is cancelled and it has a linked `DRAFT` Session, THE Platform SHALL automatically delete that DRAFT Session and emit `SessionDeleted`.
2. IF the linked Session is in `SAVED` or `COMPLETED` status, THE Platform SHALL NOT delete it — only DRAFT sessions are affected by appointment cancellation.
3. THE Platform SHALL record the cascade deletion in the AuditLog.

#### Correctness Properties

- For any cancelled appointment A with a linked DRAFT Session S: S SHALL be deleted.
- For any cancelled appointment A with a linked SAVED or COMPLETED Session S: S SHALL remain unchanged.

---

## Import / Export

> **Status: Deferred** — Import and Export functionality for this module will be available in later versions. See `requirements.md` Section 10.3 for the platform-wide import/export rules. This module will support bulk import and export via CSV and Excel formats.
