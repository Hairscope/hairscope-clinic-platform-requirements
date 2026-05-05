# Appointments - Design

> **Version:** 1.0.0 | **Status:** Draft | **Branch:** designs
> **Requirements:** `requirements/modules/appointments.md`

---

## 1. Overview

The Appointments module handles service configuration, slot availability, booking (staff and web component), calendar view, status lifecycle, and the Smart Scheduling Engine for staff assignment.

**Key design decisions:**
- Slot availability is derived from `Clinic_Working_Hours` only (patient-facing)
- `Staff_Availability` and `qualifiedStaff` are internal to Smart Scheduling - never exposed to patients
- Smart Scheduling Engine is a pluggable independent engine
- Org API key authenticates the Appointment Booking web component
- `SessionCompleted` (not `AppointmentCompleted`) triggers billing

---

## 2. Data Models

### 2.1 Service

```javascript
const ServiceSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  createdBy: { type: String, required: true, ref: 'Staff' },

  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true }, // ISO 4217
  durationMinutes: { type: Number, required: true, min: 1 },

  // Qualified staff (internal - never exposed to patients or leads)
  qualifiedStaffIds: [{ type: String, ref: 'Staff' }],

  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ServiceSchema.index({ clinicId: 1, isActive: 1 });
```

### 2.2 Appointment

```javascript
const AppointmentSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  serviceId: { type: String, required: true, ref: 'Service' },

  // Booker: either a Patient or a Lead (not both)
  patientId: { type: String, default: null, ref: 'Patient' },
  leadId: { type: String, default: null, ref: 'Lead' },

  // Booking source
  bookedBy: { type: String, default: null, ref: 'Staff' }, // null if web component
  bookingSource: { type: String, enum: ['STAFF', 'WEB_COMPONENT'], required: true },

  // Slot (stored in UTC)
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },

  // Status
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED'
  },

  // Smart Scheduling assignment (internal - never exposed to patients)
  assignedStaffId: { type: String, default: null, ref: 'Staff' },
  assignmentRule: {
    type: String,
    enum: ['CONTINUITY_OF_CARE', 'LEAST_BUSY', 'ANY_AVAILABLE', 'UNASSIGNED'],
    default: null
  },
  requiresManualAssignment: { type: Boolean, default: false },

  // Linked session (created when appointment is attended)
  sessionId: { type: String, default: null, ref: 'Session' },

  // Cancellation/reschedule tracking
  cancelledAt: { type: Date, default: null },
  cancelledBy: { type: String, default: null, ref: 'Staff' },
  previousSlotStart: { type: Date, default: null }, // set on reschedule
  previousSlotEnd: { type: Date, default: null }
}, { timestamps: true });

// Prevent double-booking: no two SCHEDULED/CONFIRMED appointments in same slot
AppointmentSchema.index(
  { clinicId: 1, slotStart: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ['SCHEDULED', 'CONFIRMED'] } }
  }
);
AppointmentSchema.index({ clinicId: 1, slotStart: 1, slotEnd: 1 });
AppointmentSchema.index({ patientId: 1, status: 1 });
AppointmentSchema.index({ leadId: 1, status: 1 });
AppointmentSchema.index({ assignedStaffId: 1, slotStart: 1 });
```

---

## 3. Slot Availability Algorithm

```javascript
async function getAvailableSlots(clinicId, serviceId, date) {
  const clinic = await Clinic.findById(clinicId);

  // Timezone required
  if (!clinic.timezone) throw new Error('CLINIC_TIMEZONE_NOT_SET');

  const service = await Service.findById(serviceId);
  const dayOfWeek = getDayOfWeek(date, clinic.timezone); // e.g. 'monday'
  const daySchedule = clinic.workingHours[dayOfWeek];

  if (!daySchedule.open) return []; // clinic closed

  // Generate all possible slots for the day
  const slots = generateSlots(
    daySchedule.startTime,
    daySchedule.endTime,
    service.durationMinutes,
    clinic.timezone
  );

  // Remove already-booked slots
  const bookedSlots = await Appointment.find({
    clinicId,
    slotStart: { $gte: startOfDay(date), $lt: endOfDay(date) },
    status: { $in: ['SCHEDULED', 'CONFIRMED'] }
  });

  return slots.filter(slot =>
    !bookedSlots.some(booked =>
      booked.slotStart < slot.end && booked.slotEnd > slot.start
    )
  );
  // Note: Staff_Availability is NOT factored here - slots are clinic-hours-driven only
}
```

---

## 4. Smart Scheduling Engine

The Smart Scheduling Engine is a separate, independent engine. Assignment rules can be updated without modifying the booking flow.

```javascript
const smartSchedulingEngine = {
  async assignStaff(appointmentId, serviceId, clinicId, slotStart, patientId) {
    const service = await Service.findById(serviceId);
    const qualifiedStaffIds = service.qualifiedStaffIds;

    if (qualifiedStaffIds.length === 0) {
      return { assignedStaffId: null, rule: 'UNASSIGNED', requiresManualAssignment: true };
    }

    // Rule 1: Continuity of care
    if (patientId) {
      const previousAppointment = await Appointment.findOne({
        patientId,
        serviceId,
        status: 'COMPLETED',
        assignedStaffId: { $in: qualifiedStaffIds }
      }).sort({ slotStart: -1 });

      if (previousAppointment) {
        const isAvailable = await isStaffAvailableInSlot(
          previousAppointment.assignedStaffId, slotStart, clinicId
        );
        if (isAvailable) {
          return {
            assignedStaffId: previousAppointment.assignedStaffId,
            rule: 'CONTINUITY_OF_CARE',
            requiresManualAssignment: false
          };
        }
      }
    }

    // Rule 2: Least busy qualified staff
    const availableStaff = await getAvailableQualifiedStaff(
      qualifiedStaffIds, slotStart, clinicId
    );

    if (availableStaff.length > 0) {
      const leastBusy = await getLeastBusyStaff(availableStaff, slotStart);
      return {
        assignedStaffId: leastBusy._id,
        rule: 'LEAST_BUSY',
        requiresManualAssignment: false
      };
    }

    // Rule 3: Any available qualified staff (fallback)
    const anyAvailable = availableStaff[0];
    if (anyAvailable) {
      return {
        assignedStaffId: anyAvailable._id,
        rule: 'ANY_AVAILABLE',
        requiresManualAssignment: false
      };
    }

    // Rule 4: No assignment
    return { assignedStaffId: null, rule: 'UNASSIGNED', requiresManualAssignment: true };
  }
};

async function isStaffAvailableInSlot(staffId, slotStart, clinicId) {
  const staff = await Staff.findById(staffId);
  const dayOfWeek = getDayOfWeek(slotStart).toLowerCase();
  const availability = staff.availability?.[dayOfWeek];

  if (!availability?.available) return false;

  const slotTime = getTimeString(slotStart); // "HH:MM"
  return slotTime >= availability.startTime && slotTime < availability.endTime;
}
```

---

## 5. GraphQL Schema

### 5.1 Types

```graphql
type Service {
  id: UUID!
  clinicId: UUID!
  name: String!
  description: String
  imageUrl: URL
  price: Float!
  currency: String!
  durationMinutes: Int!
  isActive: Boolean!
  # qualifiedStaffIds is NEVER exposed - internal Smart Scheduling only
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Appointment {
  id: UUID!
  clinicId: UUID!
  service: Service!
  patient: Patient
  lead: Lead
  bookingSource: String!
  slotStart: DateTime!
  slotEnd: DateTime!
  status: AppointmentStatus!
  session: Session
  # assignedStaffId is NEVER exposed to patients or leads
  requiresManualAssignment: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type AppointmentConnection {
  edges: [AppointmentEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type AppointmentEdge {
  cursor: String!
  node: Appointment!
}

type AppointmentSlot {
  start: DateTime!
  end: DateTime!
  available: Boolean!
}
```

### 5.2 Queries

```graphql
type Query {
  services(clinicId: UUID, activeOnly: Boolean): [Service!]!
  service(id: UUID!): Service

  appointments(
    clinicId: UUID!
    dateFrom: DateTime
    dateTo: DateTime
    status: AppointmentStatus
    first: Int
    after: String
  ): AppointmentConnection!

  appointment(id: UUID!): Appointment

  availableSlots(
    clinicId: UUID!
    serviceId: UUID!
    date: DateTime!
  ): [AppointmentSlot!]!
}
```

### 5.3 Mutations

```graphql
type Mutation {
  # Services (Clinic_Admin + Org_Admin)
  createService(input: CreateServiceInput!): Service!
  updateService(id: UUID!, input: UpdateServiceInput!): Service!
  deleteService(id: UUID!): Boolean!
  updateServiceQualifiedStaff(serviceId: UUID!, staffIds: [UUID!]!): Service!

  # Appointments
  bookAppointment(input: BookAppointmentInput!): Appointment!
  rescheduleAppointment(id: UUID!, newSlotStart: DateTime!): Appointment!
  cancelAppointment(id: UUID!): Appointment!
  updateAppointmentStatus(id: UUID!, status: AppointmentStatus!): Appointment!

  # Manual staff assignment override (Clinic_Admin only)
  overrideAppointmentStaff(appointmentId: UUID!, staffId: UUID!): Appointment!
}

input BookAppointmentInput {
  clinicId: UUID!
  serviceId: UUID!
  slotStart: DateTime!
  patientId: UUID
  leadId: UUID
  # source determined server-side from auth context
}

input CreateServiceInput {
  clinicId: UUID!
  name: String!
  description: String
  price: Float!
  currency: String!
  durationMinutes: Int!
}
```

### 5.4 Subscriptions

```graphql
type Subscription {
  appointmentStatusChanged(clinicId: UUID!): Appointment!
}
```

---

## 6. Access Control

| Operation | Allowed |
|-----------|---------|
| `services` query | All clinic staff with `appointments.view` |
| `createService`, `updateService`, `deleteService` | Clinic_Admin, Org_Admin |
| `updateServiceQualifiedStaff` | Clinic_Admin, Org_Admin |
| `availableSlots` | All clinic staff + web component (org API key) |
| `bookAppointment` | Staff with `appointments.create` + web component |
| `rescheduleAppointment`, `cancelAppointment` | Staff with `appointments.edit` + web component (own appointment) |
| `updateAppointmentStatus` | Staff with `appointments.edit` |
| `overrideAppointmentStaff` | Clinic_Admin only |
| `appointmentStatusChanged` subscription | All clinic staff |
| `assignedStaffId` field | Never returned to patients/leads |
| `qualifiedStaffIds` field | Never returned in any query |
