# Recommendation and Treatment Plan Reference

> This document describes the current implementation of CatalogItems, ProtocolTemplates, TreatmentPlans, TreatmentRecommendations, routines, document projections, and signatures. It also identifies which Recommendation Engine capabilities are planned but not implemented.

## 1. Current implementation status

The current workflow is **manual-first**. Staff select CatalogItems and ProtocolTemplates, customize the selected routine for a patient, and save the result as a TreatmentRecommendation.

```text
Saved or completed session
        ↓
TreatmentPlan
        ↓
Select active CatalogItem
        ↓
Select active ProtocolTemplate
        ↓
Customize patient-specific routine
        ↓
Create TreatmentRecommendation
        ↓
Review Treatment Plan and/or Prescription
        ↓
Digitally sign generated documents
```

The automatic Recommendation Engine is planned but is not currently on the runtime path. Products are not currently selected automatically from gender, stage, questionnaire results, stress, AI analysis, density, or thickness.

The Clinical Trichoscopy Report is separate from the treatment flow. It does not contain treatment recommendations, routines, or prescription lines.

## 2. CatalogItem: what the clinic may recommend

CatalogItems are stored in the `catalogitems` collection. They define the treatments that a clinic is allowed to select.

| Field | Purpose |
|---|---|
| `id` | CatalogItem identifier. |
| `name` | Display name, such as PRP Therapy or a supplement. |
| `description` | General catalog description. |
| `type` | `SERVICE`, `MEDICATION`, `COSMETIC`, or `SUPPLEMENT`. |
| `price` | Current catalog price. |
| `imageUrl` | Optional catalog image. |
| `externalLink` | Optional product or reference URL. |
| `status` | `ACTIVE`, `INACTIVE`, or `DELETED`. |
| `typeSpecificDetails` | Additional data for the selected catalog type. |
| `tags` | Future matching metadata such as `STRESS_SUPPORT`. |
| `eligibility` | Future matching and eligibility rules. |
| `defaultProtocolTemplateId` | Optional default protocol for this item. |
| `organizationId` / `clinicId` | Tenant and clinic isolation. |

Only active CatalogItems are offered for new recommendations. The backend also verifies that the item belongs to the current organization and clinic.

### CatalogItem type rules

- `SERVICE` is intended for clinical sessions such as PRP, microneedling, or scalp therapy. It commonly uses `SESSION_PLAN` and cannot use `TIMES_PER_DAY`.
- `MEDICATION` is intended for prescription or medication-style treatment. It requires a routine and cannot use `SESSION_PLAN`.
- `COSMETIC` is intended for products such as shampoos, serums, or lotions.
- `SUPPLEMENT` is intended for vitamins and nutritional supplements.

The CatalogItem type is the source of truth for the recommendation type. Staff cannot reclassify a medication as a cosmetic or service while editing a recommendation.

## 3. ProtocolTemplate: the reusable default

ProtocolTemplates are stored in `protocoltemplates` and belong to exactly one CatalogItem.

A CatalogItem can have multiple protocols, for example:

```text
PRP Therapy
├── Standard Protocol
├── Intensive Protocol
└── Maintenance Protocol
```

| Field | Purpose |
|---|---|
| `id` | Protocol identifier. |
| `catalogItemId` | CatalogItem that owns the protocol. |
| `name` | Protocol name. |
| `description` | Explanation of the protocol. |
| `routine` | Default structured treatment schedule. |
| `instructions` | Default recommendation-level instructions. |
| `expectedOutcome` | Optional expected outcome. |
| `isDefault` | Whether this is the default protocol. |
| `status` | `ACTIVE`, `INACTIVE`, or `DELETED`. |
| `organizationId` / `clinicId` | Tenant and clinic isolation. |

A ProtocolTemplate is not itself a patient-specific recommendation. It is copied as the starting point when staff add an item to a patient TreatmentPlan.

```text
CatalogItem
    ↓ select
ProtocolTemplate
    ↓ copy and customize
TreatmentRecommendation
```

If staff supplies a patient-specific routine, that routine takes precedence over the protocol routine. Otherwise, the selected protocol routine is copied. If no protocol is explicitly selected, the backend can use the CatalogItem default protocol when one exists.

## 4. TreatmentPlan: the patient/session container

TreatmentPlans are stored in `treatmentplans`. A plan belongs to one session and one patient.

| Field | Purpose |
|---|---|
| `id` | TreatmentPlan identifier. |
| `sessionId` | Session associated with the plan. |
| `patientId` | Patient associated with the plan. |
| `status` | Plan lifecycle status. |
| `contextSnapshot` | Snapshot of relevant session context. |
| `organizationId` / `clinicId` | Tenant and clinic isolation. |
| `createdBy` / `updatedBy` | Staff attribution. |

A TreatmentPlan may be created only for a session with status `SAVED` or `COMPLETED`. The plan is initially created as `DRAFT`.

The current context snapshot contains:

```text
sessionId
patientId
clinicId
sessionType
sessionStatus
rootCause
stressScore
clinicalNote
capturedAt
```

The treatment flow reads session data directly. It does not parse the generated Clinical Trichoscopy Report PDF.

### TreatmentPlan statuses

```text
DRAFT → REVIEWED → SIGNED → OUTDATED → new reviewed/signed version
```

- `DRAFT`: staff are creating or editing recommendations.
- `REVIEWED`: the relevant document versions have been generated and are ready for signature.
- `SIGNED`: the applicable document workflow has been signed.
- `OUTDATED`: source treatment data changed after document generation or signing.

## 5. TreatmentRecommendation: the actual treatment decision

TreatmentRecommendations are stored in `treatmentrecommendations`. They are the **single editable source of truth** for both the Treatment Plan and the Prescription projection.

| Field | Purpose |
|---|---|
| `id` | Recommendation identifier. |
| `treatmentPlanId` | Parent TreatmentPlan. |
| `catalogItemId` | CatalogItem selected by staff. |
| `protocolTemplateId` | Protocol used as the starting point. |
| `catalogItemType` | Copied CatalogItem type. |
| `catalogSnapshot` | Immutable catalog data at selection time. |
| `protocolSnapshot` | Immutable protocol data at selection time. |
| `routine` | Patient-specific structured routine. |
| `priority` | `PRIMARY`, `RECOMMENDED`, `OPTIONAL`, or `MAINTENANCE`. |
| `rationale` | Why the item was selected. |
| `instructions` | Patient-specific or recommendation-level instructions. |
| `sortOrder` | Display and PDF ordering. |
| `status` | `ACTIVE` or `REMOVED`. |

### Catalog and protocol snapshots

The `catalogSnapshot` preserves values such as:

```text
id
name
description
type
price
imageUrl
externalLink
typeSpecificDetails
tags
```

The `protocolSnapshot` preserves values such as:

```text
id
catalogItemId
name
description
routine
instructions
expectedOutcome
isDefault
```

Snapshots ensure that changing, deactivating, renaming, or deleting a CatalogItem or ProtocolTemplate does not rewrite an existing recommendation or signed document.

### Recommendation fields in practice

- `priority` communicates the clinical importance of the line.
- `rationale` explains the staff member's reason for choosing it.
- `instructions` contains patient-specific or recommendation-level usage instructions.
- `sortOrder` controls the order in the editor and generated documents.
- `status` uses soft removal so history and audit records are preserved.

The structured routine is the only routine-level representation. Patient-facing instructions remain in the top-level `TreatmentRecommendation.instructions` field and are not duplicated inside the routine.

## 6. Structured TreatmentRoutine

Routine data is stored by the API as structured JSON, but staff use the structured `HsRoutineEditor` rather than entering JSON manually.

The backend supports five discriminated routine types:

```typescript
INTERVAL | DAILY | SPECIFIC_DAYS | SESSION_PLAN | AS_NEEDED
```

All variants may use these common optional fields:

```text
duration: { value, unit }
routeOrArea
```

Valid duration and frequency units are:

```text
HOURS | DAY | WEEK | MONTH | YEAR
```

A schedule slot separates time-of-day from the relationship to food:

```typescript
interface ScheduleSlot {
  timeOfDay: 'MORNING' | 'MIDDAY' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'ANY_TIME'
  mealRelation: 'BEFORE' | 'WITH' | 'AFTER' | 'NONE'
  dosage: string
}
```

The meal relationship is deliberately unqualified: `BEFORE` means before a meal, `WITH` means with a meal, `AFTER` means after a meal, and `NONE` means the meal relationship does not matter.

### `INTERVAL`

Used when something happens at a repeating interval.

```json
{
  "type": "INTERVAL",
  "interval": 8,
  "unit": "HOURS",
  "dosage": "1 tablet",
  "duration": { "value": 3, "unit": "DAY" }
}
```

The fields are:

- `interval`: positive integer between uses.
- `unit`: hours, days, weeks, months, or years.
- `dosage`: required dosage or application instruction.
- `duration`: optional total treatment duration.
- `routeOrArea`: optional application route or body area.

### `DAILY`

Used for medication, supplement, or topical daily schedules. Each slot may carry a different dosage.

```json
{
  "type": "DAILY",
  "timesPerDay": 2,
  "slots": [
    { "timeOfDay": "MORNING", "mealRelation": "NONE", "dosage": "2 tablets" },
    { "timeOfDay": "NIGHT", "mealRelation": "NONE", "dosage": "1 tablet" }
  ],
  "duration": { "value": 3, "unit": "MONTH" },
  "routeOrArea": "Oral"
}
```

The fields are:

- `slots`: one or more structured schedule slots with required dosage.
- `timesPerDay`: required number of daily uses from 1 to 24; the number of schedule slots must exactly match this value.
- `duration`: optional total treatment duration.
- `routeOrArea`: optional route or application area.

### `SPECIFIC_DAYS`

Used when treatment is performed on selected weekdays.

```json
{
  "type": "SPECIFIC_DAYS",
  "timesPerDay": 1,
  "days": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "repeatCycle": { "interval": 1, "unit": "WEEK" },
  "slots": [
    { "timeOfDay": "EVENING", "mealRelation": "NONE", "dosage": "Apply thinly" }
  ],
  "duration": { "value": 3, "unit": "MONTH" },
  "routeOrArea": "Face & Neck"
}
```

The fields are:

- `timesPerDay`: required number of daily uses from 1 to 24; the number of schedule slots must exactly match this value.
- `days`: one or more weekdays.
- `repeatCycle`: optional repeating cycle.
- `slots`: exactly `timesPerDay` structured daily-use entries.
- `duration`: optional total treatment duration.
- `routeOrArea`: optional route or application area.

### `SESSION_PLAN`

Used for scheduled clinical sessions.

```json
{
  "type": "SESSION_PLAN",
  "frequency": { "interval": 1, "unit": "MONTH" },
  "totalSessions": 6,
  "duration": { "value": 6, "unit": "MONTH" },
  "routeOrArea": "Scalp"
}
```

The fields are:

- `frequency.interval`: number between sessions.
- `frequency.unit`: hours, days, weeks, months, or years.
- `totalSessions`: positive number of sessions.
- `duration`: optional overall duration.
- `routeOrArea`: optional treatment area.

This is commonly used for services such as PRP. A Medication cannot use this routine type.

### `AS_NEEDED`

Used when a treatment does not follow a fixed schedule.

```json
{
  "type": "AS_NEEDED",
  "reason": "Use when scalp irritation occurs.",
  "dosage": "Apply a thin layer",
  "maxPerDay": 3,
  "minimumWaitHours": 4,
  "routeOrArea": "Irritated scalp area"
}
```

The fields are:

- `reason`: required explanation for as-needed use.
- `dosage`: required dosage or application instruction.
- `maxPerDay`: optional maximum number of uses in one day.
- `minimumWaitHours`: optional minimum interval between uses.
- `duration`: optional duration.
- `routeOrArea`: optional route or application area.

### Routine validation

The frontend and backend validate the routine before it is saved. Validation includes:

- Canonical discriminated routine types only.
- Required variant-specific fields.
- Positive numeric values.
- Valid time-of-day, meal, duration, and frequency values.
- Required dosage on interval, daily, specific-day, and as-needed schedules.
- Valid meal relationships for every schedule slot.
- At least one schedule slot for `DAILY` and `SPECIFIC_DAYS`.
- Required reason and dosage for `AS_NEEDED`.
- Required `timesPerDay` between 1 and 24 for `DAILY`, with exactly that many schedule slots.
- Catalog-specific restrictions.

The API stores the routine as structured data. GraphQL exposes it as `routineJson`, and the frontend serializes/deserializes it at the API boundary.

## 7. Treatment Plan frontend sections

The Treatment Plan page contains three main tabs and a signature workflow.

### Recommendations tab

This is the manual creation area. Staff use:

1. **CatalogItem selector** — selects an active clinic CatalogItem.
2. **Protocol selector** — selects an active protocol belonging to that CatalogItem.
3. **Priority selector** — sets the clinical importance.
4. **Routine editor** — customizes the copied protocol routine.
5. **Rationale** — records why the item was selected.
6. **Instructions** — records patient-specific recommendation instructions.
7. **Add** — creates the TreatmentRecommendation.

When the CatalogItem changes, the current protocol, routine, and instructions are cleared so values from one item cannot be accidentally reused for another.

### Treatment Plan tab

This tab displays active non-medication recommendations:

```text
SERVICE
COSMETIC
SUPPLEMENT
```

Staff can:

- Edit the routine.
- Edit priority.
- Edit rationale.
- Edit instructions.
- Save changes.
- Move a line up or down.
- Remove a line.

The routine editor hydrates from the recommendation's existing `routineJson`.

### Prescription tab

This tab displays active medication recommendations only:

```text
MEDICATION
```

There is no separate editable prescription-line collection. The Prescription is generated from the medication recommendations in the TreatmentPlan.

```text
TreatmentRecommendation = source of truth
Prescription = generated medication projection
```

### Signature workflow

The page also displays the document status for:

- Treatment Plan document.
- Prescription document.

Staff can prepare documents for signature, open the typed-signature dialog, and sign each applicable document.

## 8. Recommendation API flow

### Create TreatmentPlan

The GraphQL mutation is:

```text
createTreatmentPlan(sessionId)
```

The backend:

1. Loads the session.
2. Verifies that it is `SAVED` or `COMPLETED`.
3. Reuses the existing plan if one already exists for the session.
4. Copies session context into `contextSnapshot`.
5. Creates a `DRAFT` TreatmentPlan.
6. Writes audit and outbox records transactionally.

### Add TreatmentRecommendation

The GraphQL mutation is:

```text
addTreatmentRecommendation
```

The input fields are:

```text
treatmentPlanId
catalogItemId
protocolTemplateId?
routineJson?
priority?
rationale?
instructions?
sortOrder?
```

The backend:

1. Loads the TreatmentPlan.
2. Rejects changes to a fully signed plan unless reopened through the document workflow.
3. Loads the active CatalogItem for the current clinic.
4. Resolves the selected protocol or the CatalogItem default protocol.
5. Verifies that the protocol belongs to the selected CatalogItem.
6. Uses the explicit routine override when supplied.
7. Otherwise uses the protocol routine.
8. Validates the routine against the CatalogItem type.
9. Requires a routine for `MEDICATION`.
10. Creates catalog and protocol snapshots.
11. Creates the active recommendation.
12. Marks current documents outdated when applicable.
13. Writes audit and outbox records in the same transaction.

Routine precedence is:

```text
Explicit patient-specific routine
        ↓ if absent
Selected ProtocolTemplate routine
        ↓ if absent
CatalogItem default protocol routine
        ↓ if absent
No routine
```

### Update TreatmentRecommendation

The GraphQL mutation is:

```text
updateTreatmentRecommendation
```

It can update:

```text
routineJson
priority
rationale
instructions
```

It cannot change the CatalogItem type or source snapshots. The backend validates a supplied routine, updates the recommendation transactionally, invalidates current documents, and records audit/outbox events.

### Reorder TreatmentRecommendations

The GraphQL mutation is:

```text
reorderTreatmentRecommendations
```

The frontend sends the complete ordered list of active recommendation IDs. The backend validates that every active recommendation is included exactly once and updates `sortOrder` values transactionally.

### Remove TreatmentRecommendation

The GraphQL mutation is:

```text
removeTreatmentRecommendation(id)
```

Removal is soft deletion:

```text
status = REMOVED
```

The historical record remains available for audit and document history, but it is excluded from current active projections.

## 9. Treatment Plan and Prescription documents

The Clinical Document service creates separate content snapshots.

### Treatment Plan document

Contains active:

```text
SERVICE
COSMETIC
SUPPLEMENT
```

It excludes medication lines.

### Prescription document

Contains active:

```text
MEDICATION
```

It excludes service, cosmetic, and supplement lines.

Each document snapshot contains:

```text
treatmentPlanId
patientId
documentType
contextSnapshot
recommendations
generatedAt
```

Each projected recommendation retains:

```text
catalogSnapshot
protocolSnapshot
routine
priority
rationale
instructions
sortOrder
```

The PDF is therefore generated from the historical treatment decision rather than from future live CatalogItem values.

## 10. Review, signing, and invalidation

The document lifecycle is:

```text
DRAFT → REVIEWED → SIGNED → OUTDATED → new version
```

### Review

The review mutation generates the applicable Treatment Plan and/or Prescription PDF, uploads a versioned PDF, stores the content snapshot, and marks the document `REVIEWED`.

A Treatment Plan document is generated when there are active non-medication recommendations. A Prescription document is generated when there are active medication recommendations.

### Signing

Only a `REVIEWED` document can be signed. The current implementation supports a typed signature.

The signature snapshot records information such as:

```text
signature type
staff ID
signature text
signed timestamp
staff signature record ID
```

The signed PDF is generated at a separate immutable signed path. The document becomes `SIGNED`.

### Invalidation

Recommendation creation, edits, reorder operations, and removal mark current documents as `OUTDATED`. Other report-affecting session changes can also invalidate related report documents according to their services.

The old signed version remains available. A later review creates a new version rather than overwriting the historical PDF.

## 11. Permissions and tenant isolation

Treatment Plan permissions are:

| Operation | Permission |
|---|---|
| Query TreatmentPlan | `patients:view` |
| Create TreatmentPlan | `patients:edit` |
| Add recommendation | `patients:edit` |
| Update recommendation | `patients:edit` |
| Reorder recommendations | `patients:edit` |
| Remove recommendation | `patients:edit` |

CatalogItem and ProtocolTemplate creation/management use catalog permissions.

CatalogItems, protocols, TreatmentPlans, recommendations, documents, and signatures are scoped by organization and clinic. Cross-clinic or cross-organization records must not be selectable or readable.

## 12. Planned Recommendation Engine

The Recommendation Engine is planned but not currently implemented as an automatic selection service.

The approved future engine inputs are exactly:

1. Patient gender.
2. Hair-loss stage or scale.
3. Questionnaire/root-cause result.
4. Stress-test or StressOMeter score.

The future engine should:

1. Normalize those four inputs.
2. Apply ordered, explainable rules.
3. Match only active CatalogItems and active ProtocolTemplates in the current clinic.
4. Return structured proposals rather than inventing products or routines.
5. Include CatalogItem ID, ProtocolTemplate ID, priority, rationale, and `source: RULE`.
6. Allow staff to accept, reject, reorder, and edit proposals through the existing Treatment Plan editor.

The initial engine must not use:

```text
AI-generated free-form recommendations
AI-generated free-form routines
Hair density as an engine input
Hair thickness as an engine input
Products outside the active clinic catalog
Invented dosages or protocols
```

The current manual workflow is intentionally implemented before the engine so catalog validation, snapshots, document projections, signatures, and audit behavior can be verified independently.

## 13. Current source files

### Requirements and design

- `.kiro/specs/recomendation-and-treatment-plan/plan.md`
- `.kiro/specs/hairscope-clinic-platform/implementations/20-recommendations-treatment-plan-checklist.md`

### Backend

- `packages/api/src/modules/catalog/entities/catalog-item.schema.ts`
- `packages/api/src/modules/catalog/entities/protocol-template.schema.ts`
- `packages/api/src/modules/catalog/validation/treatment-routine.validation.ts`
- `packages/api/src/modules/treatment-plans/entities/treatment-plan.schema.ts`
- `packages/api/src/modules/treatment-plans/entities/treatment-recommendation.schema.ts`
- `packages/api/src/modules/treatment-plans/services/treatment-plan.service.ts`
- `packages/api/src/modules/treatment-plans/services/clinical-document.service.ts`
- `packages/api/src/modules/treatment-plans/resolvers/treatment-plan.resolver.ts`

### Clinic web

- `src/components/modules/treatment/TreatmentPlanEditor.tsx`
- `src/components/shared/HsRoutineEditor.tsx`
- `src/services/treatment-plan.service.ts`
- `src/app/(dashboard)/catalog/[id]/page.tsx`
