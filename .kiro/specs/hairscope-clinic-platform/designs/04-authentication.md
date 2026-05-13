# Hairscope Platform — Authentication

> **Version:** 1.0.0  
> **Status:** Draft  
> **Layer:** Platform Design  
> **Scope:** Identity and Authentication

---

# 1. Purpose

This document defines how identity and authentication are handled in the Hairscope Platform.

It establishes:

- identity model
- authentication mechanism
- session model
- token structure
- authentication validation rules

This document answers:

> Who is making the request?

This document derives from:

- `01-system-architecture.md`
- `03-domain-modeling.md`

---

# 2. Core Concepts

Authentication in Hairscope is based on:

- Staff identity
- AuthSession lifecycle
- JWT-based identity tokens

Authentication is strictly separated from authorization.

Authentication determines identity only.

Authorization determines access.

Authentication sessions are referred to as `AuthSession`. The term `Session` without prefix refers to clinical sessions in the platform.


---

# 3. Identity Model

## 3.1 Staff Identity

Every authenticated request is made on behalf of a Staff entity.

Staff identity includes:

- `staffId`
- `organizationId`
- `clinicId`

Staff identity is always tenant-scoped.

---

## 3.2 Tenant Context

All authenticated requests SHALL include:

- organization scope
- clinic scope (when applicable)

Tenant scope is enforced at authentication level.

Cross-tenant identity is not permitted.

---

# 4. Authentication Model

## 4.1 Identity-Based Authentication

Authentication SHALL be identity-based.

On successful authentication, the system issues a signed JWT.

---

## 4.2 AuthSession

Authentication sessions are modeled as `AuthSession` aggregates in the IAM module.

AuthSession represents the authentication lifecycle of a Staff member.

AuthSession owns:

- session identity
- session status
- expiration state
- revocation state

---

## 4.3 Authentication Flow

Authentication flow:

```text
Staff credentials
    ↓
Validate identity
    ↓
Create AuthSession
    ↓
Issue JWT
```

AuthSession MUST be created before issuing a JWT.

---

# 5. JWT Structure

## 5.1 Identity-Only Token

JWT SHALL contain only identity and request scope.

JWT SHALL NOT contain:

- roles
- permissions
- entitlements
- derived access state

This aligns with:

> AP-4 Identity-Only Authentication

---

## 5.2 JWT Payload

JWT payload SHALL include:

```text
- staffId
- organizationId
- clinicId
- authSessionId
- issuedAt
- expiresAt
```

---

## 5.3 Token Characteristics

JWT SHALL be:

- signed
- tamper-proof
- short-lived

JWT SHALL NOT be treated as a source of truth.

---

# 6. Authentication Validation

Every incoming request SHALL:

```text
1. Validate JWT signature
2. Extract identity
3. Validate AuthSession
4. Establish request context
```

---

## 6.1 JWT Validation

Reject if:

- signature is invalid
- token is expired
- token is malformed

---

## 6.2 AuthSession Validation

Reject if:

- AuthSession does not exist
- AuthSession is expired
- AuthSession is revoked

AuthSession is the source of truth for authentication validity.

---

## 6.3 Request Context

After validation, the system constructs request context:

```text
{
  staffId,
  organizationId,
  clinicId,
  authSessionId
}
```

This context is used by the authorization system.

---

# 7. AuthSession Lifecycle

AuthSession lifecycle is managed by the IAM module.

Typical states:

```text
ACTIVE 
EXPIRED 
REVOKED
```

---

## 7.1 Expiration

AuthSession SHALL expire after a defined duration.

Expired AuthSessions SHALL deny access.

---

## 7.2 Revocation

AuthSession MAY be revoked due to:

- logout
- security action
- administrative action

Revoked AuthSessions SHALL immediately deny access.

---

# 8. Security Guarantees

This authentication model guarantees:

- identity-only tokens
- no embedded authorization state
- revocable sessions
- tenant-scoped identity
- server-controlled authentication validation

Authentication SHALL NOT grant access by itself.

All access decisions are handled by the authorization system.

---