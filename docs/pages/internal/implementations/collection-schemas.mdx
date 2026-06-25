# MongoDB Collection Schemas

> Complete field definitions for every collection in the Hairscope platform.
> Collections marked with ✅ are **implemented** in the current backend.
> Collections marked with 🔲 are **planned** (not yet implemented).

---

## Base Schema Fields (inherited by all tenant-scoped collections) ✅

```typescript
// packages/api/src/common/database/base.schema.ts
export const BaseSchemaFields = {
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
  updatedBy: { type: Schema.Types.ObjectId },
};
```

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `organizationId` | ObjectId | ✅ | ✅ | — | Tenant isolation |
| `clinicId` | ObjectId | — | ✅ | — | Clinic scope |
| `createdAt` | Date | — | — | `Date.now` | Creation timestamp |
| `updatedAt` | Date | — | — | `Date.now` | Last update timestamp |
| `createdBy` | ObjectId | — | — | — | Staff who created |
| `updatedBy` | ObjectId | — | — | — | Staff who last updated |

---

## Module 1: IAM ✅

### Collection: `staffs` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `firstName` | String | — | — | — | Staff first name |
| `lastName` | String | — | — | — | Staff last name |
| `email` | String | ✅ | ✅ (unique compound) | — | Login email |
| `phone` | String | — | — | — | Contact phone |
| `passwordHash` | String | — | — | — | Argon2 hashed password |
| `avatarUrl` | String | — | — | — | GCS file path for avatar |
| `biography` | String | — | — | — | Short bio |
| `specialization` | String | — | — | — | e.g., "Trichology" |
| `experience` | String | — | — | — | e.g., "8 years" |
| `userType` | String (enum) | ✅ | ✅ | `CLINIC_STAFF` | `CLINIC_STAFF`, `PLATFORM_SUPPORT`, `PLATFORM_ADMIN` |
| `status` | String (enum) | — | ✅ | `PENDING_REGISTRATION` | `ACTIVE`, `INACTIVE`, `PENDING_REGISTRATION` |
| `roles` | ObjectId[] | — | — | — | References to `roles` collection |
| + BaseSchemaFields |

**Indexes:**
- `{ organizationId: 1, clinicId: 1, email: 1 }` — **unique**
- `{ status: 1 }`
- `{ userType: 1 }`

---

### Collection: `roles` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Role name (e.g., "Doctor", "ClinicAdmin") |
| `description` | String | — | — | — | Role description |
| `permissions` | Array | — | — | — | Permission grants |
| `permissions[].module` | String | ✅ | — | — | Module name (patients, leads, etc.) |
| `permissions[].actions` | String[] | — | — | — | `VIEW`, `CREATE`, `EDIT`, `DELETE` |
| `isSystem` | Boolean | — | — | `false` | System roles can't be deleted |
| `isDefault` | Boolean | — | — | `false` | Auto-assigned to new staff |
| `status` | String (enum) | ✅ | — | `ACTIVE` | `ACTIVE` |
| + BaseSchemaFields |

**Indexes:**
- `{ organizationId: 1, clinicId: 1, name: 1 }` — **unique**

---

### Collection: `invitetokens` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | ✅ | — | Staff being invited |
| `tokenHash` | String | ✅ | ✅ (unique) | — | Argon2 hash of invite token |
| `expiresAt` | Date | ✅ | ✅ (TTL) | — | Token expiry (7 days) |
| `usedAt` | Date | — | — | — | When invite was accepted |
| `revokedAt` | Date | — | — | — | When invite was cancelled |
| + BaseSchemaFields |

**Indexes:**
- `{ expiresAt: 1 }` — TTL index (auto-delete expired tokens)

---

## Module 2: Organization ✅

### Collection: `organizations` ✅

Does NOT extend BaseDocument — it IS the top of the tenant hierarchy.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Organization name |
| `logoUrl` | String | — | — | — | GCS file path for logo |
| `subscriptionAccountId` | String | — | — | — | External subscription API ID |
| `status` | String (enum) | ✅ | — | `ACTIVE` | `ACTIVE`, `INACTIVE` |
| `currency` | String | — | — | — | ISO 4217 currency code |
| `email` | String | — | — | — | Organization email |
| `phone` | String | — | — | — | Organization phone |
| `website` | String | — | — | — | Organization website |
| `timezone` | String | — | — | — | IANA timezone |
| `billingAddress.street` | String | — | — | — | Street address |
| `billingAddress.city` | String | — | — | — | City |
| `billingAddress.state` | String | — | — | — | State/Province |
| `billingAddress.country` | String | — | — | — | Country |
| `billingAddress.postalCode` | String | — | — | — | Postal code |
| `billingAddress.full` | String | — | — | — | Full address string |
| `currencyEnforcementPolicy` | String (enum) | — | — | `STRICT` | `STRICT`, `FLEXIBLE` |
| `recordVisibilityMode` | String (enum) | — | — | `CLINIC_ONLY` | `CLINIC_ONLY`, `ORGANIZATION_WIDE` |
| `leadAssignmentMode` | String (enum) | — | — | `MANUAL` | `MANUAL`, `ROUND_ROBIN` |
| `termsEnforcementPolicy` | String (enum) | — | — | `ORGANIZATION_WIDE` | `ORGANIZATION_WIDE`, `CLINIC_SPECIFIC` |
| `termsType` | String (enum) | — | — | `NONE` | `NONE`, `URL`, `CONTENT` |
| `termsContent` | String | — | — | — | Rich text T&C content |
| `termsUrl` | String | — | — | — | External T&C URL |
| `treatmentRecommendationMode` | String (enum) | — | — | `STAGE_SCALE` | `STAGE_SCALE`, `HAIRSCORE` — strategy for matching custom treatment data |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |
| `updatedBy` | ObjectId | — | — | — | — |

---

### Collection: `clinics` ✅

Does NOT extend BaseDocument — it has `organizationId` but no `clinicId` (it IS the clinic).

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Clinic name |
| `logoUrl` | String | — | — | — | GCS file path for logo |
| `address.street` | String | — | — | — | Street address |
| `address.city` | String | — | — | — | City |
| `address.state` | String | — | — | — | State/Province |
| `address.country` | String | — | — | — | Country |
| `address.postalCode` | String | — | — | — | Postal code |
| `address.full` | String | ✅ | — | — | Full address string |
| `address.latitude` | Number | — | — | — | Geocoded latitude |
| `address.longitude` | Number | — | — | — | Geocoded longitude |
| `email` | String | — | — | — | Clinic email |
| `phone` | String | — | — | — | Clinic phone |
| `website` | String | — | — | — | Clinic website URL |
| `timezone` | String | — | — | — | IANA timezone |
| `language` | String | — | — | — | Default language code |
| `currency` | String | — | — | — | ISO 4217 |
| `workingHours` | Array | — | — | — | Weekly schedule |
| `workingHours[].day` | String (enum) | ✅ | — | — | `MONDAY`–`SUNDAY` |
| `workingHours[].startTime` | String | — | — | — | "HH:mm" format |
| `workingHours[].endTime` | String | — | — | — | "HH:mm" format |
| `workingHours[].closed` | Boolean | — | — | `false` | Is clinic closed this day |
| `termsType` | String (enum) | — | — | `NONE` | `NONE`, `URL`, `CONTENT` |
| `termsContent` | String | — | — | — | Rich text T&C content |
| `termsUrl` | String | — | — | — | External T&C URL |
| `recordVisibilityMode` | String (enum) | ✅ | — | `OPEN` | `OPEN`, `RESTRICTED` |
| `status` | String (enum) | ✅ | — | `ACTIVE` | `ACTIVE`, `INACTIVE` |
| `organizationId` | ObjectId | ✅ | ✅ | — | Parent organization |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |
| `updatedBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ organizationId: 1, name: 1 }` — **unique**

---

### Collection: `clinicclosures` ✅

Tracks specific dates when a clinic is closed (holidays, events, etc.). Used by the slot availability service to block bookings on closed dates.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `date` | Date | ✅ | ✅ | — | The closed date |
| `reason` | String | — | — | — | Reason for closure (e.g., "Christmas") |
| `recurring` | Boolean | — | — | `false` | Repeats annually (match month+day) |
| `status` | String (enum) | ✅ | — | `ACTIVE` | `ACTIVE` (extensible for future approval workflows) |
| + BaseSchemaFields |

**Indexes:**
- `{ clinicId: 1, date: 1 }` — **unique**
- `{ clinicId: 1, date: 1, recurring: 1 }` — range queries with recurring filter

---

### Collection: `staffavailabilities` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | ✅ | — | Staff member |
| `schedule` | Array | — | — | `[]` | Weekly availability |
| `schedule[].day` | String (enum) | ✅ | — | — | `MONDAY`–`SUNDAY` |
| `schedule[].startTime` | String | ✅ | — | — | "HH:mm" |
| `schedule[].endTime` | String | ✅ | — | — | "HH:mm" |
| `schedule[].available` | Boolean | ✅ | — | `false` | Available this day |
| + BaseSchemaFields |

**Indexes:**
- `{ staffId: 1, clinicId: 1 }` — **unique**

---

### Collection: `customtreatmentdata` ✅

Per-organization, per-language treatment descriptions matched to a hairloss stage (or hair-score range). Used by report/recommendation generation to render stage descriptions and treatment copy in the clinic's language. Collection name is `customtreatmentdata` (explicit, set via schema `collection` option).

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `language` | String | ✅ | ✅ (compound) | — | Locale code (e.g., `en`, `ar`, `es`) |
| `matchingStrategy` | String (enum) | — | — | `STAGE_SCALE` | `STAGE_SCALE`, `HAIRSCORE` |
| `hairlossScale` | String | ✅ | ✅ (compound) | — | `Norwood` or `Ludwig` |
| `hairlossStage` | String | ✅ | ✅ (compound) | — | Stage identifier (`1`, `2`, `3`, …) |
| `gender` | String (enum) | — | — | `null` | `MALE`, `FEMALE` — used for `HAIRSCORE` strategy |
| `minHairScore` | Number | — | — | `0` | 0-100 (HAIRSCORE strategy range start) |
| `maxHairScore` | Number | — | — | `100` | 0-100 (HAIRSCORE strategy range end) |
| `stageDescription` | String | — | — | `''` | Stage description text |
| `treatmentShortDescription` | String | — | — | `''` | Short treatment copy |
| `treatmentLongDescription` | String | — | — | `''` | Long treatment copy |
| `previewImageUrl` | String | — | — | — | GCS path |
| `stageImageUrl` | String | — | — | — | GCS path |
| `treatmentImageUrl` | String | — | — | — | GCS path |
| + BaseSchemaFields (org-scoped; `clinicId` unused) |

**Indexes:**
- `{ organizationId: 1, language: 1, hairlossScale: 1, hairlossStage: 1 }` — **unique**

---

## Module: Auth ✅

### Collection: `authsessions` ✅

Tracks active authentication sessions for staff. Does NOT use typical BaseDocument lifecycle (never updated for content changes).

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | ✅ | — | Staff member |
| `status` | String (enum) | ✅ | — | `ACTIVE` | `ACTIVE`, `REVOKED` |
| `refreshTokenHash` | String | ✅ | ✅ | — | Hashed refresh token |
| `userAgent` | String | — | — | — | Client user agent |
| `ipAddress` | String | — | — | — | Client IP |
| `lastActivityAt` | Date | — | — | `Date.now` | Updated on token refresh |
| `revokedAt` | Date | — | — | — | When session was revoked |
| `revokedReason` | String (enum) | — | — | — | `LOGOUT`, `TOKEN_REFRESH`, `PASSWORD_RESET`, `DEACTIVATION`, `SECURITY_TOKEN_REUSE` |
| + BaseSchemaFields |

**Indexes:**
- `{ staffId: 1, status: 1 }`
- `{ revokedAt: 1 }` — TTL index (auto-delete revoked sessions after 30 days, partial filter: `status: 'REVOKED'`)

---

### Collection: `passwordresettokens` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | ✅ | — | Staff requesting reset |
| `tokenHash` | String | ✅ | ✅ (unique) | — | Hashed reset token |
| `expiresAt` | Date | ✅ | ✅ (TTL) | — | 24-hour expiry |
| `usedAt` | Date | — | — | `null` | When token was consumed |
| + BaseSchemaFields |

**Indexes:**
- `{ expiresAt: 1 }` — TTL index (auto-delete expired tokens)
- `{ staffId: 1, usedAt: 1 }` — query unused tokens by staff

---

## Module 3: Patients ✅

### Collection: `patients` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `firstName` | String | ✅ | text | — | Patient first name |
| `lastName` | String | ✅ | text | — | Patient last name |
| `email` | String | ✅ | ✅ (compound) | — | Patient email |
| `phone` | String | — | ✅ (partial) | — | Patient phone |
| `dateOfBirth` | Date | — | — | — | Date of birth |
| `age` | Number | — | — | — | Calculated from DOB |
| `genderAssignedAtBirth` | String (enum) | ✅ | — | — | `MALE`, `FEMALE`, `OTHER` |
| `externalPatientId` | String | — | — | — | External system ID |
| `globalPatientId` | String | — | ✅ | — | Cross-org patient identity |
| `convertedFromLeadId` | ObjectId | — | — | — | Lead that was converted |
| `isErased` | Boolean | — | — | `false` | GDPR erasure flag |
| + BaseSchemaFields |

**Indexes:**
- `{ clinicId: 1, email: 1 }` — **unique**
- `{ clinicId: 1, phone: 1 }` — **unique** (partial: phone not null)
- `{ clinicId: 1, firstName: 'text', lastName: 'text' }` — text search

---

### Collection: `medicaldocuments` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `patientId` | ObjectId | ✅ | ✅ | — | Owner patient |
| `title` | String | ✅ | — | — | Document title |
| `description` | String | — | — | — | Document description |
| `fileUrl` | String | ✅ | — | — | GCS storage path |
| `fileType` | String (enum) | — | — | — | `JPEG`, `PNG`, `PDF` |
| `fileSize` | Number | — | — | — | Size in bytes |
| + BaseSchemaFields |

---

## Module 4: Sessions ✅ (Schema Rework)

### Collection: `sessions` ✅

Tracks session lifecycle and metadata. Questionnaires, images, AI analysis, and reports live in separate collections.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `patientId` | ObjectId | ✅ | ✅ | — | Patient this session belongs to |
| `sessionType` | String (enum) | ✅ | — | — | `HAIR_ANALYSIS`, `SKIN_TREATMENT`, `HAIR_REMOVAL`, `SCALP_TREATMENT`, `LASER_TREATMENT`, `CONSULTATION` |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `SAVED`, `COMPLETED`, `DELETED` |
| `assignedTo` | ObjectId | — | — | — | Staff member assigned |
| `appointmentId` | ObjectId | — | — | — | Linked appointment (optional) |
| `doctorsNote` | String | — | — | `''` | Doctor's observations |
| `rootCause` | String | — | — | — | Determined root cause |
| `stressScore` | Number | — | — | — | Computed stress score |
| `aiAnalysisStatus` | String (enum) | — | — | `PENDING` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `aiAnalysisCompletedAt` | Date | — | — | — | When AI finished |
| `thumbnailUrl` | String | — | — | `''` | Thumbnail (first/primary image) for session lists |
| `imageCount` | Number | — | — | `0` | Cached count of images on the session |
| `sequence` | Number | — | — | `0` | Ordering within the patient's session history |
| `savedAt` | Date | — | — | — | When moved to SAVED |
| `completedAt` | Date | — | — | — | When completed |
| `deletedAt` | Date | — | — | — | When soft-deleted |
| + BaseSchemaFields |

**Indexes:**
- `{ patientId: 1, clinicId: 1, sessionType: 1, status: 1 }` — partial unique on `status: 'DRAFT'`
- `{ clinicId: 1, organizationId: 1, status: 1 }`
- `{ patientId: 1, status: 1 }`

---

### Collection: `sessionquestionnaires` ✅

One document per question-answer per session.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient |
| `questionId` | String | ✅ | — | — | Question identifier |
| `patientAnswer` | String | ✅ | — | — | Patient's answer |
| `questionType` | String | — | — | — | Question category/type |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionId: 1, questionId: 1 }` — unique per session per question

---

### Collection: `sessionimages` ✅

Stores all captured images — both global and trichoscopy. Per-image AI status tracked here.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient (denormalized) |
| `sequence` | Number | — | — | `0` | Capture order |
| `imageType` | String (enum) | ✅ | ✅ | — | `GLOBAL`, `TRICHOSCOPY` |
| `imageUrl` | String | ✅ | — | — | GCS storage path |
| `globalPosition` | String (enum) | — | — | — | For GLOBAL images |
| `headDiagram` | String (enum) | — | — | — | For TRICHOSCOPY: `TOP`, `BACK`, `LEFT`, `RIGHT` |
| `trichoscopyLabel` | String | — | — | — | User-defined label |
| `trichoscopyNote` | String | — | — | — | Per-image observation |
| `trichoscopyPositionX` | Number | — | — | — | X% on head diagram |
| `trichoscopyPositionY` | Number | — | — | — | Y% on head diagram |
| `widthInMm` | Number | — | — | — | Physical width in mm |
| `heightInMm` | Number | — | — | — | Physical height in mm |
| `brightness` | Number | — | — | `50` | 0-100 brightness |
| `contrast` | Number | — | — | `50` | 0-100 contrast |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| `aiAnalysisStatus` | String (enum) | — | — | `PENDING` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `aiAnalysisCompletedAt` | Date | — | — | — | When AI finished |
| `failureReason` | String | — | — | — | Error if AI failed |
| `retriesRemaining` | Number | — | — | `3` | Auto-retry counter |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionId: 1, imageType: 1, sequence: 1 }`
- `{ patientId: 1, imageType: 1, createdAt: -1 }`

---

### Collection: `globalanalysisdata` ✅

One document per global image. Structured AI results (no raw LLM text). Overrides array for doctor corrections.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient |
| `sessionImageId` | ObjectId | ✅ | ✅ (unique) | — | Reference to `sessionimages._id` |
| `aiModel` | String | — | — | — | AI model identifier (named `aiModel` to avoid Mongoose `Document.model` conflict) |
| `hairlossScale` | String | — | — | — | e.g., "Norwood", "Ludwig" |
| `hairlossStage` | String | — | — | — | e.g., "Stage 3" |
| `hairCoverage` | Number | — | — | — | Coverage % |
| `volumeRetained` | Number | — | — | — | Volume retained % |
| `highDensityZonePercent` | Number | — | — | — | High density % |
| `midiumDensityZonePercent` | Number | — | — | — | Medium density % |
| `lowDensityZonePercent` | Number | — | — | — | Low density % |
| `heatmapImagePath` | String | — | — | — | GCS path to heatmap image |
| `overrides[]` | Array | — | — | — | Staff override audit trail |
| `overrides[].field` | String | ✅ | — | — | Field path overridden |
| `overrides[].previousValue` | Mixed | — | — | — | Before |
| `overrides[].newValue` | Mixed | ✅ | — | — | After |
| `overrides[].reason` | String | — | — | — | Reason |
| `overrides[].overriddenBy` | ObjectId | ✅ | — | — | Staff |
| `overrides[].overriddenAt` | Date | ✅ | — | — | When |
| `aiAnalysisStatus` | String (enum) | — | — | `PENDING` | `PENDING`, `PROCESSING`, `COMPLETED`, `FAILED` |
| `aiAnalysisCompletedAt` | Date | — | — | — | When finished |
| `failureReason` | String | — | — | — | Error |
| `retriesRemaining` | Number | — | — | `3` | Retries |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionImageId: 1 }` — **unique**
- `{ sessionId: 1, aiAnalysisStatus: 1 }`

---

### Collection: `rootpoints` ✅

One document per detected/added follicle point. Soft-deleted points preserved for AI training.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | — | — | Patient |
| `sessionImageId` | ObjectId | ✅ | ✅ | — | Reference to `sessionimages._id` |
| `imageType` | String (enum) | ✅ | — | — | `TRICHOSCOPY` |
| `aiModel` | String | — | — | — | AI model identifier (named `aiModel` to avoid Mongoose `Document.model` conflict) |
| `x` | Number | ✅ | — | — | X coordinate (0-1) |
| `y` | Number | ✅ | — | — | Y coordinate (0-1) |
| `source` | String (enum) | ✅ | — | — | `AI`, `HUMAN` |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionImageId: 1, status: 1 }`
- `{ sessionId: 1, status: 1 }`

---

### Collection: `hairstrands` ✅

One document per detected/added hair strand. Two-point representation (root + end).

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | — | — | Patient |
| `sessionImageId` | ObjectId | ✅ | ✅ | — | Reference to `sessionimages._id` |
| `imageType` | String (enum) | ✅ | — | — | `TRICHOSCOPY` |
| `aiModel` | String | — | — | — | AI model identifier (named `aiModel` to avoid Mongoose `Document.model` conflict) |
| `p1x` | Number | ✅ | — | — | Root X (0-1) |
| `p1y` | Number | ✅ | — | — | Root Y (0-1) |
| `p2x` | Number | ✅ | — | — | End X (0-1) |
| `p2y` | Number | ✅ | — | — | End Y (0-1) |
| `source` | String (enum) | ✅ | — | — | `AI`, `HUMAN` |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `DELETED` |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionImageId: 1, status: 1 }`
- `{ sessionId: 1, status: 1 }`

---

### Collection: `reportdata` ✅

One document per session. Tracks report version and latest PDF URL. Old versions accessible via GCS path convention.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ (unique) | — | Parent session (1:1) |
| `patientId` | ObjectId | ✅ | ✅ | — | Patient |
| `reportUrl` | String | — | — | — | GCS path to latest PDF |
| `reportVersion` | Number | — | — | `0` | Increments on regeneration |
| `reportGeneratedAt` | Date | — | — | — | When last generated |
| + BaseSchemaFields |

**Indexes:**
- `{ sessionId: 1 }` — **unique**

**PDF Path Convention:** `{orgId}/{clinicId}/reports/{sessionId}/YYYY-MM-DD-v{version}.pdf`

---

## Module 7: Catalog ✅

### Collection: `products` ✅

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | text | — | Product/service name |
| `description` | String | — | — | `''` | Description |
| `imageUrl` | String | — | — | `''` | Product image GCS path |
| `price` | Number | — | — | `null` | Unit price |
| `currency` | String | — | — | `''` | ISO 4217 |
| `purchaseLink` | String | — | — | `null` | External purchase URL |
| `productType` | String (enum) | ✅ | ✅ | — | `SERVICE`, `MEDICINE`, `COSMETIC`, `SUPPLEMENT` |
| `isActive` | Boolean | — | — | `true` | Soft delete flag |
| + BaseSchemaFields |

**Indexes:**
- `{ clinicId: 1, productType: 1, isActive: 1 }`
- `{ clinicId: 1, name: 'text', description: 'text' }`
- `{ organizationId: 1, clinicId: 1 }`

---

## Module: Audit ✅

### Collection: `auditlogs` ✅

Does NOT extend BaseDocument — append-only, never updated.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `organizationId` | ObjectId | — | ✅ | — | Organization scope |
| `clinicId` | ObjectId | — | — | — | Clinic scope (null for org-level) |
| `action` | String | ✅ | — | — | Action performed (e.g., `STAFF_CREATED`) |
| `entityType` | String | ✅ | — | — | Entity type (e.g., `Staff`, `Session`) |
| `entityId` | String | ✅ | ✅ | — | Entity ID |
| `staffId` | ObjectId | — | ✅ | — | Who performed the action |
| `ipAddress` | String | — | — | — | Client IP |
| `userAgent` | String | — | — | — | Client user agent |
| `metadata` | Mixed | — | — | — | Additional context (before/after snapshots) |
| `createdAt` | Date | — | — | `Date.now` | — |

**Indexes:**
- `{ organizationId: 1, clinicId: 1, createdAt: -1 }`
- `{ organizationId: 1, action: 1 }`
- `{ entityId: 1 }`
- `{ staffId: 1 }`

---

## Module: Outbox ✅

### Collection: `outboxevents` ✅

Does NOT extend BaseDocument — transactional outbox pattern for event delivery.

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `aggregateType` | String | ✅ | — | — | e.g., `Session`, `Staff` |
| `aggregateId` | String | ✅ | — | — | Entity ID that owns the event |
| `eventType` | String | ✅ | — | — | e.g., `SessionSaved`, `StaffCreated` |
| `payload` | Mixed | ✅ | — | `{}` | Event payload |
| `status` | String (enum) | ✅ | ✅ | `PENDING` | `PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED` |
| `attempts` | Number | ✅ | — | `0` | Delivery attempts |
| `lastAttemptAt` | Date | — | — | — | Last attempt timestamp |
| `nextRetryAt` | Date | — | — | — | Next retry timestamp |
| `error` | String | — | — | — | Last error message |
| `createdAt` | Date | — | — | `Date.now` | — |

**Indexes:**
- `{ status: 1, createdAt: 1 }` — polling for pending events
- `{ aggregateType: 1, aggregateId: 1 }` — query events by aggregate

---
---

## 🔲 PLANNED COLLECTIONS (Not Yet Implemented)

The following collections are designed but not yet built in the backend.

---

## Module 5: Leads 🔲

### Collection: `leads` 🔲

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `firstName` | String | ✅ | — | — | Lead first name |
| `lastName` | String | ✅ | — | — | Lead last name |
| `email` | String | ✅ | ✅ | — | Lead email |
| `phone` | String | — | — | — | Lead phone |
| `gender` | String (enum) | — | — | — | `MALE`, `FEMALE`, `OTHER` |
| `source` | String (enum) | ✅ | — | — | `MANUAL`, `WEBHOOK`, `SELFIE_ANALYSIS` |
| `status` | String (enum) | — | — | `NEW` | `NEW`, `CONTACTED`, `QUALIFIED`, `CONVERTED`, `LOST` |
| `assignedTo` | ObjectId | — | ✅ | — | Assigned staff member |
| `notes` | String | — | — | — | Lead notes |
| `lostReason` | String | — | — | — | Why lead was lost |
| `convertedToPatientId` | ObjectId | — | — | — | Patient created from lead |
| `convertedAt` | Date | — | — | — | Conversion timestamp |
| `selfieAnalysisData` | Mixed | — | — | — | Selfie analysis payload |
| + BaseSchemaFields |

**Indexes:**
- `{ clinicId: 1, assignedTo: 1, status: 1 }`
- `{ clinicId: 1, email: 1 }`

---

## Module 6: Appointments 🔲

### Collection: `appointments` 🔲

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `patientId` | ObjectId | — | ✅ | — | Patient (null if lead booking) |
| `leadId` | ObjectId | — | ✅ | — | Lead (null if patient booking) |
| `serviceId` | ObjectId | ✅ | — | — | Catalog item (SERVICE type) |
| `assignedTo` | ObjectId | ✅ | ✅ | — | Assigned staff |
| `status` | String (enum) | — | — | `SCHEDULED` | `SCHEDULED`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW` |
| `slotStart` | Date | ✅ | ✅ | — | Appointment start time |
| `slotEnd` | Date | ✅ | ✅ | — | Appointment end time |
| `isWalkIn` | Boolean | — | — | `false` | Walk-in appointment |
| `cancelledAt` | Date | — | — | — | Cancellation timestamp |
| `cancelledBy` | ObjectId | — | — | — | Who cancelled |
| `cancellationReason` | String | — | — | — | Reason for cancellation |
| `rescheduledFrom` | ObjectId | — | — | — | Original appointment |
| `notes` | String | — | — | — | Appointment notes |
| + BaseSchemaFields |

**Indexes:**
- `{ clinicId: 1, slotStart: 1, slotEnd: 1 }` — slot availability
- `{ clinicId: 1, assignedTo: 1, slotStart: 1 }` — staff schedule
- `{ leadId: 1, status: 1 }` — lead appointment lookup

---

## Module 8: Billing 🔲

### Collection: `invoices` 🔲

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `invoiceNumber` | String | ✅ | ✅ (unique compound) | — | Sequential: `INV-000001` |
| `patientId` | ObjectId | ✅ | ✅ | — | Billed patient |
| `sessionId` | ObjectId | — | ✅ | — | Linked session |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `ISSUED`, `PAID`, `PARTIALLY_REFUNDED`, `REFUNDED`, `CANCELLED` |
| `lineItems` | Array | — | — | — | Invoice line items |
| `lineItems[].description` | String | ✅ | — | — | Item description |
| `lineItems[].catalogItemId` | ObjectId | — | — | — | Catalog reference |
| `lineItems[].quantity` | Number | — | — | `1` | Quantity |
| `lineItems[].unitPrice` | Number | ✅ | — | — | Price per unit |
| `lineItems[].total` | Number | ✅ | — | — | quantity × unitPrice |
| `subtotal` | Number | — | — | `0` | Sum of line item totals |
| `tax` | Number | — | — | `0` | Tax amount |
| `discount` | Number | — | — | `0` | Discount amount |
| `total` | Number | — | — | `0` | subtotal + tax - discount |
| `amountPaid` | Number | — | — | `0` | Total payments received |
| `balance` | Number | — | — | `0` | total - amountPaid |
| `currency` | String | ✅ | — | — | ISO 4217 |
| `dueDate` | Date | — | — | — | Payment due date |
| `finalizedAt` | Date | — | — | — | When finalized |
| `pdfUrl` | String | — | — | — | Generated PDF URL |
| + BaseSchemaFields |

**Indexes:**
- `{ clinicId: 1, patientId: 1, status: 1 }`
- `{ clinicId: 1, invoiceNumber: 1 }` — **unique**

---

### Collection: `payments` 🔲

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `invoiceId` | ObjectId | ✅ | ✅ | — | Parent invoice |
| `amount` | Number | ✅ | — | — | Payment amount |
| `method` | String (enum) | ✅ | — | — | `CASH`, `CARD`, `BANK_TRANSFER`, `OTHER` — text label only. NO card numbers or bank account details are ever stored. |
| `reference` | String | — | — | — | Transaction reference |
| `paidAt` | Date | — | — | `Date.now` | Payment timestamp |
| + BaseSchemaFields |

---

## Module: Treatment Plans 🔲

### Collection: `treatmentplans` 🔲

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | — | — | Patient |
| `diagnosis` | String | ✅ | — | — | Diagnosis text |
| `goals` | String[] | — | — | — | Treatment goals |
| `lineItems` | Array | — | — | — | Treatment items |
| `lineItems[].catalogItemId` | ObjectId | ✅ | — | — | Catalog reference |
| `lineItems[].itemName` | String | ✅ | — | — | Item name snapshot |
| `lineItems[].type` | String (enum) | — | — | — | `SERVICE`, `MEDICATION`, `COSMETIC`, `SUPPLEMENT` |
| `lineItems[].routine.dosage` | String | — | — | — | e.g., "5mg" |
| `lineItems[].routine.frequency` | String | — | — | — | e.g., "daily" |
| `lineItems[].routine.duration` | String | — | — | — | e.g., "6 months" |
| `lineItems[].routine.timeSlots` | String[] | — | — | — | e.g., ["morning", "evening"] |
| `lineItems[].routine.instructions` | String | — | — | — | Usage instructions |
| `kits` | Array | — | — | — | Treatment kits used |
| `kits[].kitId` | ObjectId | — | — | — | Kit reference |
| `kits[].name` | String | — | — | — | Kit name |
| `kits[].items` | ObjectId[] | — | — | — | Kit item references |
| `nextReviewDate` | Date | — | — | — | Next review date |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `SIGNED` |
| `signedAt` | Date | — | — | — | Signature timestamp |
| `signedBy` | ObjectId | — | — | — | Signing doctor |
| `pdfUrl` | String | — | — | — | Generated PDF URL |
| `editHistory` | Array | — | — | — | Change tracking |
| `editHistory[].field` | String | — | — | — | Changed field |
| `editHistory[].previousValue` | String | — | — | — | Old value |
| `editHistory[].newValue` | String | — | — | — | New value |
| `editHistory[].editedAt` | Date | — | — | — | When changed |
| `editHistory[].editedBy` | ObjectId | — | — | — | Who changed |
| + BaseSchemaFields |

---

### Collection: `prescriptions` 🔲

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `sessionId` | ObjectId | ✅ | ✅ | — | Parent session |
| `patientId` | ObjectId | ✅ | — | — | Patient |
| `treatmentPlanId` | ObjectId | — | — | — | Linked treatment plan |
| `items` | Array | — | — | — | Prescription items |
| `items[].catalogItemId` | ObjectId | ✅ | — | — | Medication/supplement |
| `items[].name` | String | ✅ | — | — | Item name |
| `items[].dosage` | String | — | — | — | Dosage |
| `items[].frequency` | String | — | — | — | Frequency |
| `items[].duration` | String | — | — | — | Duration |
| `items[].instructions` | String | — | — | — | Instructions |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `SIGNED` |
| `signedAt` | Date | — | — | — | — |
| `signedBy` | ObjectId | — | — | — | — |
| `pdfUrl` | String | — | — | — | Generated PDF |
| + BaseSchemaFields |
