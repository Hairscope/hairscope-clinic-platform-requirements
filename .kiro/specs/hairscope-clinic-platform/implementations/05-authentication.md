# Authentication

> Covers: JWT implementation, argon2 password hashing, AuthSession management, token rotation, refresh tokens, login/logout flow, invite acceptance, and password reset.

---

# 1. JWT Structure

## 1.1 Identity-Only Token

JWT SHALL contain identity and session scope only.

JWT SHALL NOT contain roles, permissions, or entitlements.

Payload:

```typescript
interface JwtPayload {
  staffId: string;
  organizationId: string;
  clinicId: string;
  authSessionId: string;
  iat: number;   // issuedAt (Unix seconds)
  exp: number;   // expiresAt (Unix seconds)
}
```

## 1.2 Signing

JWT SHALL be signed with RS256 (asymmetric).

Private key SHALL be stored in environment configuration, never committed to source.

Public key MAY be exposed for external verification if needed.

---

# 2. Token Rotation

## 2.1 Dual-Token Model

Authentication SHALL use a dual-token model:

| Token | Lifetime | Storage | Purpose |
|-------|----------|---------|---------|
| Access Token (JWT) | 15 minutes | Memory / HTTP-only cookie | Request authentication |
| Refresh Token | 30 days | HTTP-only secure cookie | Silent renewal |

## 2.2 Transparent Renewal

Token renewal SHALL be transparent to the user (IAM-9 compliance).

The client SHALL detect a 401 response, call the refresh endpoint, and retry the original request automatically.

The platform SHALL issue a new access token on every successful refresh without requiring re-authentication.

## 2.3 Refresh Token Rotation

Each refresh call SHALL issue a new refresh token and invalidate the previous one.

If a previously-invalidated refresh token is presented, the platform SHALL revoke the entire AuthSession (potential token theft).

---

# 3. Password Hashing

## 3.1 argon2 Configuration

Passwords SHALL be hashed with argon2id:

```typescript
import * as argon2 from 'argon2';

const ARGON2_OPTIONS: argon2.Options = {
  type: argon2.argon2id,
  memoryCost: 65536,    // 64 MB
  timeCost: 3,          // 3 iterations
  parallelism: 4,       // 4 threads
};

async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
```

## 3.2 Rehashing

On successful login, if the stored hash uses outdated parameters, the platform SHALL rehash with current parameters and persist the updated hash.

---

# 4. AuthSession Aggregate

## 4.1 Schema

AuthSession SHALL be stored in MongoDB:

```typescript
const AuthSessionSchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId },
  status: {
    type: String,
    enum: ['ACTIVE', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE',
  },
  refreshTokenHash: { type: String, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastActivityAt: { type: Date, default: Date.now },
  revokedAt: { type: Date },
  revokedReason: { type: String, enum: ['LOGOUT', 'DEACTIVATION', 'SECURITY', 'PASSWORD_RESET'] },
});

AuthSessionSchema.index({ staffId: 1, status: 1 });
```

## 4.2 Lifecycle

AuthSession states:

```text
ACTIVE → REVOKED   (logout, deactivation, security action)
ACTIVE → EXPIRED   (inactivity timeout, if configured)
```

AuthSession SHALL be the source of truth for authentication validity.

A valid JWT with a revoked AuthSession SHALL be rejected.

---

# 5. Login Flow

## 5.1 Sequence

```text
1. Client submits { email, password }
2. Validate Staff exists and status is ACTIVE
3. Verify password against stored hash
4. Create AuthSession (status: ACTIVE)
5. Generate refresh token → hash and store in AuthSession
6. Sign JWT with AuthSession identity
7. Return { accessToken, refreshToken } via HTTP-only cookies
8. Append AuditLog entry (LOGIN_SUCCESS)
```

## 5.2 Implementation

```typescript
@Injectable()
export class AuthService {
  async login(dto: LoginDto, meta: RequestMeta): Promise<TokenPair> {
    const staff = await this.staffRepo.findByEmail(dto.email);
    if (!staff || staff.status !== 'ACTIVE') {
      await this.auditService.append('LOGIN_FAILED', { email: dto.email });
      throw new InvalidCredentialsError();
    }

    const valid = await verifyPassword(staff.passwordHash, dto.password);
    if (!valid) {
      await this.auditService.append('LOGIN_FAILED', { staffId: staff.id });
      throw new InvalidCredentialsError();
    }

    const refreshToken = this.generateRefreshToken();
    const session = await this.authSessionRepo.create({
      staffId: staff.id,
      organizationId: staff.organizationId,
      clinicId: staff.clinicId,
      refreshTokenHash: await argon2.hash(refreshToken),
      userAgent: meta.userAgent,
      ipAddress: meta.ipAddress,
    });

    const accessToken = this.jwtService.sign({
      staffId: staff.id,
      organizationId: staff.organizationId,
      clinicId: staff.clinicId,
      authSessionId: session.id,
    });

    await this.auditService.append('LOGIN_SUCCESS', { staffId: staff.id });

    return { accessToken, refreshToken };
  }
}
```

## 5.3 Failure Cases

| Condition | Error Code | Behaviour |
|-----------|------------|-----------|
| Email not found | `INVALID_CREDENTIALS` | Generic error, no user enumeration |
| Wrong password | `INVALID_CREDENTIALS` | Generic error, no user enumeration |
| Staff status INACTIVE | `ACCOUNT_DEACTIVATED` | Explicit deactivation message |
| Staff status PENDING_REGISTRATION | `ACCOUNT_NOT_ACTIVATED` | Direct to invite link |

---

# 6. Refresh Flow

## 6.1 Sequence

```text
1. Client submits refresh token
2. Find AuthSession by token hash lookup
3. Validate AuthSession status is ACTIVE
4. Validate Staff status is ACTIVE
5. Issue new refresh token → update AuthSession hash
6. Sign new JWT
7. Return new { accessToken, refreshToken }
8. Update lastActivityAt on AuthSession
```

## 6.2 Implementation

```typescript
async refresh(currentRefreshToken: string): Promise<TokenPair> {
  const sessions = await this.authSessionRepo.findActive();
  const session = await this.findSessionByRefreshToken(sessions, currentRefreshToken);

  if (!session) {
    throw new InvalidRefreshTokenError();
  }

  const staff = await this.staffRepo.findById(session.staffId);
  if (!staff || staff.status !== 'ACTIVE') {
    await this.revokeSession(session.id, 'SECURITY');
    throw new AccountDeactivatedError();
  }

  // Rotate refresh token
  const newRefreshToken = this.generateRefreshToken();
  await this.authSessionRepo.updateRefreshToken(session.id, await argon2.hash(newRefreshToken));

  const accessToken = this.jwtService.sign({
    staffId: staff.id,
    organizationId: staff.organizationId,
    clinicId: staff.clinicId,
    authSessionId: session.id,
  });

  return { accessToken, refreshToken: newRefreshToken };
}
```

## 6.3 Stolen Token Detection

If a refresh token that has already been rotated is presented:

1. The platform SHALL revoke the entire AuthSession
2. The platform SHALL emit a `SECURITY_TOKEN_REUSE` audit event
3. All tokens for that session SHALL be immediately invalid

---

# 7. Logout

## 7.1 Sequence

```text
1. Client calls logout endpoint with access token
2. Extract authSessionId from JWT
3. Set AuthSession status → REVOKED, revokedReason → LOGOUT
4. Clear refresh token hash
5. Append AuditLog entry (LOGOUT)
6. Return success
```

After logout, the JWT remains cryptographically valid until its 15-minute expiry, but AuthSession validation SHALL reject it on the next request.

---

# 8. Staff Deactivation

When a Staff member is deactivated:

```typescript
async deactivateStaff(staffId: string, context: TenantContext): Promise<void> {
  // Revoke ALL active AuthSessions for this staff
  await this.authSessionRepo.revokeAllForStaff(staffId, 'DEACTIVATION');

  // Update staff status
  await this.staffRepo.updateStatus(staffId, 'INACTIVE', context);

  // Audit
  await this.auditService.append('STAFF_DEACTIVATED', { staffId });
}
```

All active sessions SHALL be revoked immediately.

All outstanding JWTs SHALL be rejected on next AuthSession validation.

---

# 9. Password Reset

## 9.1 Flow

```text
1. Staff requests password reset via email
2. Platform generates a cryptographically random token (32 bytes, hex-encoded)
3. Token stored hashed in PasswordResetToken collection with 24h expiry
4. Email sent with reset link containing the token
5. Staff follows link, submits new password
6. Platform validates token (exists, not expired, not used)
7. Platform updates password hash
8. Platform marks token as used
9. Platform revokes ALL AuthSessions for this staff (revokedReason: PASSWORD_RESET)
10. Platform issues new AuthSession + tokens (staff is logged in)
11. Audit entry appended
```

## 9.2 Schema

```typescript
const PasswordResetTokenSchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  usedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

## 9.3 Security Constraints

- Token SHALL expire after 24 hours
- Token SHALL be single-use
- Previous unused tokens for the same staff SHALL be invalidated when a new one is issued
- Password reset SHALL revoke all existing sessions
- Rate limit: maximum 3 reset requests per email per hour

---

# 10. Invite Acceptance

## 10.1 Flow

```text
1. Invitee follows invite link with token
2. Platform validates invite token (exists, not expired, not used, not revoked)
3. Invitee submits new password
4. Platform hashes password and stores on Staff record
5. Staff status transitions: PENDING_REGISTRATION → ACTIVE
6. Platform creates AuthSession
7. Platform issues JWT + refresh token
8. Invitee is logged in
```

## 10.2 Implementation

```typescript
async acceptInvite(dto: AcceptInviteDto): Promise<TokenPair> {
  const invite = await this.inviteRepo.findByToken(dto.token);
  if (!invite || invite.isExpired() || invite.isUsed()) {
    throw new InvalidInviteTokenError();
  }

  const staff = await this.staffRepo.findById(invite.staffId);
  if (staff.status !== 'PENDING_REGISTRATION') {
    throw new InviteAlreadyUsedError();
  }

  const passwordHash = await hashPassword(dto.password);
  await this.staffRepo.activate(staff.id, passwordHash);
  await this.inviteRepo.markUsed(invite.id);

  // Create session and issue tokens (same as login)
  return this.createSessionAndIssueTokens(staff);
}
```

---

# 11. Guards

## 11.1 AuthGuard

All GraphQL resolvers SHALL be protected by `AuthGuard`:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authSessionRepo: AuthSessionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = GqlExecutionContext.create(context).getContext().req;
    const token = this.extractToken(request);

    if (!token) throw new UnauthorizedError();

    // 1. Validate JWT signature and expiry
    const payload = this.jwtService.verify<JwtPayload>(token);

    // 2. Validate AuthSession is active
    const session = await this.authSessionRepo.findActiveById(payload.authSessionId);
    if (!session) throw new SessionRevokedError();

    // 3. Attach identity to request context
    request.identity = {
      staffId: payload.staffId,
      organizationId: payload.organizationId,
      clinicId: payload.clinicId,
      authSessionId: payload.authSessionId,
    };

    return true;
  }

  private extractToken(request: Request): string | null {
    const auth = request.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return request.cookies?.accessToken ?? null;
  }
}
```

## 11.2 Public Endpoints

Endpoints that do not require authentication (login, refresh, invite acceptance, password reset) SHALL use `@Public()` decorator:

```typescript
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

AuthGuard SHALL check for `IS_PUBLIC_KEY` metadata and skip validation if present.

---

# 12. NestJS Integration

## 12.1 JWT Strategy

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authSessionRepo: AuthSessionRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => req?.cookies?.accessToken,
      ]),
      secretOrKey: configService.get('JWT_PUBLIC_KEY'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: JwtPayload): Promise<RequestIdentity> {
    const session = await this.authSessionRepo.findActiveById(payload.authSessionId);
    if (!session) throw new UnauthorizedException('Session revoked');

    return {
      staffId: payload.staffId,
      organizationId: payload.organizationId,
      clinicId: payload.clinicId,
      authSessionId: payload.authSessionId,
    };
  }
}
```

## 12.2 Auth Module

```typescript
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        privateKey: config.get('JWT_PRIVATE_KEY'),
        publicKey: config.get('JWT_PUBLIC_KEY'),
        signOptions: {
          algorithm: 'RS256',
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: AuthSession.name, schema: AuthSessionSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
    ]),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    AuthGuard,
    AuthSessionRepository,
  ],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
```

---
