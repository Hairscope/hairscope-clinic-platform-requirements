# Recommendations & Treatment Plan Implementation Checklist

> **Authority:** Follow `.kiro/specs/recomendation-and-treatment-plan/plan.md` when implementation details are unclear. This checklist tracks the manual-first Treatment Plan flow, the minimal deterministic engine, and the signed document projections.

## Status and operating rules

- `[x]` complete, `[~]` partial/current, `[ ]` pending, `[!]` blocked decision.
- Every task has an owner, dependencies, source anchor, and validation gate.
- The Clinical Trichoscopy Report remains separate and must never contain treatment recommendations.
- Staff must be able to build a Treatment Plan manually before engine-generated proposals are introduced.
- The initial engine uses only gender, hair-loss stage/scale, questionnaire/root cause, and StressOMeter score. AI, density, and thickness inputs are deferred.
- `TreatmentRecommendation` is the sole source of truth. Prescription is a medication-only document projection, not a second editable recommendation list.

## Baseline

| Area | Status | Notes |
|---|---:|---|
| Clinical report and report viewer | `[x]` | Existing report flow and report-page action seam are available. |
| Questionnaire root-cause completeness gate | `[x]` | Hair Loss Factors require complete valid root-cause answers. |
| Existing Product CRUD | `[~]` | Must evolve into isolated CatalogItem behavior. |
| Manual Treatment Plan | `[ ]` | No TreatmentPlan/TreatmentRecommendation domain exists. |
| Signed Treatment Plan/Prescription | `[ ]` | No document-version or signature lifecycle exists. |
| Minimal Recommendation Engine | `[ ]` | No deterministic proposal service exists. |

# RE-0. Contract freeze

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[x] RE-0.1` | Keep Clinical Report free of recommendations, routines, and prescriptions; treatment flow reads source data, never the PDF. | Product + Sessions | — | Plan §§1–2; SES-3 | Report contract contains no treatment fields. |
| `[x] RE-0.2` | Freeze initial engine inputs to gender, stage/scale, questionnaire/root cause, and stress score. | Product + Recommendation | — | Plan §9 | Engine DTO rejects unapproved patient inputs. |
| `[x] RE-0.3` | Defer AI recommendations, density/thickness inputs, and free-form protocol generation. | Product + Recommendation | — | Plan §11 | No AI service is on the initial critical path. |
| `[x] RE-0.4` | Require a digital signature on both Treatment Plan and Prescription. | Product + Documents | — | Plan §8; CAT-7/8 | Missing signature returns `SIGNATURE_REQUIRED`. |
| `[x] RE-0.5` | Make Prescription an immutable-version projection of medication TreatmentRecommendations, never a separate editable line store. | Documents + Sessions | — | Plan §§3, 8 | Editing a recommendation regenerates the medication projection. |
| `[x] RE-0.6` | Make manual catalog/protocol selection work independently of the Recommendation Engine. | Product + Sessions | — | Plan §10 Phase 2 | Manual plan can be created with the engine disabled. |
| `[!] RE-0.7` | Resolve automatic versus manual Clinical Report generation without coupling it to Treatment Plan creation. | Product + Sessions + PDF | — | SES-3; PDF implementation §3 | One report trigger is documented; treatment flow remains independent. |
| `[!] RE-0.8` | Confirm how multiple global-image stages become the single stage/scale engine input. | Product + AI + Recommendation | — | SES-HA-1 | Aggregation and missing-stage behavior are specified. |
| `[!] RE-0.9` | Approve `Product`/`MEDICINE` migration to `CatalogItem`/`MEDICATION` and normalize clinical-note naming. | Architecture + Catalog + Sessions | — | Plan §4; CAT-1 | Migration and GraphQL contracts are documented. |

# RE-1. Catalog, protocol, and routine foundation

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-1.1` | Evolve Product into clinic-scoped CatalogItem with `SERVICE`, `MEDICATION`, `COSMETIC`, and `SUPPLEMENT`. | Catalog | RE-0.9 | Plan §4; CAT-1 | All reads, updates, deactivations, and deletes filter both organization and clinic. |
| `[ ] RE-1.2` | Add `ACTIVE`, `INACTIVE`, and `DELETED` lifecycle behavior; retain historical references through snapshots. | Catalog | RE-1.1 | Plan §4; CAT-4 | Inactive/deleted items cannot be newly recommended. |
| `[ ] RE-1.3` | Add structured type-specific details and retain `MEDICINE` only as a temporary migration alias. | Catalog | RE-1.1 | Plan §4.1 | Type-specific validation and migration tests pass. |
| `[ ] RE-1.4` | Create first-class clinic-scoped ProtocolTemplate persistence, including default selection and protocol status. | Catalog | RE-1.1 | Plan §5; CAT-2 | A CatalogItem may expose and select valid Standard/Intensive/Maintenance protocols. |
| `[ ] RE-1.5` | Implement discriminated TreatmentRoutine variants and variant-specific validation. | Catalog | RE-1.4 | Plan §6; CAT-2 | Invalid combinations such as medication timing on SERVICE are rejected. |
| `[ ] RE-1.6` | Add catalog tags and eligibility metadata for deterministic matching, including stress-support tags. | Catalog + Recommendation | RE-1.1 | Plan §§4.1, 9 | Tags are clinic-scoped and cannot bypass active/status checks. |
| `[ ] RE-1.7` | Add staff signature storage, upload/delete validation, and license/specialization fields needed by signed documents. | IAM + Upload | RE-0.4 | Plan §§4, 8; CAT-8 | PNG/JPEG ≤2MB, one active signature, audit entries. |

# RE-2. Manual Treatment Plan and recommendation persistence

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-2.1` | Create `treatmentplans` with session/patient/clinic ownership, DRAFT state, analysis-summary snapshot, clinical-note snapshot, creator, timestamps, and provenance. | Sessions | RE-1 | Plan §8; collection schemas | Plan can be created from source session data without reading a PDF. |
| `[ ] RE-2.2` | Create `treatmentrecommendations` as the sole editable line source, with catalog/protocol IDs, immutable snapshots, routine, priority, rationale, instructions, order, and status. | Sessions | RE-1 | Plan §7; SES-2 | Catalog changes cannot alter an existing recommendation. |
| `[ ] RE-2.3` | Implement copy-on-selection: CatalogItem → selected ProtocolTemplate → patient-specific TreatmentRecommendation. | Sessions + Catalog | RE-1, RE-2.1 | Plan §§5, 7 | Default values are deep-copied and safely overridden. |
| `[ ] RE-2.4` | Add manual queries/mutations to add, remove, reorder, edit routines, edit instructions, and set rationale/priority. | Sessions + GraphQL | RE-2.2 | Plan §10 Phase 2; frontend sessions tasks | Staff can complete a plan with the engine disabled. |
| `[ ] RE-2.5` | Enforce catalog-derived type; staff cannot reclassify MEDICATION as COSMETIC/SERVICE or bypass routine validation. | Sessions + Catalog | RE-1.5, RE-2.3 | Plan §§6–7 | Invalid type/routine mutations fail atomically. |
| `[ ] RE-2.6` | Expand Treatment Kits into recommendation lines while preserving kit and item snapshots and preventing duplicate medication projections. | Sessions + Catalog | RE-2.2 | CAT-5; Plan §3 | Kit medications appear once in the Prescription projection. |
| `[ ] RE-2.7` | Invalidate signed/current documents after recommendation, routine, questionnaire, or clinical-note changes; preserve audit history. | Sessions + Documents | RE-2.4 | SES-2; Plan §8 | Previous signed versions remain readable and current status becomes OUTDATED. |

# RE-3. Document versions, signatures, and projections

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-3.1` | Create `clinicaldocumentversions` for Treatment Plan and Prescription PDFs, including document type, version, status, PDF path, signer, signature snapshot, and supersession metadata. | Documents + PDF | RE-2 | Plan §8 | Historical versions remain addressable and immutable. |
| `[ ] RE-3.2` | Persist the canonical lifecycle `DRAFT → REVIEWED → SIGNED → OUTDATED → new signed version`; do not create a separate persisted READY state. | Documents | RE-3.1 | Plan §8 | Invalid lifecycle transitions are rejected. |
| `[ ] RE-3.3` | Generate Prescription data only by filtering `TreatmentRecommendation.type = MEDICATION`; do not create a second editable prescription-line store. | Documents + PDF | RE-2.2, RE-3.1 | Plan §§3, 8 | Medication edits update the next Prescription projection. |
| `[ ] RE-3.4` | Require explicit review/approval and a valid staff signature before generating or signing either document. | Documents + IAM | RE-1.7, RE-3.2 | CAT-7/8 | Both documents fail without a signature. |
| `[ ] RE-3.5` | Snapshot staff identity, specialization/license, signature image, clinic, patient, session context, catalog, protocol, routine, and edit history used by each PDF. | Documents + PDF | RE-2.2, RE-3.1 | Plan §§7–8; PDF §3 | Changing source profiles/catalog data cannot alter historical PDFs. |
| `[ ] RE-3.6` | Implement post-signing reason, strike-through history, replacement lines, re-review, re-signing, and superseded-version handling. | Documents + Sessions | RE-3.2–RE-3.5 | CAT-7; Plan §8 | Old and new versions contain the required audit trail. |
| `[ ] RE-3.7` | Implement separate Typst Treatment Plan and Prescription templates; Treatment Plan excludes medications and Prescription excludes non-medications. | PDF | RE-3.3, RE-3.5 | Plan §3; PDF §3.2–3.3 | Focused fixtures compile with correct type filtering. |
| `[ ] RE-3.8` | Emit audit/outbox events for approval, signing, regeneration, invalidation, sharing, and supersession. | Documents + Infrastructure | RE-3.1–RE-3.6 | CAT-7; event definitions | Every lifecycle transition is tenant-scoped and auditable. |

# RE-4. Minimal deterministic Recommendation Engine

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-4.1` | Normalize exactly the four approved inputs: gender, stage/scale, questionnaire/root cause, and StressOMeter score. | Recommendation | RE-1, RE-2 | Plan §9.1 | Equivalent inputs produce identical normalized values. |
| `[ ] RE-4.2` | Define ordered, explainable rules and matching configuration for the four inputs, catalog tags, and protocol eligibility. | Recommendation + Clinical | RE-1.6, RE-4.1 | Plan §9; organization stress threshold | Rule precedence and no-match behavior are documented. |
| `[ ] RE-4.3` | Match only active CatalogItems and active ProtocolTemplates in the current clinic, with deterministic ordering. | Recommendation + Catalog | RE-1, RE-4.2 | Plan §9.2; CAT-1/6 | No cross-clinic, inactive, or invented item is returned. |
| `[ ] RE-4.4` | Return structured proposals with catalog ID, protocol ID, priority, rationale, and `source: RULE`. | Recommendation | RE-4.2, RE-4.3 | Plan §9.2 | Proposal contract contains references, not free-form products. |
| `[ ] RE-4.5` | Let Staff accept, reject, reorder, and edit engine proposals through the manual Treatment Plan editor. | Sessions + Recommendation | RE-2.4, RE-4.4 | Plan §9; Phase 4 | Engine never bypasses staff review. |
| `[ ] RE-4.6` | Add typed no-match, incomplete-input, stress-threshold, gender, stage, and root-cause outcomes. | Recommendation | RE-4.1–RE-4.4 | Plan §9.2 | No partial recommendations are persisted on failure. |
| `[ ] RE-4.7` | Add deterministic unit/property tests; do not add AI tests or AI infrastructure to this release. | QA + Recommendation | RE-4.1–RE-4.6 | Plan §11 | Tests pass with synthetic non-patient fixtures. |

# RE-5. Frontend treatment flow

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-5.1` | Add a Create Treatment Plan icon action to the report/session subheader and navigate to the treatment route. | Clinic Web | RE-2.1 | Plan §2; existing report `HsSubHeader` seam | Patient/session context and permissions are preserved. |
| `[ ] RE-5.2` | Build Treatment Plan page with Recommendations, Treatment Plan, and Prescription views. | Clinic Web | RE-2.4, RE-3.3 | Plan §§2–3 | Empty, loading, forbidden, and no-match states are explicit. |
| `[ ] RE-5.3` | Add active CatalogItem/ProtocolTemplate picker with manual selection first. | Clinic Web + Catalog | RE-1.1, RE-1.4, RE-2.4 | Plan Phase 2 | Inactive/cross-clinic items cannot be selected. |
| `[ ] RE-5.4` | Add discriminated routine editor and patient-specific override UI. | Clinic Web | RE-1.5, RE-2.3 | Plan §6 | Service and product variants show only valid fields. |
| `[ ] RE-5.5` | Add engine proposal review with accept, reject, reorder, and edit controls. | Clinic Web + Recommendation | RE-4.4, RE-5.2 | Plan §9; Phase 4 | Accepted proposals become ordinary editable recommendations. |
| `[ ] RE-5.6` | Add review, sign, regenerate, view/download, share, and signed-version history actions for both documents. | Clinic Web | RE-3, RE-5.2 | CAT-7/8; Plan §8 | Unsigned documents cannot be shared. |
| `[ ] RE-5.7` | Add signature status/upload UI, staff license display, translations, and permission-aware controls. | Clinic Web + IAM | RE-1.7 | CAT-8 | Frontend validation matches backend validation. |

# RE-6. Integration, isolation, and lifecycle validation

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-6.1` | Keep Treatment Plan creation independent of Clinical Report generation and ensure no report recommendation leakage. | Sessions + PDF | RE-0.1, RE-3.7 | Plan §2; SES-3 | Report fixtures remain recommendation-free. |
| `[ ] RE-6.2` | Apply organization/clinic isolation to catalog, protocols, plans, recommendations, documents, and signatures. | Backend + IAM | RE-1–RE-3 | Plan §§4, 5, 8 | Cross-tenant and cross-clinic access tests fail safely. |
| `[ ] RE-6.3` | Make recommendation edits, invalidation, audit, and outbox writes transactional and idempotent. | Sessions + Infrastructure | RE-2.7, RE-3.8 | Database/event implementations | Rollback leaves no partial recommendation or lifecycle event. |
| `[ ] RE-6.4` | Preserve snapshots when CatalogItems or ProtocolTemplates are renamed, deactivated, or deleted. | Catalog + Documents | RE-2.2, RE-3.5 | Plan §§4, 7–8 | Historical plans/PDFs are unchanged. |

# RE-7. Release validation

| Status / ID | Task | Owner | Depends on | Anchor | Gate |
|---|---|---|---|---|---|
| `[ ] RE-7.1` | Test CatalogItem migration, type-specific validation, lifecycle, protocol ownership, routine variants, and clinic isolation. | QA + Catalog | RE-1, RE-6.2 | Plan §§4–6 | All catalog invariants pass. |
| `[ ] RE-7.2` | Test manual plan creation, snapshot immutability, routine overrides, kit expansion, type filtering, and prescription projection. | QA + Sessions | RE-2, RE-3 | Plan §§3, 7–8 | One source of truth is proven by projection tests. |
| `[ ] RE-7.3` | Test review/signature requirements, both signed document types, post-signing edits, strike-through history, and superseded PDFs. | QA + Documents | RE-3 | CAT-7/8; Plan §8 | Error codes and immutable history match requirements. |
| `[ ] RE-7.4` | Test deterministic four-input engine behavior, rule precedence, stress threshold, no-match, and staff override flow. | QA + Recommendation | RE-4 | Plan §9 | Engine is repeatable and cannot invent products. |
| `[ ] RE-7.5` | Run focused Typst compilation, backend build/type checks, frontend checks, and report-to-treatment smoke testing. | Release | RE-3, RE-5 | PDF implementation; Plan Phase 5 | Affected checks pass; unrelated failures are documented. |
| `[ ] RE-7.6` | Confirm no secrets, signed URLs, real patient fixtures, or `.env.local` changes enter the repositories. | Release + Security | All phases | Repository safety rules | Diff and fixture scan pass. |

## Release definition of done

- [ ] Manual Treatment Plan creation works without the Recommendation Engine.
- [ ] CatalogItems and ProtocolTemplates are clinic-isolated and validate their own types/routines.
- [ ] TreatmentRecommendations are the only editable treatment-line source.
- [ ] Prescription is generated only as a medication projection from TreatmentRecommendations.
- [ ] Treatment Plan and Prescription both require review/signature and retain immutable versions.
- [ ] The minimal engine uses only gender, stage/scale, questionnaire/root cause, and stress score, then returns editable proposals.
- [ ] AI recommendation work is not part of the initial release.
- [ ] The Clinical Trichoscopy Report remains recommendation-free.
- [ ] Backend, frontend, PDF, isolation, audit, projection, and no-patient-data gates pass.

## Implementation authority and source anchors

- Authority: `../recomendation-and-treatment-plan/plan.md`
- Requirements: `requirements/modules/04-sessions.md` (SES-2, SES-3, SES-HA-4)
- Requirements: `requirements/modules/07-catalog.md` (CAT-1 through CAT-8)
- Current implementation: `implementations/modules/04-sessions.md`, `implementations/modules/07-catalog.md`, `implementations/11-pdf-generation.md`, `implementations/18-collection-schemas.md`
- Existing tasks: `tasks/backend/04-sessions.md`, `tasks/frontend/04-sessions.md`, `tasks/frontend/07-catalog.md`
- Design boundary: `designs/modules/07-catalog.md`
