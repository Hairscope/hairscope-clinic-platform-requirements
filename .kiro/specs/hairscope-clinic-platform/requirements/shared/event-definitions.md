# Event Definitions

> All cross-module communication uses domain events. No module may directly call another module's internal logic. This file is the authoritative registry of all domain events.

---

## Event Envelope

Every event has this structure:

```json
{
  "eventId": "uuid-v4",
  "eventType": "EventName",
  "version": "1.0",
  "occurredAt": "2025-04-21T10:30:00Z",
  "organizationId": "uuid",
  "clinicId": "uuid | null",
  "actorId": "uuid | null",
  "payload": { }
}
```

- `eventId` - unique per event emission
- `version` - event schema version; consumers must handle version mismatches gracefully
- `clinicId` - null for organization-level events
- `actorId` - null for system-generated events (e.g., async completions)

---

## Transactional Outbox Pattern

> All domain events SHALL be emitted using the **Transactional Outbox Pattern**. No event may be published directly from application code outside a database transaction.

### Principle

Whenever a state-changing operation emits a domain event, the following writes MUST succeed atomically within a single database transaction:

1. Domain state mutation  
2. AuditLog append  
3. OutboxEvent insert  

If any of the three operations fails, THE Platform SHALL rollback the entire transaction.

No partial commit is permitted.

---

### OutboxEvent Schema

Each pending event SHALL be stored in the `OutboxEvent` collection with the following structure:

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID v4 | Unique outbox record ID |
| `eventId` | UUID v4 | Unique domain event ID |
| `eventType` | String | Event name (for example `SessionCompleted`) |
| `version` | String | Event schema version (for example `1.0`) |
| `aggregateType` | String | Aggregate that emitted the event (for example `SESSION`) |
| `aggregateId` | UUID | Aggregate identifier |
| `organizationId` | UUID | Tenant scope |
| `clinicId` | UUID \| null | Clinic scope (null for org-level events) |
| `payload` | JSON | Event payload |
| `status` | Enum | `PENDING` \| `PROCESSING` \| `PUBLISHED` \| `FAILED` |
| `attemptCount` | Integer | Number of publish attempts |
| `nextRetryAt` | ISO8601 UTC \| null | Next scheduled retry time |
| `publishedAt` | ISO8601 UTC \| null | Timestamp when published successfully |
| `lastError` | String \| null | Last publish failure reason |
| `createdAt` | ISO8601 UTC | Record creation time |

---

### Publish Flow

Every event emission SHALL follow this flow:

```text
GraphQL Mutation
    ↓
DB Transaction
    ├─ write domain state
    ├─ write audit log
    └─ write outbox row
commit
    ↓
Outbox Dispatcher polls pending rows
    ↓
Publish to Event Bus
    ↓
Mark row as PUBLISHED
```

Application code SHALL NEVER publish directly to the event bus during request handling.

The request transaction only writes to the Outbox.

Publishing is performed asynchronously by the Outbox Dispatcher.

---

### Retry Policy

If publishing fails:

1. THE Platform SHALL increment `attemptCount`
2. THE Platform SHALL schedule `nextRetryAt` using exponential backoff
3. THE Platform SHALL retry until `attemptCount = 10`
4. AFTER 10 failed attempts, THE Platform SHALL mark the row as `FAILED`
5. THE Platform SHALL generate an operational alert for failed rows

Retry schedule example:

| Attempt | Delay |
|--------|------|
| 1 | 30 seconds |
| 2 | 1 minute |
| 3 | 2 minutes |
| 4 | 4 minutes |
| 5+ | capped at 15 minutes |

---

### Delivery Guarantee

The Outbox provides:

> **At least once delivery**

Consumers MUST therefore be idempotent.

Every consumer SHALL store processed `eventId` values and ignore duplicates.

Duplicate event delivery MUST NOT produce duplicate side effects.

---

### Ordering Guarantee

Event ordering SHALL be guaranteed **per aggregate**.

For a single aggregate:

```text
SessionSaved
SessionCompleted
AnnotationEditSaved
```

THE Platform SHALL publish events in that order for the same `aggregateId`.

Ordering across unrelated aggregates is NOT guaranteed.

---

### Dispatcher Rules

The Outbox Dispatcher SHALL:

- poll rows where `status = PENDING`
- claim rows atomically by changing status to `PROCESSING`
- publish to the Event Bus
- mark successful rows as `PUBLISHED`
- reschedule failed rows according to retry policy
- avoid double-claiming rows in concurrent dispatcher workers

Dispatcher workers MAY run on multiple nodes concurrently.

Row claiming MUST be atomic.

---

### Forbidden

Application code MUST NOT:

```ts
eventBus.publish(...)
```

inside:

- GraphQL resolvers  
- Domain services  
- Repositories  
- Mutation handlers  

Direct publishing is forbidden.

Only the Outbox Dispatcher may publish domain events.

---

### Retention

Outbox rows with status `PUBLISHED` SHALL be retained for **90 days** for operational debugging and replay safety.

After retention expiry:

- rows MAY be archived, or
- rows MAY be permanently deleted

Rows in `FAILED` status SHALL be retained until operational resolution.

---

### Monitoring

THE Platform SHALL monitor:

- pending row count
- failed row count
- retry count distribution
- oldest pending row age
- dispatcher publish latency

IF oldest pending row age exceeds **5 minutes**, THE Platform SHALL raise an operational alert.

---

### Correctness Properties

- No domain event SHALL be lost after a successful transaction commit.
- No event SHALL be published if the corresponding domain mutation failed.
- Every emitted event SHALL have exactly one persisted OutboxEvent row.
- Duplicate delivery SHALL be harmless due to consumer idempotency.
- Domain state, audit log, and emitted event SHALL remain consistent.

---

## Session Events

### `SessionSaved`
Emitted when a Session transitions from `DRAFT` to `SAVED`.

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "trichoscopyImageIds": ["uuid"],
  "globalImageIds": ["uuid"]
}
```

**Consumers:**
- AI Analysis Service → triggers async image analysis

---

### `SessionCompleted`
Emitted when AI analysis finishes and the Session transitions to `COMPLETED`.

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "savedByStaffId": "uuid"
}
```

**Consumers:**
- Report Module → triggers PDF report generation
- Notification Service → sends AI analysis complete notification to Staff
- Reminder Service → creates follow-up reminder schedules (if configured)

> Billing does NOT consume `SessionCompleted` — invoices are generated by a manual "Generate Invoice" action (BIL-1).

---

### `SessionDeleted`
Emitted when a Draft Session is permanently deleted.

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid"
}
```

**Consumers:**
- Storage Service → purges associated image files

---

### `AnnotationEditSaved`
Emitted when a Staff member saves edits to TrichoscopyImage annotations.

**Payload:**
```json
{
  "sessionId": "uuid",
  "trichoscopyImageId": "uuid",
  "clinicId": "uuid"
}
```

**Consumers:**
- Report Module → triggers Report regeneration

---

## AI Analysis Events

### `AIAnalysisCompleted`
Emitted by the AI Analysis Service when analysis for a Session is complete.

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "results": {
    "globalImages": [{ "imageId": "uuid", "hairLossStage": "string" }],
    "trichoscopyImages": [{
      "imageId": "uuid",
      "hairCount": "number",
      "density": "number",
      "thickness": "number",
      "follicles": [],
      "strands": []
    }]
  }
}
```

**Consumers:**
- Session Module → updates Session status to `COMPLETED`
- Notification Service → sends in-app + push notification to Staff

---

### `AIAnalysisFailed`
Emitted when AI analysis fails after maximum retries.

**Payload:**
```json
{
  "sessionId": "uuid",
  "clinicId": "uuid",
  "failedImageIds": ["uuid"],
  "reason": "string"
}
```

**Consumers:**
- Session Module → marks affected images with `FAILED` status
- Notification Service → notifies Staff of failure

---

## Report Events

### `ReportGenerated`
Emitted when a PDF Report is successfully generated.

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "reportUrl": "string",
  "reportId": "uuid"
}
```

**Consumers:**
- Session Module → attaches report URL to Session
- Notification Service → notifies Staff

---

### `ReportRegenerated`
Emitted when a Report is regenerated due to post-completion edits.

**Payload:**
```json
{
  "sessionId": "uuid",
  "reportId": "uuid",
  "clinicId": "uuid",
  "trigger": "ANNOTATION_EDIT | PRODUCT_EDIT | DOCTOR_NOTE_EDIT"
}
```

**Consumers:**
- Session Module → updates report URL

---

## Lead Events

### `LeadCreated`
Emitted when a new Lead is created (any source).

**Payload:**
```json
{
  "leadId": "uuid",
  "clinicId": "uuid",
  "source": "MANUAL | WEBHOOK | SELFIE_ANALYSIS",
  "email": "string | null",
  "phone": "string | null"
}
```

**Consumers:**
- Notification Service → notifies relevant Staff (if configured)

---

### `LeadConverted`
Emitted when a Lead is converted to a Patient.

**Payload:**
```json
{
  "leadId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "convertedByStaffId": "uuid"
}
```

**Consumers:**
- Patient Module → creates Patient record with Lead data
- Notification Service → notifies Staff

---

## Appointment Events

### `AppointmentBooked`
Emitted when a new Appointment is created.

**Payload:**
```json
{
  "appointmentId": "uuid",
  "clinicId": "uuid",
  "serviceId": "uuid",
  "slotStart": "ISO8601 UTC",
  "slotEnd": "ISO8601 UTC",
  "patientId": "uuid | null",
  "leadId": "uuid | null",
  "bookedByStaffId": "uuid | null",
  "source": "STAFF | WEB_COMPONENT"
}
```

**Consumers:**
- Notification Service → sends email confirmation to patient/lead
- SmartScheduling Service → triggers staff assignment
- Reminder Service → creates appointment reminder schedules

---

### `AppointmentRescheduled`
Emitted when an Appointment's slot is changed.

**Payload:**
```json
{
  "appointmentId": "uuid",
  "clinicId": "uuid",
  "previousSlotStart": "ISO8601 UTC",
  "newSlotStart": "ISO8601 UTC",
  "newSlotEnd": "ISO8601 UTC"
}
```

**Consumers:**
- Notification Service → sends reschedule confirmation email
- Reminder Service → updates reminder schedules to reflect new time

---

### `AppointmentCancelled`
Emitted when an Appointment is cancelled.

**Payload:**
```json
{
  "appointmentId": "uuid",
  "clinicId": "uuid",
  "cancelledByStaffId": "uuid | null",
  "source": "STAFF | WEB_COMPONENT"
}
```

**Consumers:**
- Notification Service → sends cancellation email
- Slot availability service → releases the slot
- Sessions Module → deletes linked DRAFT session if one exists (APT-11)
- Reminder Service → cancels all pending reminder schedules for this appointment

---

### `StaffAssigned`
Emitted by the SmartScheduling Service when a Staff member is assigned to an appointment.

**Payload:**
```json
{
  "appointmentId": "uuid",
  "clinicId": "uuid",
  "assignedStaffId": "uuid | null",
  "assignmentRule": "CONTINUITY_OF_CARE | LEAST_BUSY | ANY_AVAILABLE | UNASSIGNED",
  "requiresManualAssignment": "boolean"
}
```

**Consumers:**
- Appointment Module → updates `assignedStaffId` on the appointment record
- Notification Service → notifies ClinicAdmin if `requiresManualAssignment = true`

---

## Staff Events

### `StaffDeleted`
Emitted when a Staff member is deleted after data transfer.

**Payload:**
```json
{
  "deletedStaffId": "uuid",
  "recipientStaffId": "uuid",
  "clinicId": "uuid",
  "transferredRecordTypes": ["SESSION", "PATIENT", "APPOINTMENT", "LEAD", "INVOICE", "MEDICAL_DOCUMENT", "DOCTORS_NOTE"]
}
```

**Consumers:**
- All modules → update `assignedTo`, `responsibleStaffId` fields

---

### `StaffTransferred`
Emitted when a Staff member is transferred between Clinics.

**Payload:**
```json
{
  "staffId": "uuid",
  "sourceClinicId": "uuid",
  "destinationClinicId": "uuid",
  "organizationId": "uuid"
}
```

**Consumers:**
- Auth Service → updates JWT scope on next login
- Notification Service → sends transfer email to Staff member

---

## Invoice Events

### `InvoiceGenerated`
Emitted when a Draft Invoice is auto-generated after Session completion.

**Payload:**
```json
{
  "invoiceId": "uuid",
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid"
}
```

**Consumers:**
- Notification Service → notifies billing staff

---

### `InvoiceIssued`
Emitted when an Invoice is issued (locked and ready for the patient).

**Payload:**
```json
{
  "invoiceId": "uuid",
  "clinicId": "uuid",
  "total": "number",
  "currency": "string"
}
```

**Consumers:**
- Analytics Service → updates billing KPIs

---

### `InvoiceRefunded`
Emitted when a full or partial refund is recorded against an Issued or Paid Invoice.

**Payload:**
```json
{
  "invoiceId": "uuid",
  "clinicId": "uuid",
  "refundAmount": "number",
  "refundType": "FULL | PARTIAL",
  "reason": "string",
  "refundDate": "ISO8601 UTC",
  "newStatus": "REFUNDED | PARTIALLY_REFUNDED",
  "totalRefundedToDate": "number"
}
```

**Consumers:**
- Analytics Service → deducts refunded amount from billing KPIs

---

## Treatment Plan & Prescription Events

### `TreatmentPlanSigned`
Emitted when a Staff member signs and generates a Treatment Plan PDF.

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "signedByStaffId": "uuid",
  "treatmentPlanId": "uuid",
  "treatmentPlanUrl": "string",
  "containsMedication": "boolean",
  "recommendationCount": "number"
}
```

**Consumers:**
- Billing Module → offers the signed recommendations as suggested line items when an invoice is next generated (does not auto-create/mutate an invoice)
- Notification Service → notifies relevant staff

---

### `PrescriptionSigned`
Emitted when a Staff member signs and generates a Prescription PDF (only when MEDICATION items exist).

**Payload:**
```json
{
  "sessionId": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "signedByStaffId": "uuid",
  "prescriptionId": "uuid",
  "prescriptionUrl": "string",
  "medicationCount": "number"
}
```

**Consumers:**
- Billing Module → ensures medication line items are on the invoice
- Notification Service → notifies relevant staff

---

### `TreatmentPlanRegenerated`
Emitted when a Treatment Plan is regenerated due to recommendation edits after signing.

**Payload:**
```json
{
  "sessionId": "uuid",
  "treatmentPlanId": "uuid",
  "clinicId": "uuid",
  "regeneratedByStaffId": "uuid",
  "previousVersion": "number",
  "newVersion": "number",
  "trigger": "RECOMMENDATION_EDIT"
}
```

**Consumers:**
- Billing Module → syncs invoice line items with updated recommendations
- Session Module → updates treatment plan URL

---

### `PrescriptionRegenerated`
Emitted when a Prescription is regenerated due to medication recommendation edits after signing.

**Payload:**
```json
{
  "sessionId": "uuid",
  "prescriptionId": "uuid",
  "clinicId": "uuid",
  "regeneratedByStaffId": "uuid",
  "previousVersion": "number",
  "newVersion": "number",
  "trigger": "RECOMMENDATION_EDIT"
}
```

**Consumers:**
- Billing Module → syncs medication line items with updated recommendations
- Session Module → updates prescription URL

---

## Catalog Events

### `CatalogItemDeleted`
Emitted when a SERVICE catalog item is deleted (triggering appointment cancellations).

**Payload:**
```json
{
  "catalogItemId": "uuid",
  "catalogItemType": "SERVICE | MEDICATION | COSMETIC | SUPPLEMENT",
  "clinicId": "uuid",
  "deletedByStaffId": "uuid",
  "affectedAppointmentCount": "number"
}
```

**Consumers:**
- Appointments Module → cancels all future appointments referencing this service (SERVICE type only)
- Notification Service → sends cancellation notifications to affected patients/leads

---

## Lead Events (additional)

### `LeadLost`
Emitted when a Lead's status is changed to LOST.

**Payload:**
```json
{
  "leadId": "uuid",
  "clinicId": "uuid",
  "changedByStaffId": "uuid",
  "activeAppointmentCount": "number"
}
```

**Consumers:**
- Appointments Module → cancels all active appointments for this lead
- Notification Service → sends cancellation notifications

---

## Clinic Events

### `WorkingHoursChanged`
Emitted when a Clinic's working hours are updated and existing appointments are affected.

**Payload:**
```json
{
  "clinicId": "uuid",
  "changedByStaffId": "uuid",
  "affectedAppointmentIds": ["uuid"],
  "effectiveDate": "ISO8601 UTC"
}
```

**Consumers:**
- Appointments Module → cancels affected appointments outside new working hours
- Notification Service → sends cancellation notifications to affected patients/leads
- Reminder Service → cancels reminder schedules for affected appointments

---

## Onboarding Events

### `OnboardingCompleted`
Emitted when an Organization's first-login OnboardingWizard (ORG-12) is completed or skipped.

**Payload:**
```json
{
  "organizationId": "uuid",
  "clinicId": "uuid",
  "completedByStaffId": "uuid",
  "completedSteps": ["CLINIC_DETAILS", "WORKING_HOURS", "CLINIC_SETTINGS", "INVITE_TEAM", "TERMS"],
  "skippedSteps": ["CLINIC_DETAILS", "INVITE_TEAM", "TERMS"],
  "wasSkippedEntirely": "boolean"
}
```

**Consumers:**
- None (informational, for observability and product analytics)

---

## Event Versioning

- Event schemas are versioned using `version` field in the envelope.
- Breaking changes to an event payload require a new version (e.g., `"version": "2.0"`).
- Consumers must handle unknown fields gracefully (forward compatibility).
- Deprecated event versions must be supported for a minimum of 2 release cycles.

---

## Reminder Events

### `ReminderDue`
Emitted by the Reminder Scheduling Engine when a scheduled reminder's fire time has arrived.

**Payload:**
```json
{
  "reminderId": "uuid",
  "triggerId": "uuid",
  "triggerType": "APPOINTMENT | SESSION",
  "recipientId": "uuid",
  "recipientType": "STAFF | PATIENT | LEAD",
  "ruleId": "uuid",
  "templateId": "string",
  "templateVariables": {},
  "clinicId": "uuid",
  "priority": "URGENT | HIGH | NORMAL | LOW"
}
```

**Consumers:**
- Notification Service → delivers the reminder via configured channels

---

### `ReminderMissed`
Emitted when a reminder's fire time passed without being processed and the reference event is already in the past.

**Payload:**
```json
{
  "reminderId": "uuid",
  "triggerId": "uuid",
  "triggerType": "APPOINTMENT | SESSION",
  "clinicId": "uuid",
  "scheduledFireAt": "ISO8601 UTC",
  "detectedAt": "ISO8601 UTC"
}
```

**Consumers:**
- Observability → operational monitoring alert

---

### `ReminderScheduleCreated`
Emitted when the Reminder Engine creates a new reminder schedule.

**Payload:**
```json
{
  "reminderId": "uuid",
  "triggerId": "uuid",
  "triggerType": "APPOINTMENT | SESSION",
  "clinicId": "uuid",
  "fireAt": "ISO8601 UTC",
  "ruleId": "uuid"
}
```

**Consumers:**
- None (informational, for observability)

---

### `ReminderScheduleCancelled`
Emitted when a reminder schedule is cancelled (e.g., appointment cancelled).

**Payload:**
```json
{
  "reminderId": "uuid",
  "triggerId": "uuid",
  "triggerType": "APPOINTMENT | SESSION",
  "clinicId": "uuid",
  "reason": "TRIGGER_CANCELLED | MANUAL_CANCELLATION"
}
```

**Consumers:**
- None (informational, for observability)

---

## Notification Events

### `NotificationDelivered`
Emitted when a notification is confirmed delivered by the channel provider.

**Payload:**
```json
{
  "notificationId": "uuid",
  "recipientId": "uuid",
  "channel": "EMAIL | WHATSAPP | SMS | PUSH | IN_APP | WEBHOOK",
  "deliveredAt": "ISO8601 UTC",
  "providerMessageId": "string"
}
```

**Consumers:**
- None (informational, for delivery tracking and analytics)

---

### `NotificationFailed`
Emitted when all delivery attempts and fallback channels have been exhausted.

**Payload:**
```json
{
  "notificationId": "uuid",
  "recipientId": "uuid",
  "attemptedChannels": ["EMAIL", "WHATSAPP"],
  "failureReason": "string",
  "failedAt": "ISO8601 UTC"
}
```

**Consumers:**
- Observability → operational alert for persistent delivery failures

---

### `NotificationBounced`
Emitted when a channel provider reports a hard bounce for a recipient address.

**Payload:**
```json
{
  "notificationId": "uuid",
  "recipientId": "uuid",
  "channel": "EMAIL | SMS | WHATSAPP",
  "bouncedAddress": "string",
  "bounceType": "HARD | SOFT",
  "bouncedAt": "ISO8601 UTC"
}
```

**Consumers:**
- Communication Policy Module → marks recipient channel as invalid (for hard bounces)
