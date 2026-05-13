# Module: Appointments

> Covers: Appointment aggregate, appointment lifecycle, slot management, smart scheduling integration, and cross-module relationships.

---

# 1. Purpose

The Appointments module represents a scheduled clinical interaction
between a Clinic and a prospective or existing patient.

It is the scheduling boundary of the platform.

The Appointments module owns:

- appointment scheduling  
- appointment lifecycle state  
- appointment references  
- appointment-level access boundary  

An Appointment SHALL reference:

- exactly one Lead  
OR
- exactly one Patient

at creation time.

Appointments MAY later reference both
through Lead conversion.

---

# 2. Responsibilities

The Appointments module SHALL:

- create and manage Appointment records  
- maintain appointment scheduling state  
- enforce Appointment invariants  
- support Lead-linked appointments  
- support Patient-linked appointments  
- support conversion-aware appointment linkage  
- initiate clinical workflow entry points  
- define access boundaries for Appointment-owned resources  

The Appointments module SHALL NOT:

- manage Lead lifecycle  
- manage Patient lifecycle  
- manage Session lifecycle  
- perform AI analysis  
- generate reports  

Referenced Lead and Patient ownership
remain within their respective modules.

---

# 3. Aggregate

## 3.1 Appointment (Aggregate Root)

The Appointment aggregate represents a scheduled interaction
within a specific Clinic.

An Appointment belongs to exactly one Clinic.

An Appointment belongs to exactly one Organization
through that Clinic.

The Appointment aggregate is the authoritative source of:

- appointment scheduling state  
- appointment lifecycle state  
- appointment reference state  

---

# 4. Entities

The Appointment aggregate SHALL contain:

- Appointment  

Sessions created through Appointment workflows
remain owned by the Sessions module.

Lead and Patient records referenced by Appointment
remain owned by their respective modules.

---

# 5. Value Objects

The Appointment aggregate MAY use value objects, including:

- AppointmentStatus  
- AppointmentTimeRange  
- AppointmentType  
- AppointmentReferenceState  

---

# 6. Invariants

The system SHALL ensure:

- An Appointment belongs to exactly one Clinic  
- An Appointment belongs to exactly one Organization through that Clinic  
- At creation, an Appointment SHALL reference exactly one:
  - Lead
  - Patient
- At creation, an Appointment SHALL NOT reference both Lead and Patient  
- After Lead conversion, an Appointment MAY reference both Lead and Patient  
- A Lead SHALL have at most one active Appointment  
- A Patient SHALL have at most one active Appointment  
- Lead-linked Appointments SHALL NOT create Sessions  
- Patient-linked Appointments MAY initiate creation of one Draft Session according to domain workflow policy.  
- When a Lead linked to an active Appointment converts into or links to a Patient:
  - the Appointment SHALL preserve Lead reference
  - the Appointment MAY add Patient reference
  - one Draft Session MAY be initiated for the resulting Patient according to conversion workflow policy.
- A `DELETED` Appointment is terminal and SHALL NOT transition to any other state

Active Appointment states SHALL be defined by domain policy.

---

# 7. Lifecycle

The Appointment lifecycle SHALL be:

```text
SCHEDULED → CONFIRMED
CONFIRMED → COMPLETED
SCHEDULED → CANCELLED
CONFIRMED → CANCELLED
CONFIRMED → NO_SHOW
SCHEDULED → DELETED
CANCELLED → DELETED
NO_SHOW → DELETED
```

Terminal states:

- COMPLETED  
- CANCELLED  
- NO_SHOW  
- DELETED  

Rules:

- `SCHEDULED` → appointment created  
- `CONFIRMED` → appointment acknowledged or confirmed  
- `COMPLETED` → appointment successfully concluded  
- `CANCELLED` → appointment cancelled before completion  
- `NO_SHOW` → appointment unattended  
- `DELETED` → appointment removed from active scheduling state  

Rescheduling SHALL occur by:

- deleting current Appointment  
- creating new Appointment  

Rescheduling SHALL NOT mutate an existing Appointment
into a new scheduled instance.

---

# 8. Scheduling

The Appointments module SHALL own scheduling information.

Scheduling information MAY include:

- date  
- time  
- duration  
- appointment type  
- scheduling notes  

Scheduling updates SHALL preserve Appointment invariants.

---

# 9. Clinical Workflow Initiation

Appointments MAY initiate clinical workflow.

Clinical workflow initiation SHALL follow:

- Lead-linked Appointment → no Session creation  
- Patient-linked Appointments May initiate creation of one Draft Session according to domain workflow policy
- Lead conversion during active Appointment → initiate creation of one Draft Session for the resulting Patient  

The Appointments module SHALL NOT own Session state.

---

# 10. Conversion Boundary

Appointments MAY participate in Lead conversion workflows.

When a Lead linked to an Appointment converts:

- Lead reference SHALL remain  
- resulting Patient reference MAY be added  
- acquisition history SHALL be preserved  
- one Draft Session MAY be initiated for the resulting Patient according to conversion workflow policy.  

Appointment conversion participation SHALL NOT alter
Lead ownership or Patient ownership boundaries.

---

# 11. Events

## 11.1 Emitted

The Appointments module SHALL emit domain events
for significant Appointment domain actions.

This includes events representing:

- Appointment creation  
- Appointment confirmation  
- Appointment completion  
- Appointment cancellation  
- Appointment no-show  
- Appointment deletion  
- Appointment linked to Patient through conversion  

---

## 11.2 Consumed

The Appointments module MAY consume domain events
required for appointment relationship updates
caused by domain state changes.

---

# 12. Audit Boundary

Critical Appointment domain actions SHALL be auditable.

This includes:

- appointment creation  
- scheduling changes  
- status transitions  
- deletion actions  
- conversion linkage actions  
- workflow initiation actions  

---

# 13. Access Control Boundary

Appointment access SHALL be governed by Appointments module permissions.

Appointment permissions SHALL define access to:

- appointment scheduling  
- appointment lifecycle state  
- appointment creation  
- appointment modification  
- appointment cancellation  

Appointments SHALL define their own access boundary.

Referenced Leads and Patients retain their own module access boundaries.

Sessions retain the Sessions module access boundary.

---

# 14. Cross-Module Relationships

## 14.1 Leads Module

Appointments MAY reference Leads.

Lead ownership remains within Leads module.

Appointments SHALL NOT manage Lead lifecycle.

---

## 14.2 Patients Module

Appointments MAY reference Patients.

Patient ownership remains within Patients module.

Appointments SHALL NOT manage Patient lifecycle.

---

## 14.3 Sessions Module

Appointments MAY initiate Session creation
according to Appointment workflow rules.

Sessions remain owned by the Sessions module.

Appointments SHALL NOT manage Session lifecycle.

---

# 15. Data Ownership

The Appointments module owns:

- appointment scheduling state  
- appointment lifecycle state  
- appointment reference state  

The Appointments module does NOT own:

- Lead records  
- Patient records  
- Session records  

---

# 16. Boundaries

The Appointments module SHALL NOT:

- manage Lead lifecycle  
- manage Patient lifecycle  
- manage Session lifecycle  
- access another module's storage directly  
- bypass tenant isolation boundaries  
- bypass Appointment permission boundaries  

---