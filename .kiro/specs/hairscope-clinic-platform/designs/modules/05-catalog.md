# Module: Catalog

> Covers: CatalogItem aggregate, catalog item types, routines, treatment kits, service-specific scheduling fields, document generation workflow, digital signatures, and cross-module relationships.

---

# 1. Purpose

The Catalog module represents all offerings configured by a Clinic.

It is the single source of truth for services, medications, cosmetics,
and supplements available within a Clinic.

The Catalog module owns:

- catalog item definitions
- catalog item lifecycle
- routine templates
- treatment kit composition
- document generation workflow (Treatment Plan, Prescription)
- digital signature management

A CatalogItem belongs to exactly one Clinic.

---

# 2. Responsibilities

The Catalog module SHALL:

- create and manage CatalogItems
- enforce CatalogItem invariants
- manage Routine templates
- manage Treatment Kit composition
- orchestrate Treatment Plan and Prescription generation
- manage digital signature state
- emit domain events for downstream processing

The Catalog module SHALL NOT:

- manage appointment scheduling
- manage session lifecycle
- manage billing state
- manage patient records
- perform AI analysis
- deliver notifications

---

# 3. Aggregate

## 3.1 CatalogItem (Aggregate Root)

The CatalogItem aggregate represents a unified catalog entry.

A CatalogItem has exactly one type:

- SERVICE
- MEDICATION
- COSMETIC
- SUPPLEMENT

The CatalogItem aggregate is the authoritative source of:

- item definition
- item type
- pricing
- availability
- routine (default)
- qualified staff (SERVICE type only)

---

## 3.2 TreatmentKit (Aggregate Root)

The TreatmentKit aggregate represents a named bundle of CatalogItems.

A TreatmentKit:

- references one or more CatalogItems
- may contain any mix of item types
- has its own pricing (independent of item sum)
- has its own external link

---

## 3.3 Routine (Value Object or Aggregate)

A Routine represents a structured schedule instruction.

Routines MAY exist independently (reusable library)
OR be embedded within a CatalogItem.

Routine structure varies by item type:

- Product Routine (MEDICATION, COSMETIC, SUPPLEMENT): dosage, schedule (TimeSlots), frequency, duration
- Service Routine (SERVICE): frequency, duration, totalSessions

---

# 4. Entities

The Catalog module SHALL contain:

- CatalogItem
- TreatmentKit
- Routine
- DigitalSignature (per Staff member)

---

# 5. Value Objects

The Catalog module MAY use value objects, including:

- CatalogItemType
- CatalogItemStatus (ACTIVE, INACTIVE)
- RoutineTimeSlot
- ServiceDuration
- QualifiedStaffList
- TreatmentKitItem

---

# 6. Invariants

The system SHALL ensure:

- A CatalogItem belongs to exactly one Clinic
- A CatalogItem has exactly one type
- A SERVICE item has duration > 0
- A MEDICATION item has a non-empty routine with at least one TimeSlot
- A TreatmentKit has at least one item
- A TreatmentKit references only items from the same Clinic
- A Staff member has at most one active DigitalSignature
- Document generation requires a valid DigitalSignature
- Deleting a SERVICE item cancels all future appointments referencing it
- Inactive items are hidden from catalog search and recommendations
- Deleted items retain snapshots on existing documents

---

# 7. Lifecycle

### CatalogItem

```text
ACTIVE → INACTIVE
ACTIVE → DELETED
INACTIVE → ACTIVE
INACTIVE → DELETED
```

Rules:

- `ACTIVE` → visible in catalog, bookable, recommendable
- `INACTIVE` → hidden from search and recommendations, retained for history
- `DELETED` → permanently removed, snapshots preserved on existing documents

### TreatmentKit

```text
ACTIVE → DELETED
```

---

# 8. Document Generation Workflow

The Catalog module owns the Treatment Plan and Prescription generation workflow.

Flow:

```text
Session recommendations finalized
    ↓
Staff reviews recommendations
    ↓
Staff approves and triggers generation
    ↓
Platform validates DigitalSignature exists
    ↓
Treatment Plan PDF generated (all recommendations)
    ↓
Prescription PDF generated (MEDICATION items only, if any)
    ↓
Staff signature attached to documents
    ↓
TreatmentPlanSigned / PrescriptionSigned events emitted
```

Post-signing edits:

```text
Recommendation edited after signing
    ↓
Reason required
    ↓
Old item struck through in PDF (with reason, date, signature)
    ↓
New item added below
    ↓
PDF regenerated with history
    ↓
TreatmentPlanRegenerated / PrescriptionRegenerated events emitted
```

---

# 9. Events

## 9.1 Emitted

The Catalog module SHALL emit:

- `CatalogItemCreated`
- `CatalogItemUpdated`
- `CatalogItemDeleted`
- `TreatmentKitCreated`
- `TreatmentKitUpdated`
- `TreatmentKitDeleted`
- `TreatmentPlanSigned`
- `PrescriptionSigned`
- `TreatmentPlanRegenerated`
- `PrescriptionRegenerated`

## 9.2 Consumed

The Catalog module SHALL NOT consume domain events.

Catalog state is managed through direct mutations only.

---

# 10. Cross-Module Relationships

## 10.1 Sessions Module

Sessions reference CatalogItems for recommendations.

The Catalog module does NOT own session state.

Recommendation references are stored within the Session aggregate.

---

## 10.2 Appointments Module

Appointments reference SERVICE CatalogItems for booking.

The Catalog module does NOT own appointment state.

SERVICE deletion triggers appointment cancellation via events.

---

## 10.3 Billing Module

Billing references CatalogItems for invoice line items.

`TreatmentPlanSigned` and `PrescriptionSigned` events
trigger invoice updates in the Billing module.

The Catalog module does NOT own billing state.

---

## 10.4 Communication Policy Module

StressOMeter threshold triggers catalog item suggestions.

The Catalog module queries Communication Policy for threshold configuration.

---

# 11. Access Control Boundary

Catalog access SHALL be governed by Catalog module permissions:

- `catalog.view`
- `catalog.create`
- `catalog.edit`
- `catalog.delete`

Document generation requires appropriate permission
(not role-specific — any staff with permission may generate).

OrganizationAdmins do NOT have access to the Catalog module.

---

# 12. Data Ownership

The Catalog module owns:

- CatalogItem definitions
- TreatmentKit definitions
- Routine templates
- DigitalSignature state
- Treatment Plan generation state
- Prescription generation state

The Catalog module does NOT own:

- Session recommendation state (owned by Sessions)
- Appointment scheduling state (owned by Appointments)
- Invoice state (owned by Billing)

---

# 13. Boundaries

The Catalog module SHALL NOT:

- manage session lifecycle
- manage appointment scheduling
- manage billing state
- manage patient records
- access another module's storage directly
- bypass tenant isolation boundaries

---
