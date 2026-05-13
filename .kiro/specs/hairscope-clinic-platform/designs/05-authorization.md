# Hairscope Platform — Authorization

> Covers: Access resolution, permission evaluation, tenant-aware authorization, and enforcement model.

---

# 1. Purpose

The Access Resolution Engine defines how the platform determines whether a request is:

```text
ALLOWED
DENIED
```

This document defines the evaluation model used to compute access decisions.

This document derives from:

- `01-system-architecture.md` (AP-5 Server-Authoritative Access Control)
- `03-domain-modeling.md` (IAM, Organization, Subscription)
- `04-authentication.md` (identity and AuthSession)

---

# 2. Design Principles

## AZ-1 Server Authority  
All access decisions SHALL be computed on the server.

---

## AZ-2 Deterministic Evaluation  
Given the same inputs, evaluation SHALL produce the same result.

---

## AZ-3 Deny by Default  
Access SHALL be denied unless explicitly allowed.

---

## AZ-4 Stateless Execution  
The engine SHALL be stateless.  
All required inputs SHALL be resolved before evaluation.

---

## AZ-5 Composable Constraints  
Access is determined by combining independent constraints.  
Failure of any constraint SHALL result in denial.

---

# 3. Inputs

The Access Resolution Engine operates on the following inputs.

---

## 3.1 Identity Context

Derived from authenticated request:

- `staffId`
- `organizationId`
- `clinicId`
- `authSessionId`

---

## 3.2 Access Context

Resolved access state for the Staff.

This context is derived from:

- role assignments (IAM module)
- permission definitions
- subscription state (Organization module)

The Access Resolution Engine SHALL operate only on this resolved context.

The context includes:

- effective permissions
- entitlement state (available features and applicable limits)

This context MAY be cached.

---

## 3.3 Resource Context

Defines what is being accessed:

- target module
- target entity (optional)
- action

---

## 3.4 System Context

Operational state of the system:

- organization status
- clinic status
- staff status
- AuthSession validity

---

# 4. Evaluation Pipeline

Access SHALL be evaluated in the following order:

```text
1. Validate AuthSession
2. Validate tenant scope
3. Validate account status
4. Obtain Access Context
5. Check permission
6. Apply system invariants
7. Apply entitlement constraints
8. Return decision
```

---

## 4.1 AuthSession Validation

Reject if:

- AuthSession does not exist
- AuthSession is expired
- AuthSession is revoked

---

## 4.2 Tenant Scope Validation

Reject if:

- organization mismatch
- clinic access is not permitted

---

## 4.3 Account Status

Reject if:

- organization is inactive
- clinic is inactive
- staff is inactive

---

## 4.4 Access Context Resolution

Access context SHALL be obtained from either:

- previously cached state, or  
- fresh resolution from source systems

Resolved context MUST reflect:

- effective permissions
- current entitlement state

---

## 4.5 Permission Check

Reject if required permission is not present in the resolved permission set.

Permission evaluation SHALL be efficient and suitable for synchronous request handling.

---

## 4.6 System Invariants

Apply domain-specific rules defined by modules.

Examples include:

- tenant isolation rules  
- resource ownership constraints  
- workflow-specific restrictions  

---

## 4.7 Entitlement Constraints

Reject if:

- subscription is expired  
- feature is not available in the current plan  
- usage limits are exceeded  

---

## 4.8 Decision

Return:

```text
ALLOWED
DENIED
```

---

# 5. Decision Output

Access decision SHALL include:

```text
{
  decision: ALLOWED | DENIED,
  reason: string
}
```

---

## 5.1 Standard Denial Reasons

- AUTH_SESSION_INVALID  
- TENANT_SCOPE_VIOLATION  
- ACCOUNT_INACTIVE  
- PERMISSION_DENIED  
- FEATURE_NOT_AVAILABLE  
- SUBSCRIPTION_EXPIRED  
- USAGE_LIMIT_EXCEEDED  

---

# 6. Caching

Access context MAY be cached to improve performance.

The following MAY be cached:

- resolved permissions  
- entitlement state  

Cache is an optimization only.

The source of truth SHALL remain:

- IAM state  
- Organization state  
- Subscription state  

Access decisions SHALL NOT be cached.

Access SHALL always be evaluated at request time.

---

## 6.1 Cache Invalidation

Cache SHALL be invalidated on any change that affects access:

- role assignment changes  
- role definition changes  
- permission changes  
- subscription changes  
- staff status changes  
- clinic status changes  
- organization status changes  

---

# 7. Performance Characteristics

Access evaluation SHALL be lightweight and suitable for synchronous execution within request lifecycle.

Evaluation SHALL not require external network calls.

---

# 8. Security Guarantees

This model guarantees:

- server-authoritative access control (AP-5)  
- identity-only authentication (via 04)  
- tenant-safe isolation (AP-6)  
- deterministic and auditable decisions  
- entitlement-aware feature gating  
- revocable session enforcement  

All access decisions in the platform SHALL pass through this engine.

---