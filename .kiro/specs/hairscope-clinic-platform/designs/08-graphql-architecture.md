# Hairscope Platform — GraphQL Architecture

> **Version:** 1.0.0  
> **Status:** Draft  
> **Layer:** Platform Design  
> **Scope:** API Layer, GraphQL Schema, and Request Lifecycle

---

# 1. Purpose

This document defines how the Hairscope Platform exposes its capabilities through GraphQL.

It establishes:

- API layer responsibilities  
- GraphQL schema structure  
- resolver boundaries  
- request lifecycle  
- interaction with authentication, authorization, and application layers  

This document answers:

> How does the external world interact with the platform?

This document derives from:

- `01-system-architecture.md` (API Layer)
- `04-authentication.md`
- `05-authorization.md`
- `06-data-layer.md`
- `07-event-processing.md`

---

# 2. Design Principles

## GA-1 API as a Thin Layer

The API layer SHALL act as a thin boundary.

It SHALL:

- authenticate requests  
- validate input  
- construct request context  
- invoke authorization  
- delegate execution  

It SHALL NOT:

- contain business logic  
- enforce domain invariants  
- perform direct data access  

---

## GA-2 Module-Aligned Exposure

The API SHALL reflect module boundaries.

Each module SHALL expose only its owned capabilities.

No module SHALL expose or manipulate another module’s data.

---

## GA-3 Explicit Operations

All operations SHALL be explicit.

The API SHALL distinguish clearly between:

- queries (read-only)
- mutations (state-changing)

---

## GA-4 Stateless Requests

Each request SHALL be independent.

All required context SHALL be derived per request.

No request SHALL rely on previous request state.

---

## GA-5 Server Authority

All decisions SHALL be enforced on the server:

- authentication  
- authorization  
- data access  

Clients SHALL NOT be trusted.

---

# 3. Schema Structure

## 3.1 Root Types

The GraphQL schema SHALL define:

```text
Query
Mutation
```

---

## 3.2 Module Segmentation

Schema SHALL be logically segmented by module.

Operations SHALL align with domain capabilities exposed by each module.

---

## 3.3 Ownership Enforcement

Each field SHALL be resolved by the owning module.

No resolver SHALL directly access another module’s data.

Cross-module data access SHALL occur only through:

- module-defined interfaces  
- application layer orchestration  

---

# 4. Resolver Responsibilities

Resolvers act as the entry point for request execution.

---

## 4.1 Responsibilities

Resolvers SHALL:

- extract request input  
- access request context  
- invoke authorization  
- delegate execution to the application layer  
- return response  

Resolvers SHALL NOT execute application logic before authorization is enforced.

---

## 4.2 Restrictions

Resolvers SHALL NOT:

- implement business logic  
- enforce domain rules  
- access repositories directly  
- coordinate workflows directly  

---

## 4.3 Delegation

Resolvers SHALL delegate all business execution to:

```text
Application Layer
```

---

# 5. Request Lifecycle

Each request SHALL follow the same lifecycle:

```text
Incoming Request
    ↓
Authentication (JWT validation + AuthSession)
    ↓
Request Context Construction
    ↓
Resolver Entry
    ↓
Authorization (Access Resolution Engine)
    ↓
Application Layer Execution
    ↓
Domain Logic Execution
    ↓
Data Persistence (if mutation)
    ↓
Event Emission (if applicable)
    ↓
Response Returned
```

---

# 6. Query Operations

## 6.1 Characteristics

Queries SHALL:

- be read-only  
- not mutate state  
- not emit events  

---

## 6.2 Data Retrieval

Queries MAY:

- use module-defined query interfaces  
- retrieve optimized or denormalized data  
- combine data from multiple modules only through module-defined interfaces  

Queries SHALL NOT:

- bypass module boundaries  
- directly access storage  

Cross-module data access at the storage level is forbidden.

---

## 6.3 Execution Constraints

Query execution SHALL be efficient and bounded.

The API layer SHALL enforce limits to ensure predictable execution.

---

# 7. Mutation Operations

## 7.1 Characteristics

Mutations SHALL:

- change system state  
- operate on aggregates  
- enforce invariants through domain layer  

---

## 7.2 Execution Flow

Mutations SHALL:

- invoke the application layer  
- execute domain logic  
- persist changes  
- emit domain events (if applicable)  

---

## 7.3 Async Behavior

Mutations SHALL NOT block on:

- long-running processing  
- event delivery  

Mutations SHALL return once the state change is committed.

---

# 8. Context Model

Each request SHALL have a context containing:

```text
- staffId
- organizationId
- clinicId
- authSessionId
```

Context SHALL be derived from authentication.

Context SHALL be immutable during request execution.

---

# 9. Authorization Integration

Authorization SHALL be enforced within request execution.

Resolvers SHALL invoke the Access Resolution Engine
with the required resource and action context.

Authorization SHALL occur before invoking application layer logic.

Resolvers SHALL NOT execute application logic without successful authorization.

The API layer is responsible for invoking authorization,
not implementing authorization logic.

---

# 10. Error Handling

The API SHALL return structured errors.

Errors MAY include:

- validation errors  
- authorization failures  
- business rule violations  

Errors SHALL NOT expose internal system details.

---

# 11. Observability

The API layer SHALL support:

- request tracing  
- request logging  
- error tracking  

Each request SHALL have a trace identifier.

---

# 12. Security Considerations

The API layer SHALL enforce:

- authentication validation  
- authorization enforcement  
- input validation  
- tenant isolation  

No request SHALL bypass these checks.

---

# 13. Guarantees

This GraphQL architecture guarantees:

- strict separation of concerns  
- module-aligned API exposure  
- server-authoritative control  
- safe request execution  
- alignment with domain and data layers  
- compatibility with event-driven architecture  

---