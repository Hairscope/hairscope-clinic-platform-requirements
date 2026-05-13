# Hairscope Platform — Engine Architecture

> Covers: Stateless decision engines, computation principles, engine types, invocation model, and engine boundaries.

---

# 1. Purpose

This document defines the architecture of decision engines in the Hairscope Platform.

It establishes:

- what engines are  
- how engines operate  
- how engines interact with the system  
- constraints and guarantees of engine behavior  

This document answers:

> How does the system compute decisions without owning state?

This document derives from:

- `01-system-architecture.md` (Engines, AP-9 Stateless Engines)
- `03-domain-modeling.md`
- `05-authorization.md` (Access Resolution Engine)

---

# 2. Definition

An **engine** is a stateless computation unit that:

- receives input context  
- applies deterministic logic  
- produces an output or decision  

Engines do not own or mutate domain state.

---

# 3. Engine Principles

## EA-1 Statelessness

Engines SHALL be stateless.

Engines SHALL NOT persist data.

---

## EA-2 Deterministic Behavior

Given the same inputs, an engine SHALL produce the same output.

---

## EA-3 Side-Effect Free

Engines SHALL NOT:

- write to persistence  
- emit events  
- trigger workflows  

Engines compute decisions only.

---

## EA-4 Input-Driven Execution

All required domain data SHALL be provided as input.

Engines SHALL NOT directly access platform persistence.

---

## EA-5 Replaceability

Engines SHALL be replaceable without impacting:

- domain models  
- module boundaries  
- system contracts  

---

# 4. Engine Types

The platform includes multiple engines, including but not limited to:

---

## 4.1 Access Resolution Engine

Determines whether a request is:

```text
ALLOWED
DENIED
```

Used during request execution.

---

## 4.2 Entitlement Engine

Determines feature availability and limits based on subscription.

---

## 4.3 Recommendation Engine

Generates recommendations based on provided context.

---

## 4.4 AI Models (Worker Service)

> **Note:** AI Models are NOT a stateless engine. They are a stateful Worker Service deployed separately. See `01-system-architecture.md` Section 5.1 for Worker Service architecture. Retained here for historical reference only.

---

## 4.5 Report Generation Service (Worker Service)

> **Note:** Report Generation is NOT a stateless engine. It is a stateful Worker Service that renders PDFs, stores files, tracks generation state, and retries failures. See `01-system-architecture.md` Section 5.1 for Worker Service architecture. Retained here for historical reference only.

---

## 4.6 Scheduling Engine

Determines scheduling decisions based on input constraints.

---

## 4.7 Lead Distribution Engine

Determines assignment of leads based on input context.

---

# 5. Engine Inputs

Engines operate on structured input.

Input MAY include:

- domain data  
- contextual data  
- configuration  
- external signals  

All required domain data SHALL be provided by the invoking layer.

---

# 6. Engine Outputs

Engines produce outputs such as:

- decisions (e.g., ALLOWED / DENIED)  
- recommendations  
- computed values  
- structured results  

Outputs SHALL be consumed by the invoking layer.

---

# 7. Invocation Model

Engines SHALL be invoked during request execution or workflow orchestration.

Invocation MAY occur within:

- API layer (e.g., access control)  
- application layer (e.g., business workflows)  

Flow:

```text
Invoking Layer
    ↓
Engine Invocation
    ↓
Engine computes result
    ↓
Invoking Layer applies result
```

---

# 8. Engine and Domain Interaction

Engines SHALL NOT:

- enforce domain invariants  
- modify aggregates  

Domain layer remains the source of truth for invariants.

Engines assist decision-making only.

---

# 9. Engine and Data Interaction

Engines SHALL NOT directly access platform persistence.

All required domain data MUST be provided as input.

This ensures:

- determinism  
- isolation  
- testability  

---

# 10. Engine and Event Interaction

Engines SHALL NOT emit events.

Application layer SHALL interpret engine output  
and decide whether to emit domain events.

---

# 11. Execution Context

Engines MAY be executed:

- during request processing  
- during asynchronous workflows  

Execution timing does not change engine behavior.

---

# 12. Guarantees

This engine architecture guarantees:

- deterministic decision-making  
- stateless computation  
- clear separation of concerns  
- replaceable logic components  
- alignment with domain and application layers  

Engines remain independent from:

- persistence  
- transport  
- infrastructure  

---