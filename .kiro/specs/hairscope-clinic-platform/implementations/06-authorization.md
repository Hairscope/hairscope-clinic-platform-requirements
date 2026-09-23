# Authorization

> Covers: Access Resolution Engine implementation, permission guards, tenant isolation enforcement, role-based access, visibility mode, and plan gate.

---

# 1. Access Resolution Engine

## 1.1 Overview

The Access Resolution Engine SHALL be an injectable NestJS service.

It is stateless: it receives context and returns a decision.

```typescript
export enum AccessDecision {
  ALLOWED = 'ALLOWED',
  DENIED = 'DENIED',
}

export interface AccessRequest {
  staffId: string;
  organizationId: string;
  clinicId: string;
  module: string;
  action: 'view' | 'create' | 'edit' | 'delete';
  resourceOwnerId?: string;  // For visibility mode checks
}

@Injectable()
export class AccessResolutionEngine {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly staffRepo: StaffRepository,
    private readonly planGate: PlanGateService,
  ) {}

  async resolve(request: AccessRequest): Promise<AccessDecision> {
    // 1. Load staff roles
    // 2. Union all permissions
    // 3. Check (module, action) pair
    // 4. Apply visibility mode filter
    // 5. Apply plan gate
    return AccessDecision.ALLOWED;
  }
}
```

## 1.2 Design Principles

- Authorization is always evaluated per-request
- Authorization state is never cached in the JWT
- The engine does not mutate state
- The engine does not throw — it returns ALLOWED or DENIED

---

# 2. Permission Resolution

## 2.1 Algorithm

```text
1. Load all roles assigned to the Staff member
2. For each role, collect all (module, action) permissions
3. Union all permissions into EffectivePermissions set
4. Check if the requested (module, action) exists in the set
5. If found → ALLOWED
6. If not found → DENIED
```

## 2.2 Implementation

```typescript
async resolvePermissions(staffId: string, context: TenantContext): Promise<Permission[]> {
  const staff = await this.staffRepo.findById(staffId, context);
  const roleIds = staff.roles;

  const roles = await this.roleRepo.findByIds(roleIds, context);
  const permissions = roles.flatMap(role => role.permissions);

  // Deduplicate
  return [...new Map(permissions.map(p => [`${p.module}:${p.action}`, p])).values()];
}
```

## 2.3 Permission Shape

```typescript
interface Permission {
  module: string;   // e.g., 'patients', 'appointments', 'billing'
  action: string;   // 'view' | 'create' | 'edit' | 'delete'
}
```

---

# 3. Tenant Isolation

## 3.1 TenantContext

Every resolver receives TenantContext extracted from the authenticated JWT:

```typescript
export interface TenantContext {
  staffId: string;
  organizationId: string;
  clinicId: string;
  authSessionId: string;
}
```

## 3.2 Enforcement

All database queries SHALL be scoped by `organizationId` and `clinicId`.

Tenant isolation SHALL be enforced at the repository layer:

```typescript
async findById(id: string, context: TenantContext): Promise<Patient | null> {
  return this.model.findOne({
    _id: id,
    organizationId: context.organizationId,
    clinicId: context.clinicId,
  });
}
```

A request SHALL NEVER access data belonging to a different organization.

A request SHALL NEVER access data belonging to a different clinic unless the staff has OrgAdmin role.

## 3.3 TenantGuard

```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = GqlExecutionContext.create(context).getContext().req;
    const identity = request.identity;

    if (!identity?.organizationId) {
      throw new ForbiddenError('Missing tenant context');
    }

    return true;
  }
}
```

---

# 4. Custom Decorators

## 4.1 @RequirePermission

```typescript
export const PERMISSION_KEY = 'requiredPermission';

export const RequirePermission = (module: string, action: string) =>
  SetMetadata(PERMISSION_KEY, { module, action });
```

Usage:

```typescript
@RequirePermission('patients', 'view')
@Query(() => Patient)
async patient(@Args('id') id: string, @CurrentUser() user: TenantContext) {
  return this.patientService.findById(id, user);
}
```

## 4.2 @RequireClinicAccess

```typescript
export const CLINIC_ACCESS_KEY = 'requireClinicAccess';

export const RequireClinicAccess = () =>
  SetMetadata(CLINIC_ACCESS_KEY, true);
```

Ensures the requesting staff belongs to the target clinic. Used on clinic-scoped operations.

## 4.3 @CurrentUser

```typescript
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TenantContext => {
    const request = GqlExecutionContext.create(ctx).getContext().req;
    return request.identity;
  },
);
```

---

# 5. Visibility Mode

## 5.1 Concept

Clinics MAY operate in RESTRICTED visibility mode.

In RESTRICTED mode, staff members only see records assigned to them.

ClinicAdmin bypasses visibility restrictions within their clinic.

## 5.2 VisibilityInterceptor

```typescript
@Injectable()
export class VisibilityInterceptor implements NestInterceptor {
  constructor(
    private readonly clinicRepo: ClinicRepository,
    private readonly staffRepo: StaffRepository,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = GqlExecutionContext.create(context).getContext().req;
    const identity = request.identity;

    const clinic = await this.clinicRepo.findById(identity.clinicId);

    if (clinic.visibilityMode === 'RESTRICTED') {
      const staff = await this.staffRepo.findById(identity.staffId, identity);
      const isClinicAdmin = staff.roles.some(r => r.isSystemRole && r.name === 'ClinicAdmin');

      if (!isClinicAdmin) {
        // Attach visibility filter to request context
        request.visibilityFilter = { assignedTo: identity.staffId };
      }
    }

    return next.handle();
  }
}
```

Repositories SHALL check `request.visibilityFilter` and apply it to queries:

```typescript
async findAll(context: TenantContext, filter?: QueryFilter): Promise<Patient[]> {
  const query: any = {
    organizationId: context.organizationId,
    clinicId: context.clinicId,
  };

  if (filter?.visibilityFilter) {
    Object.assign(query, filter.visibilityFilter);
  }

  return this.model.find(query);
}
```

---

# 6. OrgAdmin Special Handling

## 6.1 Access Scope

OrgAdmin SHALL have access to:

- Organization settings
- Clinic management
- Staff management (across clinics)
- Leads module
- Subscription and billing

OrgAdmin SHALL NOT have access to:

- Patient records
- Appointments
- Clinical sessions
- Clinic-level billing/invoicing
- Product catalog

## 6.2 Implementation

```typescript
const ORG_ADMIN_ALLOWED_MODULES = ['leads', 'organization', 'clinics', 'staff', 'subscription'];

function isOrgAdminAllowed(module: string): boolean {
  return ORG_ADMIN_ALLOWED_MODULES.includes(module);
}
```

---

# 7. Dual-Role Resolution

## 7.1 Rule

If a Staff member holds both OrgAdmin and ClinicAdmin roles:

- When operating within their assigned clinic → ClinicAdmin permissions apply
- When operating at organization level → OrgAdmin permissions apply

## 7.2 Implementation

```typescript
async resolve(request: AccessRequest): Promise<AccessDecision> {
  const staff = await this.staffRepo.findById(request.staffId, {
    organizationId: request.organizationId,
    clinicId: request.clinicId,
  });

  const hasOrgAdmin = staff.roles.some(r => r.name === 'OrganizationAdmin');
  const hasClinicAdmin = staff.roles.some(r => r.name === 'ClinicAdmin');

  if (hasOrgAdmin && hasClinicAdmin && request.clinicId === staff.clinicId) {
    // ClinicAdmin permissions apply in their clinic
    return this.resolveWithClinicAdminPermissions(request, staff);
  }

  if (hasOrgAdmin && !isOrgAdminAllowed(request.module)) {
    return AccessDecision.DENIED;
  }

  return this.resolveWithEffectivePermissions(request, staff);
}
```

---

# 8. Plan Gate

## 8.1 Concept

Certain features are gated by the organization's subscription plan.

The Plan Gate checks entitlements before allowing feature access.

## 8.2 Implementation

```typescript
@Injectable()
export class PlanGateService {
  constructor(private readonly subscriptionRepo: SubscriptionRepository) {}

  async isFeatureAllowed(organizationId: string, feature: string): Promise<boolean> {
    const subscription = await this.subscriptionRepo.findActive(organizationId);
    if (!subscription) return false;

    return subscription.entitlements.includes(feature);
  }
}
```

## 8.3 Integration with Access Resolution

```typescript
// Inside AccessResolutionEngine.resolve()
const featureGated = MODULE_FEATURE_MAP[request.module];
if (featureGated) {
  const allowed = await this.planGate.isFeatureAllowed(request.organizationId, featureGated);
  if (!allowed) return AccessDecision.DENIED;
}
```

---

# 9. NestJS Integration

## 9.1 PermissionGuard

```typescript
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly accessEngine: AccessResolutionEngine,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permission = this.reflector.get<{ module: string; action: string }>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    if (!permission) return true; // No permission required

    const request = GqlExecutionContext.create(context).getContext().req;
    const identity = request.identity;

    const decision = await this.accessEngine.resolve({
      staffId: identity.staffId,
      organizationId: identity.organizationId,
      clinicId: identity.clinicId,
      module: permission.module,
      action: permission.action,
    });

    if (decision === AccessDecision.DENIED) {
      throw new ForbiddenError('Insufficient permissions');
    }

    return true;
  }
}
```

## 9.2 Guard Execution Order

Guards SHALL execute in this order:

```text
1. AuthGuard        → Validates JWT + AuthSession
2. TenantGuard      → Ensures tenant context present
3. PermissionGuard  → Checks (module, action) permission
```

## 9.3 Authorization Module

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
    ]),
  ],
  providers: [
    AccessResolutionEngine,
    PlanGateService,
    PermissionGuard,
    TenantGuard,
    VisibilityInterceptor,
    RoleRepository,
  ],
  exports: [
    AccessResolutionEngine,
    PermissionGuard,
    TenantGuard,
    VisibilityInterceptor,
  ],
})
export class AuthorizationModule {}
```

---
