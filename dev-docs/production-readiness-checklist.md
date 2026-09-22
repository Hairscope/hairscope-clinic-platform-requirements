# Hairscope Clinic Platform — Production Readiness Checklist

> Status: Draft · Generated September 2026 · Source: `project_overview.md`,
> `.kiro/specs/hairscope-clinic-platform/requirements/modules/`, and a direct
> code audit of `hairscope-backend`, `hairscope-clinic-web`, and
> `hairscope-admin` (plus `hairscope-selfie`, found to hold one of the
> web-component features).

This checklist tracks what's required before opening the platform to public
production traffic, module by module. Each item's status reflects **actual
code**, not the requirements spec alone and not the `progressive.md` steering
notes in `hairscope-backend`/`hairscope-clinic-web` — those notes are stale
and understate what exists in some places (Sessions, Catalog) while several
frontend pages that *look* wired are in fact static mock data with no
backend at all (Leads, Appointments, Billing, Audit).

Legend: ✅ Done · ⚠️ Partial / needs work · ❌ Not started

---

## 1. Identity & Access (IAM)

- [x] ✅ Invite flow (single-use link, TTL, invitee sets password)
- [x] ✅ Self-registration (org + clinic + staff creation)
- [x] ✅ Role & permission management, permission matrix UI
- [x] ✅ Staff lifecycle (`PENDING_REGISTRATION → ACTIVE ↔ INACTIVE`)
- [x] ✅ Multi-device JWT, deactivation invalidates tokens
- [x] ✅ Password reset (forgot-password flow)

**Status: Production-ready.** Backend (`hairscope-backend/packages/api/src/modules/iam/`)
and frontend both complete and wired end-to-end.

---

## 2. Organization Management

- [x] ✅ Org & clinic profile (name, address, timezone, currency, language,
      working hours, logo, T&Cs)
- [x] ✅ Currency enforcement policy (org-level)
- [x] ✅ Clinic closures, staff availability configuration
- [x] ✅ Report template configuration
- [ ] ⚠️ Record Visibility Mode (`OPEN`/`RESTRICTED`) — enforcement not
      independently confirmed; verify before launch if any clinic intends to
      use `RESTRICTED` mode
- [ ] ⚠️ Individual record reassignment on staff deactivation/deletion — not
      independently confirmed; this is a hard requirement (GI invariants) if
      any clinic deactivates staff with assigned patients/leads/appointments

**Status: Mostly production-ready.** Implemented inside the IAM backend
module (not a separate NestJS module — fine functionally, just a naming
mismatch against the spec). Confirm the two ⚠️ items before relying on them.

---

## 3. Audit & Compliance — 🚩 Blocking gap

- [x] ⚠️ Audit log **write path** exists (`AuditService.append()`, called
      internally by other modules)
- [ ] ❌ **No audit log read API** — no resolver exists to query audit
      history at all
- [ ] ❌ **No GDPR erasure** — zero implementation anywhere in the backend
      (confirmed via full-source grep)
- [ ] ❌ **No consent record tracking**
- [ ] ❌ Frontend `/audit` page is 100% hardcoded mock data, not connected to
      any service

**Status: Not production-ready.** This is a hard blocker given the platform
is explicitly GDPR + HIPAA scoped (`project_overview.md`, System Principle
#2). Cannot legally onboard patient data in the EU/for HIPAA-covered
workflows without erasure support and a real audit trail that's actually
queryable (write-only logging that nobody can read or export defeats the
purpose for compliance audits).

---

## 4. Patients

- [x] ✅ Patient CRUD, per-clinic uniqueness, search
- [x] ✅ Medical documents upload
- [ ] ⚠️ Treatment progress graph (`hairCount`/`thickness`/`coverage` across
      completed sessions) — not independently re-verified this pass, was
      listed as built in earlier session notes; spot-check before launch
- [ ] ❌ GDPR erasure action on a patient record (blocked by module 3 above)

**Status: Production-ready pending module 3.** Core patient management is
solid; the GDPR erasure gap is really the Audit module's gap surfacing here
too.

---

## 5. Sessions (Trichoscopy / Hair Analysis)

- [x] ✅ Session lifecycle (`DRAFT → SAVED → COMPLETED`), one draft per type
- [x] ✅ Global + trichoscopy image capture, AI analysis pipeline
- [x] ✅ Annotation editor (follicle/strand tools)
- [x] ✅ Questionnaire + stress test, auto-calculated root cause
- [x] ✅ Clinical PDF report generation
- [x] ✅ **Staff hairfall-stage override — fixed and verified.** Corrected
      from an earlier assessment of this checklist, which was based on
      stale steering notes rather than current code. Directly confirmed in
      source:
      `SessionResolver.updateSessionHairloss` (real mutation) →
      `GlobalAnalysisService.setSessionHairloss()` (writes
      `hairlossScale`/`hairlossStage`, sets `hairlossSource: HUMAN`, marks
      the report outdated, writes an audit entry) →
      frontend `handleStageChange`/`handleSaveStage` in the session page
      call the mutation and refetch from the server (not local-state-only).
      `GlobalAnalysisService.recomputeSessionHairloss()` explicitly skips
      recomputation when `hairlossSource === HUMAN`, so a later AI rerun
      cannot silently overwrite a clinician's manual correction.
- [ ] ⚠️ `volumeRetained` and `hairScore` — not re-verified this pass;
      earlier notes said no formula exists and both are always written as
      `null`. Spot-check before relying on either in a report.
- [ ] ⚠️ Density-zone rollups (`hairCoverage`, high/medium/low density %) —
      not re-verified this pass; earlier notes said this was deferred.
- [ ] ⚠️ Per-field override provenance beyond the hairloss stage
      (`analysisOverrides[]` for other overridable fields) — not
      re-verified this pass now that the hairloss-stage case is confirmed
      fixed; check whether the same protection pattern extends to any other
      manually-correctable field before assuming it does.

**Status: Core clinical workflow is production-ready.** The
previously-identified stage-override bug is fixed and verified against
current source. The three ⚠️ items above were flagged in earlier session
notes as deferred/unbuilt but were not independently re-checked in this
pass — confirm their current state before treating them as launch
blockers, since the stage-override item turned out to already be resolved
despite older notes saying otherwise.

---

## 6. Catalog

- [x] ✅ Unified catalog (services/medications/cosmetics/supplements)
- [x] ✅ Treatment plan generation
- [ ] ❌ **Prescription digital signature** — required by spec ("requires
      digital signature" for both Treatment Plan and Prescription
      documents) but confirmed absent from the `treatment-plans` module
- [ ] ⚠️ Treatment kits (bundled pricing) — not independently re-verified
      this pass
- [ ] ⚠️ Session recommendations (routine customization) — not
      independently re-verified this pass

**Status: Mostly production-ready.** Digital signature is a named, explicit
requirement (staff must upload a signature image and it must appear on
generated documents) — worth confirming whether this is a legal requirement
in your target markets (e-signatures on prescriptions often are) before
deciding whether it blocks launch.

---

## 7. Leads — 🚩 Not started (backend)

- [ ] ❌ Backend: no `LeadsModule` exists at all
- [ ] ❌ Lead capture, assignment (auto/manual), distribution algorithm
- [ ] ❌ Lead → Patient conversion
- [ ] ❌ Frontend `/leads` page is a static 5-row mock array, no service or
      GraphQL wiring whatsoever

**Status: Not started.** If lead capture from the Selfie Analysis widget or
manual entry is expected at launch, this entire module needs to be built —
it's not a bug fix, it's greenfield work.

---

## 8. Appointments — 🚩 Not started (backend)

- [ ] ❌ Backend: no `AppointmentsModule` exists at all
- [ ] ❌ Booking, slot availability, smart scheduling
- [ ] ❌ Appointment → auto-create draft session cascade
- [ ] ❌ Cancellation cascade (deletes linked draft session)
- [ ] ❌ Frontend `/appointments` page confirmed as static mock data
      (5 hardcoded rows, no service import)

**Status: Not started.** Same situation as Leads — this is a full module
build, not a fix. Given Sessions can store an `appointmentId` per the spec,
and appointment confirmation is meant to auto-create a draft session, this
module and Sessions have a real dependency — plan the build order
accordingly.

---

## 9. Billing (clinic invoicing) — 🚩 Not started (backend)

- [ ] ❌ Backend: no billing/invoicing module exists at all
- [ ] ❌ Draft invoice auto-generation on session completion
- [ ] ❌ Invoice line item sync, manual line items, discounts/tax
- [ ] ❌ Invoice PDF export
- [ ] ❌ Frontend `/billing` page confirmed as static mock data (4 hardcoded
      invoice rows, no service import)

**Status: Not started.** Note this module only ever needed to *track*
invoice amounts per the spec's own scope (no payment gateway inside the
core platform) — that's still not built. Do not confuse this with
`hairscope-admin`'s subscription billing (module 15), which is a
completely different, unrelated billing surface (clinics paying Hairscope
for the platform, vs. patients paying clinics for treatment).

---

## 10. Notification Service — 🚩 Not started

- [ ] ❌ `hairscope-backend/packages/worker-notification/` exists as an empty
      package shell — no queue processors, channel adapters, template
      rendering, or event listeners
- [ ] ❌ Email, WhatsApp, SMS, push, in-app, webhook channels — none built
- [ ] ❌ Retry/fallback, rate limiting, quiet hours, delivery tracking

**Status: Not started.** This is infrastructure every other module depends
on for user-facing communication (appointment confirmations, session-ready
alerts, invoice notices). Worth prioritizing early since Leads,
Appointments, and Sessions all assume notifications fire on their domain
events.

---

## 11. Reminder Service — 🚩 Not started

- [ ] ❌ `hairscope-backend/packages/worker-reminder/` exists as an empty
      package shell — no scheduling logic, due-detection, or recurrence
      handling

**Status: Not started.**

---

## 12. Communication Policy — 🚩 Not started

- [ ] ❌ No requirements doc of its own (folded into the Notification spec
      conceptually but never split out)
- [ ] ❌ No backend implementation — templates, channel preferences, quiet
      hours, branding all absent

**Status: Not started.** The Notification Service spec assumes this module
exists to supply templates and preferences; building Notification without
this means hardcoding everything Communication Policy was meant to own.

---

## 13. Selfie Analysis Web Component

- [x] ✅ Implemented — lives in its own repo, `hairscope-selfie` (Stencil
      project), not inside the three main repos
- [x] ✅ Admin-side capture endpoint exists (`hairscope-admin/src/selfie/`)
- [ ] ⚠️ End-to-end lead creation is blocked by module 7 (Leads) not
      existing on the clinic backend — confirm where captured selfie leads
      actually land today, since `LeadsModule` doesn't exist to receive them

**Status: Widget itself built; downstream lead pipeline is broken by
module 7's absence.** Worth explicitly tracing where selfie-captured data
goes right now, since it may currently be a dead end.

---

## 14. Appointment Booking Web Component — 🚩 Not started

- [ ] ❌ Confirmed absent everywhere in the workspace — no Stencil project,
      no partial implementation, nothing in legacy folders

**Status: Not started.** Also blocked by module 8 (Appointments) not
existing on the backend — building the widget before the backend module
would have nothing to call.

---

## 15. Subscription / Billing for Clinics (`hairscope-admin`)

- [x] ✅ Plans, trials, entitlements, usage meters
- [x] ✅ Payment gateway adapters — both Razorpay and Stripe, real and
      tested (not stubs)
- [x] ✅ Webhook ingestion (gateway events, controller + service + tests)
- [x] ✅ Referral/partner system (self-service auth, analytics, admin +
      public controllers)
- [x] ✅ Subscriber/partner portal frontend (dashboard, checkout, plans,
      partner pages)
- [x] ✅ **Cross-service runtime wiring to `hairscope-backend` exists and
      is live** — this bullet's earlier "not implemented" claim was already
      stale before this update: `SubscriptionClientService`
      (`hairscope-backend/packages/api/src/modules/subscription/services/subscription-client.service.ts`)
      calls `attach`/`check`/`track`/`cancel`/`sync-quantity` against
      `ADMIN_API_URL` with the `X-Service-Token` header today, consumed by
      `EntitlementService`, `SubscriptionResolver`, and
      `OrganizationService`. Directly confirmed by reading the client and
      its callers, not by grep alone.
- [x] ✅ **Registration-time referral attribution wired end-to-end**
      (2026-09-22) — see
      `docs/referral-registration-attribution-design.md` in `hairscope-admin`.
      `ReferralStatus` gained `PENDING`;
      `ReferralsService.redeemAtRegistration` fans a code out into one
      `PENDING` `Referral` row per eligible Hairscope product
      (`POST /v1/referrals/redeem-at-registration`); a `Subscriber` row is
      now provisioned unconditionally at registration
      (`POST /v1/subscribers/provision`), not just lazily on first
      purchase. `hairscope-backend`'s `RegistrationService.selfRegister`
      calls both after its Mongo transaction commits, never able to roll
      it back; a missing/invalid code never fails registration, it's
      reported back as `referralCodeStatus`
      (`NOT_PROVIDED`/`APPLIED`/`INVALID`/`ERROR`). Frontend
      (`hairscope-clinic-web`'s `/register` page) sends the code and shows
      non-blocking feedback if it didn't apply. Verified live end-to-end
      against running dev servers with real DB inspection (fan-out row
      counts, SERIAL_NUMBER-vs-SERIAL_NUMBER blocking, SERIAL_NUMBER
      superseding a PARTNER_CODE row in place).
- [ ] ⚠️ **Purchase-time activation is still the old single-product,
      no-`PENDING`-state path** — `EntitlementsService.attach` still calls
      `createAttribution` directly and creates a `Referral` row as
      `ACTIVE` immediately; it does not yet look up the `PENDING` row the
      registration-time fan-out created and flip it, nor does it call
      `linkSubscription` (still uncalled from any real code path) or
      disable sibling `PENDING` rows for the same code. Deliberately
      deferred — the registration-time work above intentionally stopped
      short of this per an explicit scoping decision, not an oversight.
      Needs to be done before referral commissions can reflect an org that
      registered with a code and later actually purchases.
- [ ] ⚠️ **No "add a code later" entry point** — the design doc describes
      a second code-entry surface (the org profile, for orgs that
      registered without a code or want to add the other type) alongside
      registration. Only the registration-time endpoint
      (`redeem-at-registration`) exists; no mutation or UI for adding a
      code after the fact yet.

**Status: Admin service itself is the most mature "hidden" module in the
platform — genuinely close to production-ready on its own.** Runtime
wiring to `hairscope-backend` is real and live for both the checkout path
(`attach`/`check`/`track`/`cancel`) and, as of this update, registration-time
referral attribution. What's left in this module is the purchase-time
activation step (flip `PENDING → ACTIVE`, link the subscription, disable
sibling rows) and the org-profile "add a code later" surface — both
contained, well-scoped follow-ups, not a rebuild.

---

## Summary

| # | Module | Backend | Frontend | Blocking? |
|---|--------|---------|----------|-----------|
| 1 | IAM | ✅ | ✅ | No |
| 2 | Organization | ✅ | ✅ | No |
| 3 | Audit & Compliance | ❌ read/GDPR | ❌ mock | **Yes — compliance** |
| 4 | Patients | ✅ | ✅ | No (GDPR action blocked by #3) |
| 5 | Sessions | ✅ (override fix confirmed) | ✅ | No |
| 6 | Catalog | ⚠️ no e-signature | ✅ | Maybe — depends on legal requirement |
| 7 | Leads | ❌ | ❌ mock | Depends on launch scope |
| 8 | Appointments | ❌ | ❌ mock | Depends on launch scope |
| 9 | Billing (clinic) | ❌ | ❌ mock | Depends on launch scope |
| 10 | Notification Service | ❌ | N/A | Yes, if 7/8/9 are in scope |
| 11 | Reminder Service | ❌ | N/A | Yes, if 8 is in scope |
| 12 | Communication Policy | ❌ | N/A | Yes, if 10 is in scope |
| 13 | Selfie widget | ✅ (own repo) | — | No, but downstream broken by #7 |
| 14 | Appointment widget | ❌ | — | Depends on launch scope |
| 15 | Subscription/Admin | ✅ checkout + registration wiring live; ⚠️ purchase-time referral activation still old path | ✅ | No — core wiring done; referral activation is a follow-up |

### One unconditional blocker (regardless of launch scope)
1. **Module 3 — Audit & Compliance.** No GDPR erasure, no readable audit
   trail. The platform's own stated principles require both.

(Module 5's hairloss-stage override bug, originally listed as a second
unconditional blocker, is confirmed fixed — see Module 5 above. Corrected
after direct source verification; the original claim came from stale
steering notes, not current code.)

### Scope-dependent blockers
Modules 7, 8, 9, 10, 11, 12, and 14 are a cohesive unit — Leads →
Appointments → Sessions → Billing is the full patient journey, and
Notification/Reminder/Communication-Policy exist to serve all of them. If
the initial public launch is meant to support the *complete* clinic
workflow (lead capture through invoicing), all of these need to be built
from scratch — this is the single largest chunk of remaining work, not a
short list of fixes.

If the initial launch is deliberately narrower (e.g., sessions + patients +
catalog only, with appointments/billing/leads staying manual/off-platform
for v1), then only the two unconditional blockers above need to close.
**This scoping decision should be made explicitly before prioritizing the
remaining backlog**, since it changes the checklist from "two fixes" to
"two fixes plus five new modules."

---

## Notes on sourcing

- `hairscope-backend/.kiro/steering/progressive.md` and
  `hairscope-clinic-web/.kiro/steering/progressive.md` are **stale** and
  should not be used to judge module status — they understate what's built.
  The first draft of this checklist trusted those notes for the Sessions
  hairloss-stage override item and incorrectly listed it as an unresolved
  bug; direct source inspection (resolver, service, and frontend mutation
  call) confirmed it was already fixed. That correction is reflected above.
  Several frontend routes that exist and render fine are still confirmed
  pure mock data with zero backend connection (Leads, Appointments,
  Billing, Audit) — those were verified by direct page-source read, not by
  steering notes.
- Module 15's "cross-service runtime wiring is not implemented" bullet was
  **also stale** — the original claim was a grep-only check that missed
  `SubscriptionClientService`'s real, already-wired `attach`/`check`/
  `track`/`cancel` calls. Corrected 2026-09-22 after direct code reading
  (the client, its callers, and — for the newly-added registration-time
  wiring — a live end-to-end run against running dev servers with DB
  inspection, not just source reading).
- Items marked ⚠️ in this document are explicitly **not independently
  re-verified against current source** — they carry forward from earlier
  session notes and should be checked directly (the way the stage-override
  item was) before being treated as fact in either direction.
- Recommend updating both steering files once this checklist is acted on,
  so future sessions don't re-derive this from scratch or repeat the same
  stale-notes mistake.
