# IAM Module Implementation

> Covers: Staff lifecycle, invite flow, role management, password policy enforcement, deactivation/reactivation, and inter-clinic transfer.

---

# 1. Module Structure

```text
packages/api/src/modules/iam/
├── iam.module.ts
├── entities/
│   ├── staff.schema.ts
│   ├── role.schema.ts
│   └── invite-token.schema.ts
├── repositories/
│   ├── staff.repository.ts
│   ├── role.repository.ts
│   └── invite-token.repository.ts
├── services/
│   ├── staff.service.ts
│   ├── role.service.ts
│   ├── invite.service.ts
│   └── password-policy.service.ts
├── resolvers/
│   ├── staff.resolver.ts
│   ├── role.resolver.ts
│   └── invite.resolver.ts
├── dto/
│   ├── create-staff.input.ts
│   ├── update-staff.input.ts
│   ├── send-invite.input.ts
│   ├── accept-invite.input.ts
│   ├── create-role.input.ts
│   └── update-role.input.ts
├── guards/
│   └── last-admin.guard.ts
└── events/
    └── iam.events.ts
```

---

# 2. Staff Schema

```typescript
const StaffSchema = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  passwordHash: { type: String },
  specialization: { type: String },
  experience: { type: String },
  status: {
    type: String,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING_REGISTRATION'],
    default: 'PENDING_REGISTRATION',
  },
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

StaffSchema.index({ organizationId: 1, clinicId: 1, email: 1 }, { unique: true });
```

---

# 3. Role Schema

```typescript
const RoleSchema = new Schema({
  name: { type: String, required: true },
  permissions: [{
    module: { type: String, required: true },
    actions: [{ type: String, enum: ['view', 'create', 'edit', 'delete'] }],
  }],
  isSystem: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

RoleSchema.index({ organizationId: 1, clinicId: 1, name: 1 }, { unique: true });
```

---

# 4. Invite Token Schema

```typescript
const InviteTokenSchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  revokedAt: { type: Date },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

InviteTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

---

# 5. Invite Flow

## 5.1 Send Invite

```typescript
@Injectable()
export class InviteService {
  async sendInvite(dto: SendInviteDto, context: TenantContext): Promise<Staff> {
    // 1. Validate email not already registered
    const existing = await this.staffRepo.findByEmail(dto.email, context);
    if (existing?.status === 'ACTIVE' || existing?.status === 'INACTIVE') {
      throw new EmailAlreadyExistsError();
    }
    if (existing?.status === 'PENDING_REGISTRATION') {
      throw new EmailAlreadyInvitedError();
    }

    // 2. Validate roles
    if (!dto.roleIds?.length) throw new ValidationError('roles', 'At least one role required');

    // Transaction: create staff + invite token + audit + outbox
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // 3. Create Staff record
      const staff = await this.staffRepo.create({
        email: dto.email,
        status: 'PENDING_REGISTRATION',
        roles: dto.roleIds,
        organizationId: context.organizationId,
        clinicId: context.clinicId,
        createdBy: context.staffId,
      }, { session });

      // 4. Generate invite token
      const token = crypto.randomBytes(32).toString('hex');
      await this.inviteTokenRepo.create({
        staffId: staff.id,
        tokenHash: await argon2.hash(token),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        organizationId: context.organizationId,
        clinicId: context.clinicId,
      }, { session });

      // 5. Audit + Outbox
      await this.auditService.append('INVITE_SENT', { staffId: staff.id, email: dto.email }, { session });
      await this.outboxRepo.insert({
        eventType: 'InviteSent',
        aggregateId: staff.id,
        aggregateType: 'Staff',
        payload: { staffId: staff.id, email: dto.email, token },
      }, { session });

      await session.commitTransaction();
      return staff;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
```

## 5.2 Accept Invite

```typescript
async acceptInvite(dto: AcceptInviteDto): Promise<TokenPair> {
  // 1. Find invite token
  const invite = await this.inviteTokenRepo.findValidByToken(dto.token);
  if (!invite) throw new InviteNotFoundError();
  if (invite.revokedAt) throw new InviteRevokedError();
  if (invite.usedAt) throw new InviteAlreadyUsedError();
  if (invite.expiresAt < new Date()) throw new InviteExpiredError();

  // 2. Validate password policy
  this.passwordPolicyService.validate(dto.password);

  // 3. Activate staff
  const passwordHash = await hashPassword(dto.password);
  await this.staffRepo.activate(invite.staffId, passwordHash);
  await this.inviteTokenRepo.markUsed(invite.id);

  // 4. Create session and issue tokens
  return this.authService.createSessionAndIssueTokens(invite.staffId);
}
```

---

# 6. Password Policy

```typescript
@Injectable()
export class PasswordPolicyService {
  validate(password: string): void {
    const errors: string[] = [];

    if (password.length < 8) errors.push('Minimum 8 characters');
    if (!/[a-zA-Z]/.test(password)) errors.push('At least one letter');
    if (!/[0-9]/.test(password)) errors.push('At least one number');
    if (!/[!@#$%^&*()\-_+=]/.test(password)) errors.push('At least one symbol');

    if (errors.length > 0) {
      throw new ValidationError('password', errors.join('. '));
    }
  }
}
```

---

# 7. Staff Deactivation

```typescript
async deactivateStaff(staffId: string, context: TenantContext): Promise<void> {
  const staff = await this.staffRepo.findById(staffId, context);
  if (!staff) throw new NotFoundError('Staff');

  // Last admin guard
  await this.lastAdminGuard.validate(staff, context);

  // Verify all records reassigned (sessions, leads, appointments)
  const unresolvedRecords = await this.getUnresolvedRecords(staffId, context);
  if (unresolvedRecords.length > 0) {
    throw new RecordsUnresolvedError(unresolvedRecords);
  }

  // Deactivate
  await this.staffRepo.updateStatus(staffId, 'INACTIVE', context);

  // Revoke all auth sessions
  await this.authSessionRepo.revokeAllForStaff(staffId, 'DEACTIVATION');

  // Audit
  await this.auditService.append('STAFF_DEACTIVATED', { staffId });
}
```

---

# 8. Last Admin Guard

```typescript
@Injectable()
export class LastAdminGuard {
  async validate(staff: Staff, context: TenantContext): Promise<void> {
    const staffRoles = await this.roleRepo.findByIds(staff.roles);
    const isOrgAdmin = staffRoles.some(r => r.name === 'OrganizationAdmin' && r.isSystem);
    const isClinicAdmin = staffRoles.some(r => r.name === 'ClinicAdmin' && r.isSystem);

    if (isOrgAdmin) {
      const activeOrgAdmins = await this.staffRepo.countActiveWithRole(
        'OrganizationAdmin', context.organizationId,
      );
      if (activeOrgAdmins <= 1) throw new LastOrgAdminError();
    }

    if (isClinicAdmin) {
      const activeClinicAdmins = await this.staffRepo.countActiveWithRole(
        'ClinicAdmin', context.organizationId, context.clinicId,
      );
      if (activeClinicAdmins <= 1) throw new LastClinicAdminError();
    }
  }
}
```

---

# 9. Role Management

```typescript
@Injectable()
export class RoleService {
  async createRole(dto: CreateRoleDto, context: TenantContext): Promise<Role> {
    return this.roleRepo.create({
      name: dto.name,
      permissions: dto.permissions,
      isSystem: false,
      isDefault: false,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
    });
  }

  async updatePermissions(roleId: string, permissions: Permission[], context: TenantContext): Promise<Role> {
    const role = await this.roleRepo.findById(roleId, context);
    if (!role) throw new NotFoundError('Role');

    // OrganizationAdmin permissions cannot be edited
    if (role.name === 'OrganizationAdmin' && role.isSystem) {
      throw new RoleNotEditableError();
    }

    return this.roleRepo.updatePermissions(roleId, permissions, context);
  }

  async deleteRole(roleId: string, context: TenantContext): Promise<void> {
    const role = await this.roleRepo.findById(roleId, context);
    if (!role) throw new NotFoundError('Role');

    if (role.isSystem) throw new RoleNotDeletableError();

    await this.roleRepo.delete(roleId, context);
  }
}
```

---

# 10. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Staff.name, schema: StaffSchema },
      { name: Role.name, schema: RoleSchema },
      { name: InviteToken.name, schema: InviteTokenSchema },
    ]),
  ],
  providers: [
    StaffService,
    RoleService,
    InviteService,
    PasswordPolicyService,
    LastAdminGuard,
    StaffRepository,
    RoleRepository,
    InviteTokenRepository,
    StaffResolver,
    RoleResolver,
    InviteResolver,
  ],
  exports: [StaffService, RoleService, StaffRepository, RoleRepository],
})
export class IamModule {}
```

---
