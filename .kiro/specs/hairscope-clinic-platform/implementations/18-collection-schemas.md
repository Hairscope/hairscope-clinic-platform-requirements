# MongoDB Collection Schemas

> Complete field definitions for every collection in the Hairscope platform.
> All collections include base fields unless noted otherwise.

---

## Base Schema Fields (inherited by all tenant-scoped collections)

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `organizationId` | ObjectId | ✅ | ✅ | — | Tenant isolation |
| `clinicId` | ObjectId | — | ✅ | — | Clinic scope |
| `status` | String | — | — | — | Entity status |
| `createdAt` | Date | — | — | `Date.now` | Creation timestamp |
| `updatedAt` | Date | — | — | `Date.now` | Last update timestamp |
| `createdBy` | ObjectId | — | — | — | Staff who created |
| `updatedBy` | ObjectId | — | — | — | Staff who last updated |

---

## Module 1: IAM

### Collection: `staff`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `firstName` | String | — | — | — | Staff first name |
| `lastName` | String | — | — | — | Staff last name |
| `email` | String | ✅ | ✅ (unique compound) | — | Login email (immutable after invite) |
| `phone` | String | — | — | — | Contact phone |
| `passwordHash` | String | — | — | — | Argon2 hashed password |
| `specialization` | String | — | — | — | e.g., "Trichology" |
| `experience` | String | — | — | — | e.g., "8 years" |
| `status` | String (enum) | — | — | `PENDING_REGISTRATION` | `ACTIVE`, `INACTIVE`, `PENDING_REGISTRATION` |
| `roles` | ObjectId[] | — | — | — | References to Role collection |
| `organizationId` | ObjectId | ✅ | ✅ | — | Parent organization |
| `clinicId` | ObjectId | ✅ | ✅ | — | Assigned clinic |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | Inviting admin |

**Indexes:**
- `{ organizationId: 1, clinicId: 1, email: 1 }` — **unique**

---

### Collection: `roles`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Role name (e.g., "Doctor", "ClinicAdmin") |
| `permissions` | Array | — | — | — | Permission grants |
| `permissions[].module` | String | ✅ | — | — | Module name (patients, leads, etc.) |
| `permissions[].actions` | String[] | — | — | — | `view`, `create`, `edit`, `delete` |
| `isSystem` | Boolean | — | — | `false` | System roles can't be deleted |
| `isDefault` | Boolean | — | — | `false` | Auto-assigned to new staff |
| `organizationId` | ObjectId | ✅ | — | — | Parent organization |
| `clinicId` | ObjectId | ✅ | — | — | Parent clinic |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |

**Indexes:**
- `{ organizationId: 1, clinicId: 1, name: 1 }` — **unique**

---

### Collection: `invitetokens`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | — | — | Staff being invited |
| `tokenHash` | String | ✅ | ✅ (unique) | — | Argon2 hash of invite token |
| `expiresAt` | Date | ✅ | ✅ (TTL) | — | Token expiry (7 days) |
| `usedAt` | Date | — | — | — | When invite was accepted |
| `revokedAt` | Date | — | — | — | When invite was cancelled |
| `organizationId` | ObjectId | ✅ | — | — | — |
| `clinicId` | ObjectId | ✅ | — | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |

**Indexes:**
- `{ expiresAt: 1 }` — TTL index (auto-delete expired tokens)

---

## Module 2: Organization

### Collection: `organizations`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Organization name |
| `currency` | String | — | — | — | ISO 4217 currency code |
| `currencyPolicy` | String (enum) | — | — | `ALLOW_CLINIC_CURRENCY` | `ENFORCE_SINGLE_CURRENCY`, `ALLOW_CLINIC_CURRENCY` |
| `recordVisibilityMode` | String (enum) | — | — | `OPEN` | `OPEN`, `RESTRICTED` |
| `trialStartedAt` | Date | — | — | — | Trial start date |
| `trialEndsAt` | Date | — | — | — | Trial end date |
| `subscriptionPlan` | String | — | — | `TRIAL` | Current plan |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `SUSPENDED` |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |

---

### Collection: `clinics`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Clinic name |
| `website` | String | — | — | — | Clinic website URL |
| `address.street` | String | — | — | — | Street address |
| `address.city` | String | — | — | — | City |
| `address.state` | String | — | — | — | State/Province |
| `address.country` | String | — | — | — | Country |
| `address.postalCode` | String | — | — | — | Postal code |
| `address.full` | String | ✅ | — | — | Full address string |
| `email` | String | — | — | — | Clinic email |
| `phone` | String | — | — | — | Clinic phone |
| `logo` | String | — | — | — | GCS file path |
| `timezone` | String | ✅ | — | — | IANA timezone |
| `language` | String | — | — | `EN` | Default language |
| `currency` | String | — | — | — | ISO 4217 |
| `workingHours` | Array | — | — | — | Weekly schedule |
| `workingHours[].day` | Number | — | — | — | 0=Sunday, 6=Saturday |
| `workingHours[].startTime` | String | — | — | — | "HH:mm" format |
| `workingHours[].endTime` | String | — | — | — | "HH:mm" format |
| `workingHours[].isOpen` | Boolean | — | — | `true` | Is clinic open this day |
| `servicesOffered` | ObjectId[] | — | — | — | Catalog item references |
| `termsAndConditions` | String | — | — | — | T&C text |
| `reportHeader.logo` | String | — | — | — | Report logo URL |
| `reportHeader.clinicName` | String | — | — | — | Name on reports |
| `reportHeader.address` | String | — | — | — | Address on reports |
| `reportHeader.phone` | String | — | — | — | Phone on reports |
| `reportHeader.email` | String | — | — | — | Email on reports |
| `recordVisibilityMode` | String (enum) | — | — | `OPEN` | `OPEN`, `RESTRICTED` |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `INACTIVE` |
| `organizationId` | ObjectId | ✅ | ✅ | — | Parent organization |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ organizationId: 1, name: 1 }`

---

### Collection: `staffavailabilities`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | ✅ | — | Staff member |
| `clinicId` | ObjectId | ✅ | ✅ | — | Clinic |
| `organizationId` | ObjectId | ✅ | — | — | Organization |
| `schedule` | Array | — | — | — | Weekly availability |
| `schedule[].day` | Number | — | — | — | 0=Sunday, 6=Saturday |
| `schedule[].startTime` | String | — | — | — | "HH:mm" |
| `schedule[].endTime` | String | — | — | — | "HH:mm" |
| `schedule[].available` | Boolean | — | — | `true` | Available this day |
| `updatedAt` | Date | — | — | `Date.now` | — |

**Indexes:**
- `{ staffId: 1, clinicId: 1 }` — **unique**

---

## Module 3: Patients

### Collection: `patients`

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
| `globalPatientId` | String | — | ✅ | — | Cross-org patient identity (UUID) |
| `convertedFromLeadId` | ObjectId | — | — | — | Lead that was converted |
| `isErased` | Boolean | — | — | `false` | GDPR erasure flag |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ clinicId: 1, email: 1 }` — **unique**
- `{ clinicId: 1, phone: 1 }` — **unique** (partial: phone not null)
- `{ clinicId: 1, firstName: 'text', lastName: 'text' }` — text search

---

### Collection: `medicaldocuments`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `patientId` | ObjectId | ✅ | ✅ | — | Owner patient |
| `fileName` | String | ✅ | — | — | Original file name |
| `filePath` | String | ✅ | — | — | GCS storage path |
| `mimeType` | String | ✅ | — | — | File MIME type |
| `fileSize` | Number | — | — | — | Size in bytes |
| `type` | String | — | — | — | Document category |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `uploadedBy` | ObjectId | ✅ | — | — | Staff who uploaded |
| `createdAt` | Date | — | — | `Date.now` | — |

---

## Module 4: Sessions

### Collection: `sessions`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `patientId` | ObjectId | ✅ | ✅ | — | Patient this session belongs to |
| `sessionType` | String (enum) | ✅ | — | — | `HAIR_ANALYSIS`, `SELFIE_ANALYSIS` |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `SAVED`, `COMPLETED` |
| `doctorId` | ObjectId | ✅ | — | — | Doctor who created |
| `assignedTo` | ObjectId | ✅ | ✅ | — | Currently assigned staff |
| `observations` | String | — | — | — | Doctor's notes |
| `images` | Array | — | — | — | Session images |
| `images[].filePath` | String | ✅ | — | — | GCS path |
| `images[].region` | String | — | — | — | Body region |
| `images[].caption` | String | — | — | — | Image caption |
| `images[].uploadedAt` | Date | — | — | `Date.now` | — |
| `aiAnalysis.status` | String (enum) | — | — | — | `PENDING`, `COMPLETED`, `FAILED` |
| `aiAnalysis.findings` | String[] | — | — | — | AI findings list |
| `aiAnalysis.severity` | String | — | — | — | Severity level |
| `aiAnalysis.confidence` | Number | — | — | — | Confidence score (0-1) |
| `aiAnalysis.completedAt` | Date | — | — | — | When AI finished |
| `aiAnalysis.failedAt` | Date | — | — | — | When AI failed |
| `aiAnalysis.failureReason` | String | — | — | — | Failure description |
| `reportUrl` | String | — | — | — | Generated report URL |
| `savedAt` | Date | — | — | — | When moved to SAVED |
| `completedAt` | Date | — | — | — | When completed |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ patientId: 1, sessionType: 1, status: 1 }` — one DRAFT per type check
- `{ clinicId: 1, status: 1 }`

---

### Collection: `treatmentplans`

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
| `nextReviewDate` | Date | — | — | — | Next review appointment |
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
| `organizationId` | ObjectId | ✅ | — | — | — |
| `clinicId` | ObjectId | ✅ | — | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

---

### Collection: `prescriptions`

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
| `organizationId` | ObjectId | ✅ | — | — | — |
| `clinicId` | ObjectId | ✅ | — | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

---

## Module 5: Leads

### Collection: `leads`

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
| `convertedToPatientId` | ObjectId | — | — | — | Patient created from this lead |
| `convertedAt` | Date | — | — | — | Conversion timestamp |
| `selfieAnalysisData` | Mixed | — | — | — | Selfie analysis payload |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ clinicId: 1, assignedTo: 1, status: 1 }`
- `{ clinicId: 1, email: 1 }`

---

## Module 6: Appointments

### Collection: `appointments`

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
| `rescheduledFrom` | ObjectId | — | — | — | Original appointment (if rescheduled) |
| `notes` | String | — | — | — | Appointment notes |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ clinicId: 1, slotStart: 1, slotEnd: 1 }` — slot availability
- `{ clinicId: 1, assignedTo: 1, slotStart: 1 }` — staff schedule
- `{ leadId: 1, status: 1 }` — lead appointment lookup

---

## Module 7: Catalog

### Collection: `catalogitems`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | text | — | Item name |
| `description` | String | — | — | — | Item description |
| `type` | String (enum) | ✅ | ✅ | — | `SERVICE`, `MEDICATION`, `COSMETIC`, `SUPPLEMENT` |
| `price` | Number | ✅ | — | — | Unit price |
| `currency` | String | ✅ | — | — | ISO 4217 (inherited from clinic) |
| `durationMinutes` | Number | — | — | — | For SERVICE type only |
| `dosageOptions` | String[] | — | — | — | Available dosages |
| `frequencyOptions` | String[] | — | — | — | Available frequencies |
| `durationOptions` | String[] | — | — | — | Available durations |
| `timeSlotOptions` | String[] | — | — | — | e.g., "morning", "evening" |
| `instructions` | String | — | — | — | Default instructions |
| `qualifiedStaff` | ObjectId[] | — | — | — | Staff qualified to provide this |
| `isActive` | Boolean | — | — | `true` | Soft delete flag |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ clinicId: 1, type: 1, isActive: 1 }`
- `{ clinicId: 1, name: 'text' }`

---

### Collection: `treatmentkits`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `name` | String | ✅ | — | — | Kit name |
| `description` | String | — | — | — | Kit description |
| `items` | Array | — | — | — | Kit items with routines |
| `items[].catalogItemId` | ObjectId | ✅ | — | — | Catalog item reference |
| `items[].dosage` | String | — | — | — | Default dosage for this kit |
| `items[].frequency` | String | — | — | — | Default frequency |
| `items[].duration` | String | — | — | — | Default duration |
| `items[].timeSlots` | String[] | — | — | — | Default time slots |
| `items[].instructions` | String | — | — | — | Default instructions |
| `totalPrice` | Number | — | — | — | Sum of item prices |
| `discountedPrice` | Number | — | — | — | Kit discount price |
| `isActive` | Boolean | — | — | `true` | Soft delete flag |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ clinicId: 1, isActive: 1 }`

---

## Module 8: Billing

### Collection: `invoices`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `invoiceNumber` | String | ✅ | ✅ (unique compound) | — | Sequential: `INV-000001` |
| `patientId` | ObjectId | ✅ | ✅ | — | Billed patient |
| `sessionId` | ObjectId | — | ✅ | — | Linked session |
| `status` | String (enum) | — | — | `DRAFT` | `DRAFT`, `FINALIZED`, `PARTIALLY_PAID`, `PAID`, `VOID` |
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
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | ✅ | ✅ | — | — |
| `createdAt` | Date | — | — | `Date.now` | — |
| `updatedAt` | Date | — | — | `Date.now` | — |
| `createdBy` | ObjectId | — | — | — | — |

**Indexes:**
- `{ clinicId: 1, patientId: 1, status: 1 }`
- `{ clinicId: 1, invoiceNumber: 1 }` — **unique**

---

### Collection: `payments`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `invoiceId` | ObjectId | ✅ | ✅ | — | Parent invoice |
| `amount` | Number | ✅ | — | — | Payment amount |
| `method` | String (enum) | ✅ | — | — | `CASH`, `CARD`, `BANK_TRANSFER`, `OTHER` |
| `reference` | String | — | — | — | Transaction reference |
| `paidAt` | Date | — | — | `Date.now` | Payment timestamp |
| `organizationId` | ObjectId | ✅ | — | — | — |
| `clinicId` | ObjectId | ✅ | — | — | — |
| `recordedBy` | ObjectId | ✅ | — | — | Staff who recorded |
| `createdAt` | Date | — | — | `Date.now` | — |

---

## Module 9: Audit

### Collection: `auditlogs`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `action` | String | ✅ | ✅ | — | Audit action (e.g., `PATIENT_CREATED`) |
| `entityId` | String | — | ✅ | — | Affected entity ID |
| `entityType` | String | — | ✅ | — | Entity type (Patient, Session, etc.) |
| `staffId` | ObjectId | ✅ | ✅ | — | Actor staff ID |
| `staffName` | String | ✅ | — | — | Immutable name snapshot |
| `organizationId` | ObjectId | ✅ | ✅ | — | — |
| `clinicId` | ObjectId | — | ✅ | — | null for org-level actions |
| `metadata` | Mixed | — | — | — | Action-specific data (before/after) |
| `ipAddress` | String | — | — | — | Request IP |
| `userAgent` | String | — | — | — | Request user agent |
| `timestamp` | Date | — | ✅ | `Date.now` | When action occurred |

**Indexes:**
- `{ organizationId: 1, timestamp: -1 }` — primary query
- `{ organizationId: 1, action: 1, timestamp: -1 }` — filter by action
- `{ entityId: 1, entityType: 1, timestamp: -1 }` — entity history
- `{ staffId: 1, timestamp: -1 }` — staff activity

**Rules:**
- Append-only (no update/delete operations)
- `staffName` is a snapshot — never updated even if staff name changes
- No TTL — retained indefinitely

---

## Infrastructure Collections

### Collection: `authsessions`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `staffId` | ObjectId | ✅ | ✅ | — | Session owner |
| `status` | String (enum) | — | — | `ACTIVE` | `ACTIVE`, `REVOKED` |
| `refreshTokenHash` | String | — | — | — | Hashed refresh token |
| `userAgent` | String | — | — | — | Browser/device info |
| `ipAddress` | String | — | — | — | Login IP |
| `lastActivityAt` | Date | — | — | `Date.now` | Last token refresh |
| `revokedAt` | Date | — | — | — | When revoked |
| `revokedReason` | String (enum) | — | — | — | `LOGOUT`, `DEACTIVATION`, `PASSWORD_CHANGE` |
| `createdAt` | Date | — | — | `Date.now` | — |

**Indexes:**
- `{ staffId: 1, status: 1 }`

---

### Collection: `outboxevents`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `eventType` | String | ✅ | — | — | Event name |
| `aggregateId` | String | ✅ | — | — | Source entity ID |
| `aggregateType` | String | ✅ | — | — | Source entity type |
| `payload` | Mixed | ✅ | — | — | Event data |
| `status` | String (enum) | — | ✅ | `PENDING` | `PENDING`, `DISPATCHED`, `FAILED` |
| `dispatchedAt` | Date | — | — | — | When dispatched |
| `failedAt` | Date | — | — | — | When failed |
| `retryCount` | Number | — | — | `0` | Retry attempts |
| `createdAt` | Date | — | ✅ | `Date.now` | — |

**Indexes:**
- `{ status: 1, createdAt: 1 }` — dispatcher polling

---

### Collection: `idempotencykeys`

| Field | Type | Required | Indexed | Default | Description |
|-------|------|----------|---------|---------|-------------|
| `key` | String | ✅ | ✅ (unique) | — | Idempotency key |
| `processedAt` | Date | — | — | `Date.now` | When processed |
| `expiresAt` | Date | — | ✅ (TTL) | — | Auto-cleanup (24h) |

**Indexes:**
- `{ key: 1 }` — **unique**
- `{ expiresAt: 1 }` — TTL index

---

## Summary: All Collections

| # | Collection | Module | Documents |
|---|-----------|--------|-----------|
| 1 | `staff` | IAM | Staff members |
| 2 | `roles` | IAM | Permission roles |
| 3 | `invitetokens` | IAM | Invite tokens |
| 4 | `organizations` | Organization | Organizations |
| 5 | `clinics` | Organization | Clinics |
| 6 | `staffavailabilities` | Organization | Staff schedules |
| 7 | `patients` | Patients | Patient records |
| 8 | `medicaldocuments` | Patients | Uploaded documents |
| 9 | `sessions` | Sessions | Trichoscopy sessions |
| 10 | `treatmentplans` | Sessions | Treatment plans |
| 11 | `prescriptions` | Sessions | Prescriptions |
| 12 | `leads` | Leads | Lead records |
| 13 | `appointments` | Appointments | Appointments |
| 14 | `catalogitems` | Catalog | Services/products |
| 15 | `treatmentkits` | Catalog | Treatment kits |
| 16 | `invoices` | Billing | Invoices |
| 17 | `payments` | Billing | Payment records |
| 18 | `auditlogs` | Audit | Audit trail |
| 19 | `authsessions` | Auth | Login sessions |
| 20 | `outboxevents` | Infrastructure | Event outbox |
| 21 | `idempotencykeys` | Infrastructure | Dedup keys |
