# Appointments Module Implementation

> Covers: Appointment lifecycle (SCHEDULED → CONFIRMED → COMPLETED/CANCELLED/NO_SHOW), slot availability, smart scheduling, walk-ins, and booking component integration.

---

# 1. Module Structure

```text
packages/api/src/modules/appointments/
├── appointments.module.ts
├── entities/
│   └── appointment.schema.ts
├── repositories/
│   └── appointment.repository.ts
├── services/
│   ├── appointment.service.ts
│   ├── slot-availability.service.ts
│   └── smart-scheduling.service.ts
├── resolvers/
│   └── appointment.resolver.ts
├── dto/
│   ├── book-appointment.input.ts
│   ├── reschedule-appointment.input.ts
│   └── cancel-appointment.input.ts
└── events/
    └── appointment-event.handler.ts
```

---

# 2. Appointment Schema

```typescript
const AppointmentSchema = new Schema({
  patientId: { type: Schema.Types.ObjectId, index: true },
  leadId: { type: Schema.Types.ObjectId, index: true },
  serviceId: { type: Schema.Types.ObjectId, required: true },
  assignedTo: { type: Schema.Types.ObjectId, required: true, index: true },
  status: {
    type: String,
    enum: ['SCHEDULED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED',
  },
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },
  isWalkIn: { type: Boolean, default: false },
  cancelledAt: { type: Date },
  cancelledBy: { type: Schema.Types.ObjectId },
  cancellationReason: { type: String },
  rescheduledFrom: { type: Schema.Types.ObjectId },
  notes: { type: String },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

AppointmentSchema.index({ clinicId: 1, slotStart: 1, slotEnd: 1 });
AppointmentSchema.index({ clinicId: 1, assignedTo: 1, slotStart: 1 });
AppointmentSchema.index({ leadId: 1, status: 1 });
```

---

# 3. Appointment Service

```typescript
@Injectable()
export class AppointmentService {
  async book(dto: BookAppointmentDto, context: TenantContext): Promise<Appointment> {
    // Validate slot availability
    const isAvailable = await this.slotAvailabilityService.isSlotAvailable(
      dto.slotStart, dto.slotEnd, context.clinicId,
    );
    if (!isAvailable) throw new SlotConflictError();

    // Smart scheduling: assign qualified staff
    const assignedTo = dto.assignedTo ??
      await this.smartSchedulingService.assignStaff(dto.serviceId, dto.slotStart, dto.slotEnd, context);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const appointment = await this.appointmentRepo.create({
        ...dto,
        assignedTo,
        status: 'SCHEDULED',
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        createdBy: context.staffId,
      }, { session });

      await this.auditService.append('APPOINTMENT_BOOKED', {
        appointmentId: appointment.id,
      }, { session });

      await this.outboxRepo.insert({
        eventType: 'AppointmentBooked',
        aggregateId: appointment.id,
        aggregateType: 'Appointment',
        payload: {
          appointmentId: appointment.id,
          patientId: dto.patientId,
          leadId: dto.leadId,
          clinicId: context.clinicId,
          organizationId: context.organizationId,
          appointmentStartTime: dto.slotStart,
          clinicTimezone: await this.getClinicTimezone(context.clinicId),
        },
      }, { session });

      await session.commitTransaction();
      return appointment;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async reschedule(appointmentId: string, dto: RescheduleDto, context: TenantContext): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findById(appointmentId, context);
    if (!appointment) throw new NotFoundError('Appointment');
    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      throw new InvalidStateError('Cannot reschedule');
    }

    // Validate new slot
    const isAvailable = await this.slotAvailabilityService.isSlotAvailable(
      dto.newSlotStart, dto.newSlotEnd, context.clinicId,
    );
    if (!isAvailable) throw new SlotConflictError();

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updated = await this.appointmentRepo.update(appointmentId, {
        slotStart: dto.newSlotStart,
        slotEnd: dto.newSlotEnd,
        rescheduledFrom: appointmentId,
      }, context, { session });

      await this.outboxRepo.insert({
        eventType: 'AppointmentRescheduled',
        aggregateId: appointmentId,
        aggregateType: 'Appointment',
        payload: {
          appointmentId,
          previousStartTime: appointment.slotStart,
          newStartTime: dto.newSlotStart,
          clinicId: context.clinicId,
          organizationId: context.organizationId,
          clinicTimezone: await this.getClinicTimezone(context.clinicId),
        },
      }, { session });

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async cancel(appointmentId: string, reason: string, context: TenantContext): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findById(appointmentId, context);
    if (!appointment) throw new NotFoundError('Appointment');
    if (appointment.status === 'CANCELLED') throw new AlreadyCancelledError();

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const updated = await this.appointmentRepo.update(appointmentId, {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy: context.staffId,
        cancellationReason: reason,
      }, context, { session });

      // Delete draft session if exists
      await this.sessionRepo.deleteDraftByAppointment(appointmentId, context, { session });

      await this.outboxRepo.insert({
        eventType: 'AppointmentCancelled',
        aggregateId: appointmentId,
        aggregateType: 'Appointment',
        payload: {
          appointmentId,
          clinicId: context.clinicId,
          organizationId: context.organizationId,
        },
      }, { session });

      await session.commitTransaction();
      return updated;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

---

# 4. Slot Availability Service

```typescript
@Injectable()
export class SlotAvailabilityService {
  /**
   * Slot availability = Clinic Working Hours ∩ Staff Availability
   * A slot is available if:
   * 1. The clinic is open during that time
   * 2. At least one qualified staff member is available
   * 3. No conflicting appointment exists for that staff member
   */
  async isSlotAvailable(start: Date, end: Date, clinicId: string): Promise<boolean> {
    // Check clinic working hours
    const clinic = await this.clinicRepo.findById(clinicId);
    const dayOfWeek = start.getDay();
    const clinicHours = clinic.workingHours.find(h => h.day === dayOfWeek);

    if (!clinicHours?.isOpen) return false;

    // Check for conflicts
    const conflicts = await this.appointmentRepo.findConflicting(clinicId, start, end);
    return conflicts.length === 0;
  }

  async getAvailableSlots(
    clinicId: string,
    date: Date,
    serviceId: string,
    durationMinutes: number,
  ): Promise<TimeSlot[]> {
    const clinic = await this.clinicRepo.findById(clinicId);
    const dayOfWeek = date.getDay();
    const clinicHours = clinic.workingHours.find(h => h.day === dayOfWeek);

    if (!clinicHours?.isOpen) return [];

    // Generate all possible slots
    const slots = this.generateSlots(clinicHours.startTime, clinicHours.endTime, durationMinutes);

    // Filter out booked slots
    const booked = await this.appointmentRepo.findByDateRange(clinicId, date);
    return slots.filter(slot => !this.hasConflict(slot, booked));
  }
}
```

---

# 5. Smart Scheduling Engine

```typescript
@Injectable()
export class SmartSchedulingService {
  async assignStaff(
    serviceId: string,
    slotStart: Date,
    slotEnd: Date,
    context: TenantContext,
  ): Promise<string> {
    // 1. Get qualified staff for this service
    const qualifiedStaff = await this.catalogService.getQualifiedStaff(serviceId, context);

    // 2. Filter by availability
    const dayOfWeek = slotStart.getDay();
    const availableStaff = [];

    for (const staff of qualifiedStaff) {
      const availability = await this.staffAvailabilityService.getForStaff(staff.id, context);
      const daySchedule = availability?.schedule.find(s => s.day === dayOfWeek);

      if (daySchedule?.available) {
        availableStaff.push(staff);
      }
    }

    if (availableStaff.length === 0) throw new NoAvailableStaffError();

    // 3. Assign least busy (fewest appointments that day)
    const counts = await this.appointmentRepo.getAppointmentCountsByStaff(
      availableStaff.map(s => s.id),
      slotStart,
      context,
    );

    const sorted = availableStaff.sort((a, b) =>
      (counts.get(a.id) ?? 0) - (counts.get(b.id) ?? 0),
    );

    return sorted[0].id;
  }
}
```

---

# 6. Walk-In Appointments

```typescript
async createWalkIn(dto: WalkInDto, context: TenantContext): Promise<Appointment> {
  return this.book({
    ...dto,
    slotStart: new Date(),
    slotEnd: new Date(Date.now() + dto.durationMinutes * 60 * 1000),
    isWalkIn: true,
  }, context);
}
```

---

# 7. Working Hours Change Handler

```typescript
async cancelAffectedByWorkingHoursChange(
  clinicId: string,
  newWorkingHours: WorkingHours[],
  context: TenantContext,
): Promise<void> {
  const futureAppointments = await this.appointmentRepo.findFutureByClinic(clinicId, context);

  for (const appointment of futureAppointments) {
    const dayOfWeek = appointment.slotStart.getDay();
    const newHours = newWorkingHours.find(h => h.day === dayOfWeek);

    if (!newHours?.isOpen || !this.isWithinHours(appointment, newHours)) {
      await this.cancel(appointment.id, 'CLINIC_HOURS_CHANGED', context);
    }
  }
}
```

---

# 8. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Appointment.name, schema: AppointmentSchema },
    ]),
  ],
  providers: [
    AppointmentService,
    SlotAvailabilityService,
    SmartSchedulingService,
    AppointmentRepository,
    AppointmentResolver,
    AppointmentEventHandler,
  ],
  exports: [AppointmentService, AppointmentRepository],
})
export class AppointmentsModule {}
```

---
