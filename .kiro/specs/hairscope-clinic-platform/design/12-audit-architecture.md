# Hairscope Platform — Audit Architecture

> **Version:** 1.0.0  
> **Status:** Draft  
> **Layer:** Platform Design  
> **Scope:** Audit Logging, Historical Records, and Compliance

---

# 1. Purpose

This document defines how the Hairscope Platform records and maintains
auditable history of domain actions.

It establishes:

- what is audited  
- how audit records are created  
- immutability guarantees  
- access and visibility  
- relationship to domain events  

This document answers:

> How does the system maintain a reliable, immutable history of what happened?

This document derives from:

- `03-domain-modeling.md` (Audit Module)
- `06-data-layer.md` (immutable historical data)
- `07-event-processing.md`
- `10-storage-architecture.md`
- `11-observability.md` (separation of concerns)

---

# 2. Definition

An **audit record** represents a factual, immutable record of a domain action
that has occurred in the system.

Audit records:

- describe completed actions  
- are append-only  
- cannot be modified or deleted  

---

# 3. Design Principles

## AA-1 Domain-Driven Audit

Audit records SHALL reflect domain actions and state transitions.

Audit SHALL be part of the domain system, not an operational concern.

---

## AA-2 Immutability

Audit records SHALL be immutable.

Once created, an audit record SHALL NOT be:

- modified  
- deleted  

---

## AA-3 Completeness

All significant domain actions SHALL be auditable.

Audit coverage SHALL include actions that:

- change aggregate state  
- affect patient records  
- affect billing or financial records  
- affect access or permissions  

---

## AA-4 Source of Truth

Audit records SHALL serve as the authoritative history of domain actions.

Audit SHALL NOT rely on:

- observability logs  
- external systems  

---

## AA-5 Separation from Observability

Audit SHALL remain distinct from observability systems.

- Audit → domain history  
- Observability → system behavior  

---

# 4. Audit Ownership

Audit functionality SHALL be owned by the **Audit Module**.

The Audit Module SHALL:

- define audit record structure  
- store audit records  
- provide access to audit history  

Other modules SHALL NOT directly manage audit persistence.

---

# 5. Audit Record Model

Audit records SHALL include:

- entity identifier (e.g., sessionId, patientId)  
- entity type  
- action performed (e.g., CREATED, UPDATED, COMPLETED)  
- actor (staffId or system)  
- timestamp  
- contextual metadata  

Audit records SHALL be structured and consistent.

---

# 6. Audit Creation

---

## 6.1 Triggering

Audit records SHALL be created when:

- a domain action is completed  
- an aggregate state transition occurs  

---

## 6.2 Creation Responsibility

Audit creation SHALL be triggered by the application layer
based on domain events.

Flow:

```text
Domain Event
    ↓
Application Layer
    ↓
Audit Module creates record
```

---

## 6.3 Consistency

Audit creation SHALL be consistent with domain state.

Audit records SHALL reflect the final state of the completed action.

---

# 7. Audit and Domain Events

Audit records SHALL be derived from domain events.

- Domain events describe what happened  
- Audit records persist that history  

Audit SHALL NOT replace domain events.

Domain events and audit records serve different purposes.

---

# 8. Data Integrity

The system SHALL ensure:

- no missing audit records for auditable actions  
- no duplicate audit entries for the same action  
- consistent ordering within an entity timeline  

---

# 9. Access and Visibility

Audit data SHALL be accessible to authorized users.

Access SHALL:

- respect tenant boundaries  
- respect role-based permissions  

Audit data SHALL NOT be publicly accessible.

---

# 10. Retention

Audit records SHALL be retained based on system requirements.

Critical audit data MAY require long-term or permanent retention.

Retention policies SHALL be defined at the module level.

---

# 11. Security Considerations

Audit records SHALL:

- avoid exposure of sensitive data beyond necessity  
- be protected from unauthorized modification  
- be protected from unauthorized access  

---

# 12. Guarantees

This audit architecture guarantees:

- immutable and reliable history of domain actions  
- clear separation from observability systems  
- alignment with domain events and aggregate changes  
- tenant-safe and secure audit access  
- consistency with data and storage architecture  

Audit remains independent from:

- observability systems  
- infrastructure implementation  
- transport layer  

---