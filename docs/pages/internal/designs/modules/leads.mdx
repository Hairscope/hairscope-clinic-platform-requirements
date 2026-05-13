# Module: Leads

> **Version:** 1.0.0  
> **Status:** Draft  
> **Layer:** Module Design  
> **Scope:** Lead Capture, Lead Lifecycle, Lead Interactions, Conversion, and Pre-Patient Relationship Management

---

# 1. Purpose

The Leads module represents a prospective patient
interacting with a Clinic before becoming a Patient.

It is the acquisition boundary of the platform.

The Leads module owns:

- lead profile  
- lead contact information  
- lead lifecycle state  
- lead interaction history  
- lead conversion state  
- lead-level access boundary  
- clinic-scoped lead identity  
- clinic-local GDPR erasure state  

A Lead is not a Patient.

A Lead MAY:

- convert into a new Patient  
- link to an existing Patient during conversion  
- remain unconverted  

---

# 2. Responsibilities

The Leads module SHALL:

- create and manage Lead records  
- maintain clinic-scoped Lead identity  
- enforce Lead invariants  
- manage Lead lifecycle  
- record Lead interactions  
- support conversion workflows  
- support GDPR erasure of personal identifiers  
- define access boundaries for Lead-owned resources  

The Leads module SHALL NOT:

- manage Patient lifecycle  
- manage Session lifecycle  
- perform AI analysis  
- generate reports  
- manage billing  

The Leads module SHALL NOT access Patient records directly.

Patients SHALL NOT access Lead records directly.

Lead conversion MAY establish linkage to existing Patient through Patients module boundary

---

# 3. Aggregate

## 3.1 Lead (Aggregate Root)

A Lead belongs to exactly one Organization.

A Lead MAY additionally be assigned to one Clinic within that Organization.

If assigned, a Lead belongs to exactly one Clinic.

A Lead MAY also exist as an unassigned organizational Lead until Clinic assignment occurs.

The Lead aggregate represents a prospective patient within a specific Clinic.

The Lead aggregate is the authoritative source of:

- lead identity within a Clinic  
- lead profile state  
- lead lifecycle state  
- lead interaction history  
- lead conversion state  
- lead erasure state  

---

# 4. Entities

The Lead aggregate SHALL contain:

- Lead  
- LeadActivity  

Patients created or linked through conversion
remain owned by the Patients module.

---

# 5. Value Objects

The Lead aggregate MAY use value objects, including:

- LeadStatus  
- ContactInformation  
- LeadSource  
- InteractionChannel  
- ConversionState  
- ErasureState  

---

# 6. Invariants

The system SHALL ensure:

- A Lead belongs to exactly one Organization
- A Lead MAY be assigned to any Clinic within that Organization
- If assigned, a Lead belongs to exactly one Clinic within that Organization
- Lead identifying information MAY overlap with other Leads according to domain capture workflows.
- A Lead MAY remain unconverted  
- A Lead SHALL convert at most once  
- Conversion SHALL result in exactly one outcome:
  - creation of a new Patient
  - linkage to one existing Patient
- A converted Lead SHALL NOT convert again  
- Leads SHALL NOT participate in cross-clinic identity linking  

---

# 7. Lifecycle

The Lead lifecycle SHALL support progression through
domain-defined intermediate states.

Example lifecycle:

```text
NEW → CONTACTED → QUALIFIED → CONVERTED
                           └→ LOST
```

Rules:

- intermediate stages MAY vary by domain policy  
- `CONVERTED` is terminal  
- `LOST` is terminal  
- conversion SHALL establish Patient linkage  

---

# 8. Lead Profile

The Leads module SHALL own Lead profile information.

Profile data SHALL include:

- required identifying information  
- optional contact information  
- optional demographic information  
- optional source attribution  

Profile updates SHALL preserve Lead identity invariants.

---

# 9. Lead Interactions

The Leads module SHALL own Lead interaction history.

Lead interactions MAY include:

- communication channel  
- interaction notes  
- follow-up context  
- interaction timing  

Lead interactions SHALL remain lead-scoped
and SHALL be auditable.

---

# 10. Conversion Boundary

Lead conversion SHALL occur through the Patients module boundary.

Conversion SHALL:

- preserve relevant identifying information  
- preserve relevant contact information  
- preserve relevant supporting context  
- establish exactly one Patient relationship  

That relationship MAY be:

- newly created Patient  
- existing Patient linkage  

The Leads module SHALL NOT own Patient state after conversion.

---

# 11. GDPR Erasure

The Leads module SHALL support GDPR erasure
for Lead personal identifiers.

GDPR erasure SHALL:

- anonymize personal identifiers  
- preserve conversion history  
- preserve auditability  
- be irreversible  
- remain clinic-scoped  

Erasure SHALL NOT affect Patient records
linked through conversion.

---

# 12. Events

## 12.1 Emitted

The Leads module SHALL emit domain events
for significant Lead domain actions.

This includes events representing:

- Lead creation  
- Lead interaction recorded  
- Lead status changed  
- Lead converted  
- GDPR erasure completion  

---

## 12.2 Consumed

The Leads module does not require consumption
of external domain events.

---

# 13. Audit Boundary

Critical Lead domain actions SHALL be auditable.

This includes:

- lead profile changes  
- interaction records  
- status transitions  
- conversion actions  
- patient linkage actions  
- GDPR erasure actions  

---

# 14. Access Control Boundary

Lead access SHALL be governed by Leads module permissions.

Lead permissions SHALL define access to:

- lead profile  
- lead interaction history  
- lifecycle state  
- conversion actions  

---

# 15. Cross-Module Relationships

## 15.1 Patients Module

A Lead MAY establish exactly one Patient relationship through conversion.

That relationship MAY be:

- newly created Patient  
- linkage to existing Patient  

The Leads module SHALL NOT manage Patient lifecycle.

---

## 15.2 Sessions Module

A Lead SHALL NOT own Sessions.

Sessions may only exist for Patients.

---

## 15.3 Appointments Module

Appointments MAY reference Leads before conversion.

After conversion, Appointments MAY reference the resulting Patient.

The Leads module SHALL NOT manage Appointment lifecycle.

---

# 16. Data Ownership

The Leads module owns:

- lead profile  
- lead identifiers (clinic-scoped)  
- lead lifecycle state  
- lead interaction history  
- lead conversion state  
- lead erasure state  

The Leads module does NOT own:

- Patient records  
- Sessions  
- appointments  

---

# 17. Boundaries

The Leads module SHALL NOT:

- create Sessions directly  
- manage Patient lifecycle after conversion  
- access another module's storage directly  
- bypass tenant isolation boundaries  
- bypass Leads permission boundaries  
- participate in cross-clinic identity linking  

---