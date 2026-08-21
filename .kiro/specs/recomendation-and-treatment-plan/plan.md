# Recommendation and Treatment Plan Implementation Plan

> **Authoritative implementation guidance.** Use this document when implementation details are unclear. The Clinical Trichoscopy Report, Treatment Plan, and Prescription are separate concerns. The first release uses manual staff selection plus a minimal deterministic Recommendation Engine. AI recommendations are explicitly deferred.

## 1. Core principles

1. **Catalog defines what is allowed.** Only active catalog items and their active protocol templates may be recommended.
2. **Protocols define default usage.** A protocol is copied as the starting point; staff may customize the patient-specific routine.
3. **Treatment Plan stores the clinical decision.** All selected lines, including medications, belong to the Treatment Plan's recommendation source of truth.
4. **Prescription is a document projection.** It is generated from medication recommendations and is never a second manually maintained recommendation list.
5. **Manual-first workflow.** Staff must be able to create, edit, reorder, and remove recommendations manually before the Recommendation Engine is introduced.
6. **Minimal deterministic engine only.** The initial engine uses gender, hair-loss stage/scale, questionnaire/root-cause result, and StressOMeter score. It does not use AI or invent products.

## 2. Document boundaries

A completed session exposes two separate document flows:

```text
Completed Session
├── Clinical Trichoscopy Report
│   ├── Analysis
│   ├── Images
│   ├── Questionnaire
│   └── Clinical note
│
└── Treatment Plan
    ├── Recommendations
    │   ├── Services
    │   ├── Cosmetics
    │   └── Supplements
    └── Prescription (generated projection)
        └── Medications
```

The Clinical Trichoscopy Report SHALL NOT contain treatment recommendations, routines, or prescriptions. The report page may show **Create Treatment Plan** after the session/report is ready. The treatment flow reads session and catalog data directly; it never parses the generated report PDF.

## 3. One recommendation source of truth

The Treatment Plan owns all selected treatment lines:

```text
TreatmentPlan
└── TreatmentRecommendations
    ├── SERVICE
    ├── COSMETIC
    ├── SUPPLEMENT
    └── MEDICATION
```

Rendering is filtered by catalog type:

- **Treatment Plan PDF:** `SERVICE`, `COSMETIC`, and `SUPPLEMENT` lines.
- **Prescription PDF:** `MEDICATION` lines only, projected from the same TreatmentRecommendations.

A medication remains part of the Treatment Plan data even though it is rendered in the Prescription document. Staff edits the TreatmentRecommendation; they never edit a separate Prescription line.

## 4. CatalogItem model

The existing `Product` model SHALL evolve into a clinic-scoped `CatalogItem`.

```text
CatalogItem
├── name
├── description
├── type: SERVICE | MEDICATION | COSMETIC | SUPPLEMENT
├── price
├── image
├── status: ACTIVE | INACTIVE | DELETED
├── typeSpecificDetails
├── defaultProtocolTemplateId
└── protocolTemplates[]
```

The current `MEDICINE` value is migrated to `MEDICATION`. A temporary read/write migration alias may be retained, but all new domain, GraphQL, and persistence contracts use `MEDICATION`.

Every CatalogItem read, update, deactivate, and delete SHALL filter by both `organizationId` and `clinicId`. Inactive/deleted items are unavailable for new recommendations but remain available through historical snapshots.

### 4.1 Type-specific details

- **SERVICE:** `durationMinutes`, `qualifiedStaff`, `preparationInstructions`, `aftercareInstructions`
- **MEDICATION:** `genericName`, `brandName`, `strength`, `dosageForm`, `route`
- **COSMETIC:** `cosmeticType`, `applicationArea`, `usageInstructions`
- **SUPPLEMENT:** `ingredients`, `dosageForm`, `servingSize`

Catalog tags and eligibility metadata are catalog-side constraints for the later minimal rules, not additional patient inputs. Examples include `STRESS_SUPPORT`, `FOLLICLE_SUPPORT`, `SCALP_CARE`, `DENSITY_SUPPORT`, and `MAINTENANCE`.

## 5. First-class ProtocolTemplate

A single `defaultRoutine` is insufficient when a catalog item offers Standard, Intensive, or Maintenance approaches. Protocol templates belong to the catalog item and are selected before creating the patient-specific recommendation.

```text
CatalogItem: PRP Therapy
├── Standard Protocol
├── Intensive Protocol
└── Maintenance Protocol
```

```text
ProtocolTemplate
├── id
├── catalogItemId
├── name
├── description
├── routine
├── instructions
├── expectedOutcome
├── isDefault
└── status
```

A catalog item may have one simple default protocol. Multiple templates are used when the clinic offers multiple predefined approaches for the same item. Protocol templates are clinic-scoped and may reference only their owning CatalogItem.

Example:

```json
{
  "name": "Standard PRP Protocol",
  "routine": {
    "type": "SESSION_PLAN",
    "frequency": { "interval": 1, "unit": "MONTH" },
    "totalSessions": 6,
    "duration": { "value": 6, "unit": "MONTH" }
  },
  "instructions": "Schedule each session approximately 30 days apart."
}
```

## 6. Discriminated TreatmentRoutine

Routine data SHALL use a discriminated structure rather than one flat object with optional fields. This prevents invalid combinations such as `timesPerDay` on a service.

```typescript
type TreatmentRoutine =
  | IntervalRoutine
  | TimesPerDayRoutine
  | SpecificDaysRoutine
  | SessionPlanRoutine
  | AsNeededRoutine;
```

Supported variants include:

```json
{
  "type": "INTERVAL",
  "interval": 2,
  "unit": "WEEK",
  "duration": { "value": 6, "unit": "MONTH" },
  "instructions": null
}
```

```json
{
  "type": "TIMES_PER_DAY",
  "timesPerDay": 2,
  "timings": ["AFTER_LUNCH", "AFTER_DINNER"],
  "duration": { "value": 3, "unit": "MONTH" },
  "quantity": "1 tablet"
}
```

```json
{
  "type": "SESSION_PLAN",
  "frequency": { "interval": 1, "unit": "MONTH" },
  "totalSessions": 6,
  "duration": { "value": 6, "unit": "MONTH" }
}
```

The API and persistence layer SHALL validate variant-specific fields. For example, medication routines require a valid dosage/schedule, while service routines may use `SESSION_PLAN` and must not use medication timing fields.

## 7. Patient-specific TreatmentRecommendation

Selection follows this flow:

```text
CatalogItem
    ↓ copy selected protocol
ProtocolTemplate
    ↓ copy and customize
TreatmentRecommendation
```

Each recommendation stores immutable source snapshots and editable patient-specific values:

```text
TreatmentRecommendation
├── treatmentPlanId
├── catalogItemId
├── protocolTemplateId
├── catalogSnapshot
├── protocolSnapshot
├── routine
├── priority
├── rationale
├── instructions
├── sortOrder
└── status
```

The catalog item determines the line type. Staff may not reclassify a medication as a cosmetic or service. Supported priorities are:

- `PRIMARY`
- `RECOMMENDED`
- `OPTIONAL`
- `MAINTENANCE`

Example:

```json
{
  "catalogItemId": "prp-001",
  "protocolTemplateId": "prp-standard",
  "catalogSnapshot": {
    "name": "PRP Therapy",
    "type": "SERVICE",
    "price": 250
  },
  "routine": {
    "type": "SESSION_PLAN",
    "frequency": { "interval": 1, "unit": "MONTH" },
    "totalSessions": 6,
    "duration": { "value": 6, "unit": "MONTH" }
  },
  "priority": "PRIMARY",
  "rationale": "Recommended to support follicular stimulation."
}
```

Catalog/protocol changes or deletion SHALL NOT change an existing recommendation or signed document. Historical documents use the stored snapshots.

## 8. Persistence and document lifecycle

The initial persistence model consists of:

- `catalogitems` — evolved from the current `products` collection.
- `protocoltemplates` — reusable clinic-scoped protocol definitions.
- `treatmentplans` — session-level patient-specific treatment decision and snapshots.
- `treatmentrecommendations` — editable treatment-plan lines and immutable source snapshots.
- `clinicaldocumentversions` — generated Treatment Plan and Prescription versions, status, PDF path, signer, and supersession metadata.
- `staffsignatures` — the active signature state for each staff member.

The Prescription has document-version metadata, but no independent editable medication-line collection. It is a generated projection of `TreatmentRecommendation` records where `type = MEDICATION`.

Treatment Plan context snapshots SHALL include at least:

- `sessionId`, `patientId`, and `clinicId`
- analysis summary snapshot
- clinical note snapshot
- creator and timestamps
- recommendation/engine provenance where applicable

The canonical document lifecycle is:

```text
DRAFT
  ↓ review/approval
REVIEWED
  ↓ signature and generation
SIGNED
  ↓ recommendation or source-context edit
OUTDATED
  ↓ new review, signature, and PDF
NEW SIGNED VERSION
```

`READY` may be used as a UI label for a reviewed plan, but it is not a separate persisted lifecycle state unless explicitly approved later.

After signing, removing or changing a recommendation requires a reason. The old line remains in immutable history, the new version contains the changed recommendation, the previous PDF remains available as superseded, and a new signature is required for both Treatment Plan and Prescription where applicable.

## 9. Minimal deterministic Recommendation Engine

The engine is separate from the Treatment Plan editor:

```text
RecommendationEngine
    ↓ structured proposals
Validation against active clinic catalog/protocols
    ↓
Staff review, accept, reject, reorder, and edit
    ↓
TreatmentPlan / TreatmentRecommendations
```

### 9.1 Initial input contract

The first engine version uses only:

1. Patient gender
2. Hair-loss stage/scale
3. Questionnaire/root-cause result
4. Stress-test/StressOMeter score

Hair density, thickness, AI ranking, and free-form AI generation are deferred. Catalog tags, active status, protocol availability, and eligibility rules are catalog-side validation/matching data, not extra patient-analysis inputs.

The StressOMeter threshold SHALL be configured at organization or clinic level. When the threshold is reached, the engine may propose active catalog items tagged `STRESS_SUPPORT`.

### 9.2 Proposal contract

The engine returns structured proposals only:

```json
{
  "catalogItemId": "prp-001",
  "protocolTemplateId": "prp-standard",
  "priority": "PRIMARY",
  "rationale": "Matches the selected treatment strategy.",
  "source": "RULE"
}
```

The engine SHALL:

- select only active CatalogItems and ProtocolTemplates from the current clinic;
- return deterministic ordering and explainable rationale;
- return a typed no-match result when no configured item qualifies;
- never create or invent a product, protocol, dosage, or treatment line;
- leave final acceptance and editing with Staff.

AI may be considered later only as a ranking or selection layer over validated catalog and protocol IDs. It must never generate free-form products or protocols outside the catalog.

## 10. Implementation order

### Phase 1 — Catalog foundation

- Introduce CatalogItem vocabulary and migrate `MEDICINE` to `MEDICATION`.
- Add `ACTIVE`, `INACTIVE`, and `DELETED` lifecycle handling.
- Add type-specific details and organization/clinic isolation to every catalog operation.
- Add first-class ProtocolTemplate persistence and selection.
- Add discriminated TreatmentRoutine validation.
- Add catalog tags/eligibility metadata needed by the later minimal rules.

### Phase 2 — Manual Treatment Plan editor

- Add TreatmentPlan and TreatmentRecommendation persistence.
- Add copy-on-selection from CatalogItem → ProtocolTemplate → TreatmentRecommendation.
- Add catalog/protocol snapshots.
- Add patient-specific routine editing.
- Add priority, rationale, instructions, status, and ordering.
- Add GraphQL queries and mutations.
- Allow manual catalog and protocol selection before engine-generated proposals.

### Phase 3 — Documents and signatures

- Add ClinicalDocumentVersion persistence for Treatment Plan and Prescription.
- Treat Prescription as a medication-only projection of TreatmentRecommendations.
- Add staff signature management and required staff identity/license snapshots.
- Add Typst templates using immutable snapshots.
- Add review, signing, signature validation, audit, and outbox events.
- Add superseded-version handling and signed-only sharing.
- Require a reason and re-signing after post-signing changes.

### Phase 4 — Minimal deterministic Recommendation Engine

- Normalize the four approved inputs.
- Add deterministic rules for gender, stage/scale, questionnaire/root cause, and stress score.
- Match only active clinic CatalogItems and ProtocolTemplates.
- Generate structured draft proposals with rationale and priority.
- Let Staff accept, reject, reorder, and edit proposals in the existing Treatment Plan editor.
- Add no-match and incomplete-input behavior.

### Phase 5 — Frontend and release integration

- Add **Create Treatment Plan** to the report/session flow.
- Build Recommendations, Treatment Plan, and Prescription sections.
- Add catalog/protocol picker and routine editor.
- Add review, sign, regenerate, version history, download, and sharing actions.
- Verify that report generation remains independent and recommendation-free.
- Validate tenant isolation, permissions, snapshots, signatures, projections, PDF output, and audit history.

## 11. Explicit non-goals for the initial release

- No AI-generated recommendations.
- No AI-generated free-form treatment protocols.
- No hair-density or thickness input to the initial engine.
- No independent manually maintained Prescription recommendation list.
- No recommendations embedded in the Clinical Trichoscopy Report.

The manual-first foundation is intentional: it validates catalog rules, protocol templates, routines, snapshots, signatures, projections, and PDF generation before any AI ranking is considered.
