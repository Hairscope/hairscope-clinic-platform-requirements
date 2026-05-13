# Reminder Service

> Covers: Time-based workflow orchestration, schedule creation, cron/queue scanning, recurrence rules, due detection, missed reminder handling, pause/resume, and timezone normalization.
> Events consumed: `AppointmentBooked`, `AppointmentRescheduled`, `AppointmentCancelled`, `SessionCompleted` (for future routine reminders)
> Events emitted: `ReminderDue`, `ReminderMissed`, `ReminderScheduleCreated`, `ReminderScheduleCancelled`

> **Architectural note:** The Reminder Service is an infrastructure-layer service responsible for time-based workflow orchestration. It does NOT deliver notifications — it emits `ReminderDue` events which are consumed by the Notification Service for actual delivery. The Reminder Service owns schedule state and evaluates time conditions.

---

## Glossary

- **ReminderSchedule**: A persistent record defining when and how often a reminder should fire. Contains: trigger event reference, recurrence rules, recipient, timezone, and status.
- **ReminderRule**: A business rule defining when reminders should be created and at what intervals. Owned by the Communication Policy Module. The service executes rules but does not define them.
- **RecurrencePattern**: Defines how a reminder repeats. Values: `ONCE` (single fire), `RECURRING` (repeats on a schedule until cancelled or end date).
- **ReminderStatus**: `SCHEDULED` | `DUE` | `FIRED` | `MISSED` | `CANCELLED` | `PAUSED`.
- **DueDetection**: The process of scanning scheduled reminders and identifying those whose fire time has arrived.
- **MissedReminder**: A reminder whose fire time has passed without being processed (e.g., due to system downtime). The service detects and handles these on recovery.
- **TimezoneNormalization**: Converting reminder fire times from the Clinic's configured timezone to UTC for storage, and back to local timezone for evaluation.

---

## Requirements

### RSE-1: Schedule Creation from Domain Events

**User Story:** As a platform service, I want reminder schedules to be automatically created when relevant domain events occur so that patients and staff receive timely reminders without manual setup.

#### Acceptance Criteria

1. WHEN an `AppointmentBooked` event is received, THE Reminder Service SHALL create reminder schedules based on the active ReminderRules configured in the Communication Policy Module for that Clinic/Organization.
2. THE Service SHALL support creating multiple reminder schedules per triggering event (e.g., 24h before + 2h before an appointment).
3. EACH reminder schedule SHALL contain: `triggerId` (source event/entity ID), `triggerType` (e.g., APPOINTMENT), `recipientId`, `recipientType`, `fireAt` (UTC), `timezone`, `ruleId` (reference to the Communication Policy rule), `status`, `recurrencePattern`.
4. THE Service SHALL calculate `fireAt` by applying the rule's offset to the event's reference time (e.g., appointment start time minus 24 hours), normalized to UTC.
5. THE Service SHALL store all fire times in UTC but evaluate them relative to the Clinic's configured timezone.
6. WHEN an `AppointmentRescheduled` event is received, THE Service SHALL update all pending reminder schedules for that appointment to reflect the new time.
7. WHEN an `AppointmentCancelled` event is received, THE Service SHALL cancel all pending reminder schedules for that appointment.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| No active reminder rules configured | No schedules created (silent) |
| Appointment time is in the past | No schedules created for past fire times |
| Reminder fire time already passed (e.g., appointment in 1h, rule is 24h before) | That specific reminder is skipped; others still created |

#### Correctness Properties

- For any appointment A booked at time T with reminder rule R (offset O): a reminder schedule SHALL be created with `fireAt = A.startTime - O` (in UTC).
- For any cancelled appointment A: all reminder schedules referencing A SHALL have status `CANCELLED`.
- For any rescheduled appointment A: all pending reminder schedules SHALL have `fireAt` recalculated based on the new start time.

---

### RSE-2: Due Detection and Firing

**User Story:** As a platform operator, I want the service to continuously scan for due reminders and emit events so that the Notification Service can deliver them on time.

#### Acceptance Criteria

1. THE Service SHALL continuously scan for reminder schedules where `fireAt ≤ now()` and `status = SCHEDULED`.
2. WHEN a reminder is detected as due, THE Service SHALL:
   - Set status to `FIRED`
   - Emit a `ReminderDue` event containing: `reminderId`, `triggerId`, `triggerType`, `recipientId`, `recipientType`, `ruleId`, `templateId`, `templateVariables`
3. THE scanning interval SHALL be configurable (default: every 30 seconds).
4. THE Service SHALL process due reminders in batches to handle high volumes efficiently.
5. THE Service SHALL use distributed locking to prevent duplicate firing when multiple service instances are running.
6. AFTER a `ReminderDue` event is emitted, the Notification Service is responsible for actual delivery. The Reminder Service's responsibility ends at emission.
7. Reminder schedules MAY exist without triggering notifications — if the Communication Policy has no active notification rule for the reminder type, the `ReminderDue` event is emitted but no notification is delivered. The reminder still fires and is recorded.

#### Correctness Properties

- For any reminder schedule S with `fireAt = T` and `status = SCHEDULED`: S SHALL transition to `FIRED` within the scanning interval after T.
- For any reminder schedule S: exactly one `ReminderDue` event SHALL be emitted for S, regardless of how many service instances are running.
- The Reminder Service SHALL NOT deliver notifications directly. It only emits `ReminderDue` events.

---

### RSE-3: Missed Reminder Handling

**User Story:** As a platform operator, I want the service to detect and handle reminders that were missed due to system downtime so that no reminder is silently lost.

#### Acceptance Criteria

1. WHEN the service starts or recovers from downtime, THE Service SHALL scan for reminders where `fireAt < now()` and `status = SCHEDULED` (missed reminders).
2. FOR missed reminders where the reference event is still in the future (e.g., appointment hasn't happened yet), THE Service SHALL fire them immediately and emit `ReminderDue`.
3. FOR missed reminders where the reference event is in the past (e.g., appointment already happened), THE Service SHALL set status to `MISSED` and emit `ReminderMissed` for operational monitoring.
4. THE Service SHALL NOT fire missed reminders for cancelled triggers.

#### Correctness Properties

- For any missed reminder M where the associated appointment is still in the future: M SHALL be fired (late delivery is better than no delivery).
- For any missed reminder M where the associated appointment is in the past: M SHALL be marked `MISSED` and NOT fired.

---

### RSE-4: Recurrence Support

**User Story:** As a platform operator, I want the service to support recurring reminders so that future features like routine reminders for the Care App can be built on this foundation.

#### Acceptance Criteria

1. THE Service SHALL support `RecurrencePattern` values: `ONCE` and `RECURRING`.
2. FOR `ONCE` reminders: the schedule fires exactly once and transitions to `FIRED`.
3. FOR `RECURRING` reminders: after firing, THE Service SHALL calculate the next `fireAt` based on the recurrence rule (e.g., daily, weekly) and create a new schedule entry.
4. `RECURRING` reminders SHALL continue until: an explicit cancellation, an end date is reached, or the maximum recurrence count is hit.
5. THE Service SHALL support recurrence intervals: `DAILY`, `WEEKLY`, `MONTHLY`, and custom intervals defined in minutes/hours/days.

#### Correctness Properties

- For any `ONCE` reminder R: exactly one `ReminderDue` event SHALL be emitted over R's lifetime.
- For any `RECURRING` reminder R with interval I: `ReminderDue` events SHALL be emitted at intervals of I until cancellation or end date.

---

### RSE-5: Pause and Resume

**User Story:** As a ClinicAdmin, I want to pause reminders for a specific patient or appointment so that I can handle special cases without cancelling the entire schedule.

#### Acceptance Criteria

1. THE Service SHALL support pausing individual reminder schedules, setting status to `PAUSED`.
2. WHEN a reminder is paused, THE Service SHALL skip it during due detection scanning.
3. THE Service SHALL support resuming a paused reminder, setting status back to `SCHEDULED`.
4. IF a paused reminder's `fireAt` has passed when resumed, THE Service SHALL apply missed reminder handling logic (RSE-3).
5. THE Service SHALL support pausing all reminders for a specific trigger (e.g., all reminders for appointment X).

#### Correctness Properties

- For any reminder R with `status = PAUSED`: no `ReminderDue` event SHALL be emitted for R until it is resumed.
- For any reminder R resumed after its `fireAt`: missed reminder handling SHALL apply.

---

### RSE-6: Timezone Normalization

**User Story:** As a platform operator, I want all reminder scheduling to respect the Clinic's timezone so that reminders arrive at the correct local time for recipients.

#### Acceptance Criteria

1. THE Service SHALL store all `fireAt` values in UTC.
2. WHEN calculating `fireAt` from a rule offset and reference time, THE Service SHALL perform the calculation in the Clinic's configured timezone, then convert to UTC for storage.
3. WHEN evaluating quiet hours or business-hour constraints, THE Service SHALL convert UTC back to the recipient's local timezone.
4. IF a Clinic's timezone changes, THE Service SHALL NOT retroactively recalculate existing schedules. Only future schedules use the new timezone.
5. THE Service SHALL handle DST transitions correctly — a "24 hours before" reminder SHALL always be exactly 24 clock-hours before the event in the Clinic's timezone, even across DST boundaries.

#### Correctness Properties

- For any reminder R with rule "24h before appointment" and appointment at 10:00 local time: R SHALL fire at 10:00 local time the previous day, regardless of DST transitions.
- All persisted `fireAt` values SHALL be in UTC.
