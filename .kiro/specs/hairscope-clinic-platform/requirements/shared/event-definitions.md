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
- Billing Module → prepares invoice draft on completion

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
- Billing Module → generates Draft Invoice
- Notification Service → sends AI analysis complete notification

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
Emitted when a Staff member saves edits to Trichoscopy_Image annotations.

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
- Smart_Scheduling Service → triggers staff assignment

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

---

### `StaffAssigned`
Emitted by the Smart_Scheduling Service when a Staff member is assigned to an appointment.

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
- Notification Service → notifies Clinic_Admin if `requiresManualAssignment = true`

---

### `AppointmentCompleted`
Emitted when an Appointment status transitions to `COMPLETED`.

**Payload:**
```json
{
  "appointmentId": "uuid",
  "clinicId": "uuid",
  "sessionId": "uuid | null"
}
```

**Consumers:**
- Billing Module → triggers Invoice generation if Session exists

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
- All modules → update `createdBy`, `assignedTo`, `uploadedBy`, `authoredBy` fields

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

### `InvoiceFinalized`
Emitted when an Invoice is finalized.

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

## Event Versioning

- Event schemas are versioned using `version` field in the envelope.
- Breaking changes to an event payload require a new version (e.g., `"version": "2.0"`).
- Consumers must handle unknown fields gracefully (forward compatibility).
- Deprecated event versions must be supported for a minimum of 2 release cycles.
