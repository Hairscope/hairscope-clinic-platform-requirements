# Hairscope Platform — Repository Architecture

> **Version:** 1.0.0  
> **Status:** Draft  
> **Layer:** Platform Design  
> **Scope:** Hairscope Platform Backend Repository

---

# 1. Purpose

This document defines the repository architecture of the Hairscope Platform backend.

It establishes:

- repository boundaries
- source code organization
- module internal structure
- engine placement
- infrastructure placement
- dependency direction
- shared code rules
- testing placement
- generated code placement
- forbidden architectural patterns

This document is the canonical reference for how backend source code SHALL be organized.

All implementation MUST conform to this structure.

---

# 2. Repository Model

The Hairscope Platform backend SHALL be implemented as a **single backend repository**.

Repository responsibilities:

- business modules
- engines
- infrastructure adapters
- event processing
- background workers
- operational tooling
- shared internal libraries
- unified GraphQL composition (via platform layer)

Frontend applications SHALL remain in separate repositories.

Examples:

- hairscope-web
- hairscope-mobile
- hairscope-care
- hairscope-pro

The backend repository is the canonical source of platform business logic.

---

# 3. Top-Level Repository Structure

Repository structure SHALL be organized as follows:

```text
hairscope-backend/
│
├── src/
├── tests/
├── docs/
├── scripts/
├── generated/
├── config/
└── package.json
```

---

## 3.1 src/

Contains all platform runtime source code.

This is the primary codebase.

Contains:

- modules
- engines
- infrastructure
- shared
- platform

---

## 3.2 tests/

Contains platform-level tests.

This directory SHALL contain tests that validate:

- cross-module interactions
- end-to-end workflows
- platform contracts
- system integration
- operational correctness

Module-local tests SHALL remain inside modules.

---

## 3.3 docs/

Contains:

- architecture documents
- implementation documents
- ADRs
- operational runbooks

No runtime code belongs here.

---

## 3.4 scripts/

Contains operational scripts.

Scripts are operational tools.

Scripts SHALL NOT become part of runtime architecture.

Scripts SHALL NOT contain business logic.

Scripts invoke platform APIs or contracts.

---

## 3.5 generated/

Contains generated artifacts.

Generated artifacts are derived outputs.

Generated files SHALL NOT be manually edited.

---

## 3.6 config/

Contains platform configuration definitions.

Configuration SHALL remain externalized from runtime logic.

---

# 4. Source Structure

The `src/` directory SHALL be structured as:

```text
src/
├── modules/
├── engines/
├── infrastructure/
├── shared/
└── platform/
```

Each directory has clear ownership and responsibility.

Directory purpose SHALL remain strict.

---

# 5. Modules

Path:

```text
src/modules/
```

Modules are bounded business contexts.

Modules own:

- domain entities
- invariants
- workflows
- domain events
- contracts
- application services
- persistence abstractions

Modules SHALL remain isolated from one another.

No module SHALL directly own another module's state.

Modules communicate only through:

- events
- published contracts
- engine contracts

Platform modules include:

```text
iam/ 
organization/
audit/
patients/
sessions/
leads/
appointments/
products/
billing/
```

Future modules MAY be added.

---

## 5.1 Module Internal Structure

Every module SHALL follow the same structure:

```text
module-name/
├── domain/
├── application/
├── repository/
├── graphql/
├── events/
├── contracts/
├── tests/
└── index.ts
```

Uniformity is mandatory.

Developers SHALL be able to navigate any module using the same mental model.

---

## 5.2 domain/

Contains pure business logic.

Responsibilities:

- entities
- aggregates
- business rules
- invariants
- state transitions
- domain services
- domain events
- value objects

Domain code SHALL be pure business logic.
Domain SHALL NOT depend on:

- infrastructure
- transport
- persistence implementation
- framework implementation details

---

## 5.3 application/

Contains use-case orchestration.

Responsibilities:

- command handling
- workflow orchestration
- transaction coordination
- engine invocation
- audit append coordination
- outbox write coordination

Application layer coordinates domain execution.

Application SHALL NOT define core business invariants.

Application SHALL NOT hold infrastructure implementation details.

---

## 5.4 repository/

Contains persistence abstractions owned by the module.

Responsibilities:

- aggregate loading
- aggregate saving
- query abstractions
- storage mapping

Repository layer abstracts persistence.

Business logic SHALL NOT live here.

Repository SHALL remain implementation-agnostic.

Persistence implementation belongs in infrastructure.

---

## 5.5 graphql/

Contains API transport bindings.

Responsibilities:

- queries
- mutations
- resolvers
- schema bindings
- request mapping
- response mapping

GraphQL SHALL remain transport-only.

Business rules SHALL NOT live here.

Each module owns its own GraphQL surface.

GraphQL SHALL NOT initiate cross-module workflows directly.

Platform composition SHALL assemble all module GraphQL surfaces into a unified API.

---

## 5.6 events/

Contains event consumers and cross-module reaction logic.

Responsibilities:

- event consumers
- event mapping
- idempotency coordination
- cross-module reaction handlers

Consumers SHALL remain deterministic and replay-safe.

---

## 5.7 contracts/

Contains public module contracts.

Contracts define module boundaries.

Contracts SHALL remain explicit, stable, and intentional.

Internal implementation SHALL NOT leak through contracts.

---

## 5.8 tests/

Contains module-local tests.

Each module owns its own correctness tests.

Testing ownership SHALL remain local to module boundaries.

Examples:

- domain tests
- application tests
- repository tests
- event tests

---

## 5.9 index.ts

Module public entrypoint.

Exports:

- public services
- public contracts
- registration hooks

Only intentionally published module interfaces SHALL be exported.

Internal implementation SHALL remain private.

---

# 6. Engines

Path:

```text
src/engines/
```

Engines are platform decision systems.

Engines do not own business state.

Engines:
- compute decisions
- compute derived outputs
- remain deterministic
- remain stateless
- remain replaceable

Engines SHALL be reusable across different modules.

Engines SHALL NOT depend on module-specific state.

Engines SHALL NOT directly persist state.

Engines SHALL be composed into workflows inside modules.

Examples:

```text
lead-distribution/
smart-scheduling/
ai-analysis/
recommendation/
report-generation/
entitlement/
```

Each engine SHALL follow a uniform structure:

```text
engine-name/
├── domain/
├── application/
├── contracts/
├── tests/
└── index.ts
```

Engine organization SHALL remain consistent across the platform.

---

# 7. Infrastructure

Path:

```text
src/infrastructure/
```

Contains implementation adapters that support platform execution.

Infrastructure responsibilities:

- persistence implementation
- cache implementation
- storage implementation
- messaging implementation
- scheduling implementation
- security implementation
- observability implementation
- external integration implementation

Infrastructure SHALL support business execution.

Infrastructure SHALL NOT define business rules.

---

# 8. Shared

Path:

```text
src/shared/
```

Contains platform-wide primitives.

Shared MAY contain:

- primitives
- shared errors
- shared validation
- generic utilities
- value objects
- common types

Shared SHALL remain minimal.

Shared SHALL NOT contain business logic owned by specific modules.

Module-owned logic SHALL remain inside its owning module.

If code belongs to one module, it SHALL remain inside that module.

---

# 9. Platform

Path:

```text
src/platform/
```

Contains platform startup composition.

Responsibilities:

- module registration
- dependency wiring
- engine registration
- infrastructure composition
- unified GraphQL composition
- startup lifecycle
- shutdown lifecycle

Platform wires the backend together.

Platform SHALL NOT contain business rules.

Platform SHALL NOT become a business module.

---

# 10. Testing Architecture

Testing SHALL be layered.

Module-local correctness testing SHALL remain inside:

```text
module-name/tests/
```

Platform-wide testing SHALL remain inside:

```text
tests/
```

Testing organization SHALL preserve:

- ownership clarity
- bounded correctness
- integration correctness
- platform correctness

---

# 11. Naming Rules

Naming SHALL be explicit, predictable, and consistent.

Naming is an architectural concern.

Repository naming SHALL optimize for:

- discoverability
- readability
- predictability
- maintainability
- AI-assisted navigation

---

## 11.1 Directory Naming

Directories SHALL use:

> **kebab-case**

Directory names SHALL remain explicit.

Directory names SHALL describe ownership clearly.

Ambiguous directory names are forbidden.

---

## 11.2 File Naming

File names SHALL be explicit.

A file name SHALL communicate its responsibility.

Ambiguous names are forbidden.

Examples of ambiguous names:

- helper
- utils
- common
- manager
- service
- misc

Generic naming creates architectural ambiguity.

---

## 11.3 Type Naming

Type names SHALL be descriptive and intentional.

Naming SHALL reveal meaning.

Naming SHALL prioritize clarity over brevity.

---

## 11.4 Event Naming

Domain events SHALL use:

> **past-tense business naming**

Event names SHALL describe something that already happened.

This aligns with event architecture defined in `01-system-architecture.md`.

---

## 11.5 Command Naming

Commands SHALL use:

> **imperative naming**

Commands represent requested actions.

---

## 11.6 Query Naming

Queries SHALL use:

> **descriptive read naming**

Queries represent information retrieval.

---

# 12. AI-Readable Codebase Principles

The repository SHALL remain AI-friendly.

Source code SHALL prioritize:

- explicit naming
- structural consistency
- local ownership
- predictable layout
- minimal hidden coupling
- small cohesive files
- discoverable boundaries

Code discoverability is a platform design concern.

Architectural clarity SHALL be preferred over cleverness.

---

# 13. Dependency Direction

Allowed dependency direction:

```text
API (GraphQL)
 ↓
Application
 ↓
Domain
 ↓
Infrastructure Implementation
```

Cross-module interaction SHALL happen only through:

- published contracts
- domain events
- engine contracts

Internal implementation details SHALL remain private.

Circular dependency is forbidden.

Dependency direction SHALL remain predictable platform-wide.

---

# 14. Forbidden Patterns

The following are forbidden:

## Direct Cross-Module Mutation

Forbidden:

```text
Billing writes directly into Patients persistence
Leads modifies Sessions aggregates directly
Appointments mutates IAM state directly
```

Use:

- events
- published contracts

---

## Business Logic in GraphQL

Forbidden:

```text
resolver validates domain rules
resolver performs transactional workflow
resolver emits events
```

Resolvers delegate only.

---

## Domain Depending on Infrastructure

Forbidden:

```text
domain imports cache
domain imports db
domain imports storage adapter
domain imports network client
```

Domain remains pure.

---

## Shared Business Logic Dumping

Forbidden:

```text
shared/patient-utils/
shared/billing-utils/
shared/session-helpers/
```

That is hidden coupling.

Business logic belongs in owning modules.

---

## Circular Module Dependencies

Forbidden:

```text
Patients imports Billing
Billing imports Patients
```

Cross-module interaction SHALL use contracts/events.

---

# 15. Architectural Guarantees

This repository architecture guarantees:

- predictable navigation
- strict module ownership
- pure domain modeling
- transport isolation
- infrastructure isolation
- engine isolation
- replay-safe event handling
- scalable code organization
- AI-readable structure
- future extraction readiness

This structure is mandatory platform-wide.

---