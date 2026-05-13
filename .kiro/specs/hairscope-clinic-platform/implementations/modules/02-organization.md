# Organization Module Implementation

> Covers: Organization/Clinic hierarchy, self-registration, clinic profile, working hours, staff availability, visibility mode, and report templates.

---

# 1. Module Structure

```text
packages/api/src/modules/organization/
├── organization.module.ts
├── entities/
│   ├── organization.schema.ts
│   ├── clinic.schema.ts
│   ├── staff-availability.schema.ts
│   └── report-template.schema.ts
├── repositories/
│   ├── organization.repository.ts
│   ├── clinic.repository.ts
│   ├── staff-availability.repository.ts
│   └── report-template.repository.ts
├── services/
│   ├── organization.service.ts
│   ├── clinic.service.ts
│   ├── registration.service.ts
│   ├── staff-availability.service.ts
│   └── report-template.service.ts
├── resolvers/
│   ├── organization.resolver.ts
│   ├── clinic.resolver.ts
│   └── staff-availability.resolver.ts
└── dto/
    ├── register-organization.input.ts
    ├── create-clinic.input.ts
    ├── update-clinic-profile.input.ts
    └── set-staff-availability.input.ts
```

---

# 2. Organization Schema

```typescript
const OrganizationSchema = new Schema({
  name: { type: String, required: true },
  currency: { type: String }, // ISO 4217
  currencyPolicy: { type: String, enum: ['ENFORCE_SINGLE_CURRENCY', 'ALLOW_CLINIC_CURRENCY'], default: 'ALLOW_CLINIC_CURRENCY' },
  recordVisibilityMode: { type: String, enum: ['OPEN', 'RESTRICTED'], default: 'OPEN' },
  trialStartedAt: { type: Date },
  trialEndsAt: { type: Date },
  subscriptionPlan: { type: String, default: 'TRIAL' },
  status: { type: String, enum: ['ACTIVE', 'SUSPENDED'], default: 'ACTIVE' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

---

# 3. Clinic Schema

```typescript
const ClinicSchema = new Schema({
  name: { type: String, required: true },
  website: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    postalCode: { type: String },
    full: { type: String, required: true },
  },
  email: { type: String },
  phone: { type: String },
  logo: { type: String }, // GCS file path
  timezone: { type: String, required: true }, // IANA
  language: { type: String, default: 'EN' },
  currency: { type: String }, // ISO 4217
  workingHours: [{
    day: { type: Number, min: 0, max: 6 }, // 0=Sunday
    startTime: { type: String }, // HH:mm
    endTime: { type: String },   // HH:mm
    isOpen: { type: Boolean, default: true },
  }],
  servicesOffered: [{ type: Schema.Types.ObjectId }],
  termsAndConditions: { type: String },
  reportHeader: {
    logo: { type: String },
    clinicName: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
  },
  recordVisibilityMode: { type: String, enum: ['OPEN', 'RESTRICTED'], default: 'OPEN' },
  status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

ClinicSchema.index({ organizationId: 1, name: 1 });
```

---

# 4. Staff Availability Schema

```typescript
const StaffAvailabilitySchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  schedule: [{
    day: { type: Number, min: 0, max: 6 },
    startTime: { type: String }, // HH:mm
    endTime: { type: String },
    available: { type: Boolean, default: true },
  }],
  updatedAt: { type: Date, default: Date.now },
});

StaffAvailabilitySchema.index({ staffId: 1, clinicId: 1 }, { unique: true });
```

---

# 5. Self-Registration

```typescript
@Injectable()
export class RegistrationService {
  async register(dto: RegisterOrganizationDto): Promise<void> {
    // Validate email not already registered
    const existing = await this.staffRepo.findByEmailGlobal(dto.email);
    if (existing) throw new EmailAlreadyExistsError();

    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 1. Create Organization
      const org = await this.orgRepo.create({
        name: dto.organizationName,
        trialStartedAt: new Date(),
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        subscriptionPlan: 'TRIAL',
      }, { session });

      // 2. Create Clinic
      const clinic = await this.clinicRepo.create({
        name: dto.clinicName,
        address: { full: dto.clinicAddress },
        timezone: dto.timezone || 'UTC',
        organizationId: org.id,
      }, { session });

      // 3. Create system roles for the clinic
      await this.roleService.createSystemRoles(org.id, clinic.id, { session });

      // 4. Create Staff with OrgAdmin + ClinicAdmin roles
      const orgAdminRole = await this.roleRepo.findSystemRole('OrganizationAdmin', org.id, clinic.id);
      const clinicAdminRole = await this.roleRepo.findSystemRole('ClinicAdmin', org.id, clinic.id);

      const staff = await this.staffRepo.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        status: 'PENDING_REGISTRATION',
        roles: [orgAdminRole.id, clinicAdminRole.id],
        organizationId: org.id,
        clinicId: clinic.id,
      }, { session });

      // 5. Send invite (same flow as IAM-1)
      await this.inviteService.createAndSendInvite(staff, { session });

      await session.commitTransaction();
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

# 6. Clinic Profile Update

```typescript
@Injectable()
export class ClinicService {
  async updateProfile(clinicId: string, dto: UpdateClinicProfileDto, context: TenantContext): Promise<Clinic> {
    const clinic = await this.clinicRepo.findById(clinicId, context);
    if (!clinic) throw new NotFoundError('Clinic');

    // Currency enforcement check
    if (dto.currency) {
      const org = await this.orgRepo.findById(context.organizationId);
      if (org.currencyPolicy === 'ENFORCE_SINGLE_CURRENCY' && dto.currency !== org.currency) {
        throw new CurrencyEnforcementViolationError();
      }
    }

    // Working hours change → cancel affected appointments
    if (dto.workingHours) {
      await this.appointmentService.cancelAffectedByWorkingHoursChange(
        clinicId, dto.workingHours, context,
      );
    }

    const updated = await this.clinicRepo.update(clinicId, dto, context);

    await this.auditService.append('CLINIC_PROFILE_UPDATED', {
      clinicId,
      changes: dto,
    });

    return updated;
  }
}
```

---

# 7. Visibility Mode

```typescript
getEffectiveVisibilityMode(org: Organization, clinic: Clinic): 'OPEN' | 'RESTRICTED' {
  // Organization-level RESTRICTED overrides clinic setting
  if (org.recordVisibilityMode === 'RESTRICTED') return 'RESTRICTED';
  return clinic.recordVisibilityMode;
}
```

The visibility mode is consumed by the Access Resolution Engine to filter query results.

---

# 8. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Organization.name, schema: OrganizationSchema },
      { name: Clinic.name, schema: ClinicSchema },
      { name: StaffAvailability.name, schema: StaffAvailabilitySchema },
      { name: ReportTemplate.name, schema: ReportTemplateSchema },
    ]),
  ],
  providers: [
    OrganizationService,
    ClinicService,
    RegistrationService,
    StaffAvailabilityService,
    ReportTemplateService,
    OrganizationRepository,
    ClinicRepository,
    StaffAvailabilityRepository,
    ReportTemplateRepository,
    OrganizationResolver,
    ClinicResolver,
    StaffAvailabilityResolver,
  ],
  exports: [OrganizationService, ClinicService, ClinicRepository, StaffAvailabilityService],
})
export class OrganizationModule {}
```

---
