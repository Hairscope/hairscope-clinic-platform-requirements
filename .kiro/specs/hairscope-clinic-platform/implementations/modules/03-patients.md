# Patients Module Implementation

> Covers: Patient CRUD, global patient identity, medical documents, treatment progress graph, GDPR erasure, and lead conversion handling.

---

# 1. Module Structure

```text
packages/api/src/modules/patients/
├── patients.module.ts
├── entities/
│   ├── patient.schema.ts
│   └── medical-document.schema.ts
├── repositories/
│   ├── patient.repository.ts
│   └── medical-document.repository.ts
├── services/
│   ├── patient.service.ts
│   ├── medical-document.service.ts
│   └── treatment-progress.service.ts
├── resolvers/
│   ├── patient.resolver.ts
│   └── medical-document.resolver.ts
├── dto/
│   ├── create-patient.input.ts
│   ├── update-patient.input.ts
│   └── upload-document.input.ts
└── events/
    └── patient-event.handler.ts
```

---

# 2. Patient Schema

```typescript
const PatientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  dateOfBirth: { type: Date },
  age: { type: Number },
  genderAssignedAtBirth: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], required: true },
  externalPatientId: { type: String },
  globalPatientId: { type: String, index: true },
  convertedFromLeadId: { type: Schema.Types.ObjectId },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
  isErased: { type: Boolean, default: false },
});

PatientSchema.index({ clinicId: 1, email: 1 }, { unique: true });
PatientSchema.index(
  { clinicId: 1, phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $ne: null } } },
);
PatientSchema.index({ clinicId: 1, firstName: 'text', lastName: 'text' });
```

---

# 3. Patient Service

```typescript
@Injectable()
export class PatientService {
  async create(dto: CreatePatientDto, context: TenantContext): Promise<Patient> {
    // Duplicate checks
    const byEmail = await this.patientRepo.findByEmail(dto.email, context);
    if (byEmail) throw new DuplicatePatientEmailError();

    if (dto.phone) {
      const byPhone = await this.patientRepo.findByPhone(dto.phone, context);
      if (byPhone) throw new DuplicatePatientPhoneError();
    }

    // Age calculation
    let age = dto.age;
    if (dto.dateOfBirth) {
      age = this.calculateAge(dto.dateOfBirth);
    }

    // Global patient ID resolution
    const globalPatientId = await this.resolveGlobalPatientId(dto.email, dto.phone);

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const patient = await this.patientRepo.create({
        ...dto,
        age,
        globalPatientId,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        createdBy: context.staffId,
      }, { session });

      await this.auditService.append('PATIENT_CREATED', { patientId: patient.id }, { session });
      await this.outboxRepo.insert({
        eventType: 'PatientCreated',
        aggregateId: patient.id,
        aggregateType: 'Patient',
        payload: { patientId: patient.id, clinicId: context.clinicId },
      }, { session });

      await session.commitTransaction();
      return patient;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const diff = today.getTime() - dateOfBirth.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
  }

  private async resolveGlobalPatientId(email: string, phone?: string): Promise<string> {
    // Look for existing patient with same email or phone across all clinics
    const existing = await this.patientRepo.findByEmailOrPhoneGlobal(email, phone);
    if (existing?.globalPatientId) return existing.globalPatientId;
    return randomUUID();
  }
}
```

---

# 4. Lead Conversion Handler

```typescript
@Injectable()
export class PatientEventHandler {
  @OnEvent('LeadConverted')
  async handleLeadConverted(event: LeadConvertedEvent): Promise<void> {
    if (await this.idempotencyStore.isDuplicate(event.eventId)) return;

    const lead = event.payload;

    await this.patientService.create({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      genderAssignedAtBirth: lead.gender,
      convertedFromLeadId: lead.leadId,
    }, {
      staffId: lead.convertedBy,
      organizationId: lead.organizationId,
      clinicId: lead.clinicId,
    });

    await this.idempotencyStore.markProcessed(event.eventId);
  }
}
```

---

# 5. GDPR Erasure

```typescript
async gdprErase(patientId: string, context: TenantContext): Promise<void> {
  const patient = await this.patientRepo.findById(patientId, context);
  if (!patient) throw new NotFoundError('Patient');

  await this.patientRepo.anonymize(patientId, {
    firstName: '[ERASED]',
    lastName: '[ERASED]',
    email: `erased-${randomUUID()}@erased.local`,
    phone: null,
    dateOfBirth: null,
    age: null,
    externalPatientId: null,
    isErased: true,
  }, context);

  // Delete associated files from GCS
  await this.storageService.deletePrefix(
    `${context.organizationId}/${context.clinicId}/sessions/${patientId}`,
  );

  await this.auditService.append('GDPR_ERASURE', { patientId });
}
```

---

# 6. Treatment Progress Graph

```typescript
@Injectable()
export class TreatmentProgressService {
  async getProgressData(patientId: string, context: TenantContext): Promise<ProgressDataPoint[]> {
    const sessions = await this.sessionRepo.findCompletedByPatient(patientId, context);

    return sessions.map(session => ({
      date: session.completedAt,
      sessionId: session.id,
      metrics: {
        hairCount: session.analysis?.hairCount,
        thickness: session.analysis?.thickness,
        coverage: session.analysis?.coverage,
      },
    }));
  }
}
```

---

# 7. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Patient.name, schema: PatientSchema },
      { name: MedicalDocument.name, schema: MedicalDocumentSchema },
    ]),
  ],
  providers: [
    PatientService,
    MedicalDocumentService,
    TreatmentProgressService,
    PatientEventHandler,
    PatientRepository,
    MedicalDocumentRepository,
    PatientResolver,
    MedicalDocumentResolver,
  ],
  exports: [PatientService, PatientRepository],
})
export class PatientsModule {}
```

---
