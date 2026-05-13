# Enums

> Canonical enum definitions used across all modules. These are the authoritative values derived from the platform's backend and frontend constants. All code, schemas, and documentation must reference this file.

---

## Staff & Identity

```
StaffStatus
  ACTIVE
  INACTIVE
  PENDING_REGISTRATION   # Invite sent by Admin, password not yet set by invitee

InviteStatus
  PENDING
  USED
  EXPIRED
  REVOKED
  CANCELLED

UserRole
  USER
  PATIENT
  DOCTOR
  ADMIN
  SYSTEM
```

---

## Session

```
SessionStatus
  DRAFT          # In progress, not yet saved. Excluded from progress tracking.
  SAVED          # Images locked, submitted for AI analysis. Excluded from progress tracking.
  COMPLETED      # AI analysis done, report generated. Contributes to progress tracking.
  DELETED        # Permanently removed (only from DRAFT)

SessionType
  # Current session types
  HAIR_ANALYSIS     # Trichoscopy + global image hair analysis (current implementation)

  # Future session types (not yet implemented)
  # SKIN_TREATMENT
  # HAIR_REMOVAL
  # GENERAL_CONSULTATION
```

---

## Lead

```
LeadStatus
  NEW
  CONTACTED
  QUALIFIED
  CONVERTED
  LOST

LeadSource
  MANUAL
  WEBHOOK
  SELFIE_ANALYSIS

LeadPriority
  LOW
  MEDIUM
  HIGH
  URGENT

LeadAssignmentMode
  AUTO_ASSIGN    # Default - leads auto-assigned to clinic from source
  MANUAL_ASSIGN  # Org Admin reviews and confirms clinic assignment
```

---

## Appointment

```
AppointmentStatus
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
  DELETED

AppointmentType
  CLINIC
  VIRTUAL
```

Valid status transitions:
- `SCHEDULED → CONFIRMED`
- `SCHEDULED → CANCELLED`
- `SCHEDULED → NO_SHOW`
- `CONFIRMED → COMPLETED`
- `CONFIRMED → CANCELLED`
- `CONFIRMED → NO_SHOW`

---

## Invoice

```
InvoiceStatus
  DRAFT
  FINALIZED
  REFUNDED
  PARTIALLY_REFUNDED
```

Valid status transitions:
- `DRAFT → FINALIZED`
- `FINALIZED → REFUNDED`
- `FINALIZED → PARTIALLY_REFUNDED`
- `PARTIALLY_REFUNDED → REFUNDED`

---

## Catalog

```
CatalogItemType
  SERVICE       # Bookable as appointment, has duration and qualifiedStaff
  MEDICATION    # Prescription required, routine mandatory
  COSMETIC      # No prescription required
  SUPPLEMENT    # No prescription required
```

---

## Image

```
GlobalImagePosition
  # From HEAD_IMAGES_OBJ in frontend constants
  ANTERIOR
  FRONTAL          # Mandatory - at least one required per session
  RIGHT_LATERAL
  LEFT_LATERAL
  POSTERIOR
  LEFT_TEMPORAL
  RIGHT_TEMPORAL
  SUPERIOR
  TOP_OF_THE_HEAD
  VERTEX

HeadRegion
  # From REGION_IMAGES_OBJ - used for trichoscopy position marking
  TOP
  BACK
  RIGHT
  LEFT

ImageDataType
  TRICHOSCOPY
  GLOBAL

AnnotationSource
  AI
  HUMAN
```

---

## Questionnaire

```
QuestionnaireCategory
  # From QUESTION_TYPES in backend/frontend constants
  DAILY_HABITS
  GENETICS
  HORMONAL_CHANGES
  MEDICAL_CONDITIONS
  PHYSICAL_OR_EMOTIONAL_SHOCK
  HAIRSTYLING_AND_TREATMENTS
  STRESS_TEST          # Separate category for stress-o-meter calculation
```

---

## AI Analysis

```
AIAnalysisType
  GLOBAL_IMAGE_ANALYSIS
  PUBLIC_API_ANALYSIS
  HAIR_ANALYSIS
  TRICHOSCOPY_ANALYSIS

AIModelType
  OPEN_AI
  GLOBAL_IMAGE_ANALYSIS_MODEL
  HAIR_DISEASE_MODEL
  HAIR_ROOT_MODEL
  HAIR_STRAND_MODEL
  HAIR_COVERAGE_MODEL
  TRICHO_COVERAGE_MODEL
  HEATMAP_MODEL
  HAIR_AGE_MODEL
  PUBLIC_IMAGE_ANALYSIS
  SKIN_DISEASE_V1
  SKIN_ISSUES
  HAIRFALL_STAGE_MODEL
  GEMINI
```

---

## Hairfall Scale

```
HairfallScale
  NORWOOD    # Male
  LUDWIG     # Female
```

---

## Gender

```
Gender
  MALE
  FEMALE
  OTHER
```

---

## Locale / Language

```
Locale
  EN    # English
  ES    # Spanish
  IT    # Italian
  NL    # Dutch
  FR    # French
  RU    # Russian
  AR    # Arabic
  DE    # German
```

> Extensible — new locales can be added by providing translation files.

---

## Currency Enforcement

```
CurrencyEnforcementPolicy
  ENFORCE_SINGLE_CURRENCY    # All clinics must use the Organization's currency
  ALLOW_CLINIC_CURRENCY      # Each clinic may select its own currency
```

---

## Record Visibility

```
RecordVisibilityMode
  OPEN          # All staff with module permission see all records in their Clinic
  RESTRICTED    # Staff only see records assigned to them; ClinicAdmins see all
```

---

## Reminder

```
ReminderStatus
  SCHEDULED
  DUE
  FIRED
  MISSED
  CANCELLED
  PAUSED

RecurrencePattern
  ONCE
  RECURRING

RecurrenceInterval
  DAILY
  WEEKLY
  MONTHLY
  CUSTOM            # Custom interval defined in minutes/hours/days

ReminderTriggerType
  APPOINTMENT
  SESSION

ReminderType
  EMAIL
  SMS
  PUSH
  WHATSAPP
  ALL

ReminderTimeUnit
  MINUTES
  HOURS
  DAYS
  WEEKS

ReminderRecipientType
  PATIENT
  STAFF
  BOTH
```

---

## Notification

```
NotificationChannel
  EMAIL
  WHATSAPP
  SMS
  PUSH
  IN_APP
  WEBHOOK

NotificationType
  TRANSACTIONAL      # Cannot be unsubscribed (password reset, security alerts)
  OPERATIONAL        # System alerts (AI analysis complete, report ready)
  APPOINTMENT        # Booking confirmations, reminders
  CLINICAL           # Session/report notifications
  MARKETING          # Promotional (requires consent)

NotificationPriority
  URGENT             # Bypasses quiet hours and rate limits
  HIGH               # Bypasses quiet hours
  NORMAL             # Subject to quiet hours and rate limits
  LOW                # Subject to quiet hours, rate limits, no fallback

NotificationEvent
  AI_ANALYSIS_COMPLETED
  AI_ANALYSIS_FAILED
  REPORT_GENERATED
  APPOINTMENT_BOOKED
  APPOINTMENT_RESCHEDULED
  APPOINTMENT_CANCELLED
  INVITE_SENT
  STAFF_TRANSFERRED

DeliveryStatus
  PENDING
  QUEUED
  SENT
  DELIVERED
  FAILED
  BOUNCED
  UNSUBSCRIBED
```

---

## Audit

```
AuditAction
  # Staff
  STAFF_CREATED
  STAFF_UPDATED
  STAFF_DEACTIVATED
  STAFF_REACTIVATED
  STAFF_DELETED
  STAFF_TRANSFERRED
  DATA_TRANSFER_COMPLETED
  INVITE_SENT
  INVITE_USED
  INVITE_EXPIRED
  INVITE_CANCELLED

  # Roles & Permissions
  ROLE_CREATED
  ROLE_UPDATED
  ROLE_DELETED
  PERMISSION_UPDATED

  # Organization & Clinic
  ORGANIZATION_CREATED
  ORGANIZATION_UPDATED
  CLINIC_CREATED
  CLINIC_UPDATED
  CLINIC_DEACTIVATED
  CLINIC_REACTIVATED
  CLINIC_PROFILE_UPDATED

  # Patient
  PATIENT_CREATED
  PATIENT_UPDATED
  PATIENT_GDPR_ERASED

  # Session
  SESSION_CREATED
  SESSION_SAVED
  SESSION_COMPLETED
  SESSION_DELETED
  ANNOTATION_EDIT_SAVED

  # Documents
  MEDICAL_DOCUMENT_UPLOADED
  MEDICAL_DOCUMENT_DELETED
  DIGITAL_SIGNATURE_UPLOADED
  DIGITAL_SIGNATURE_DELETED

  # Leads
  LEAD_CREATED
  LEAD_UPDATED
  LEAD_CONVERTED

  # Appointments
  APPOINTMENT_CREATED
  APPOINTMENT_RESCHEDULED
  APPOINTMENT_CANCELLED
  APPOINTMENT_STATUS_CHANGED

  # Catalog
  CATALOG_ITEM_CREATED
  CATALOG_ITEM_UPDATED
  CATALOG_ITEM_DELETED
  TREATMENT_KIT_CREATED
  TREATMENT_KIT_UPDATED
  TREATMENT_KIT_DELETED

  # Billing
  INVOICE_GENERATED
  INVOICE_LINE_ITEM_ADDED
  INVOICE_LINE_ITEM_EDITED
  INVOICE_LINE_ITEM_REMOVED
  INVOICE_CHARGE_ADDED
  INVOICE_CHARGE_EDITED
  INVOICE_CHARGE_REMOVED
  INVOICE_FINALIZED
  INVOICE_REFUNDED_FULL
  INVOICE_REFUNDED_PARTIAL

  # Reports & Documents
  CLINICAL_REPORT_GENERATED
  CLINICAL_REPORT_REGENERATED
  CLINICAL_REPORT_SHARED
  CLINICAL_REPORT_DOWNLOADED
  TREATMENT_PLAN_GENERATED
  TREATMENT_PLAN_REGENERATED
  TREATMENT_PLAN_SHARED
  TREATMENT_PLAN_DOWNLOADED
  TREATMENT_PLAN_RECOMMENDATION_EDITED
  PRESCRIPTION_GENERATED
  PRESCRIPTION_REGENERATED
  PRESCRIPTION_SHARED
  PRESCRIPTION_DOWNLOADED
  PRESCRIPTION_RECOMMENDATION_EDITED

  # Auth
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT
  PASSWORD_RESET_REQUESTED
  PASSWORD_RESET_COMPLETED

  # Plan
  PLAN_UPDATED

  # Webhook & Communication
  WEBHOOK_SOURCE_CREATED
  WEBHOOK_SOURCE_UPDATED
  WEBHOOK_SOURCE_DELETED
  COMMUNICATION_TEMPLATE_UPDATED
  COMMUNICATION_RULE_UPDATED
  COMMUNICATION_CONSENT_UPDATED
  COMMUNICATION_BRANDING_UPDATED

  # Import/Export
  IMPORT_INITIATED
  IMPORT_COMPLETED
  EXPORT_INITIATED
  EXPORT_COMPLETED

AuditResourceType
  STAFF
  ROLE
  PERMISSION
  ORGANIZATION
  CLINIC
  PATIENT
  SESSION
  TRICHOSCOPY_IMAGE
  MEDICAL_DOCUMENT
  DIGITAL_SIGNATURE
  LEAD
  APPOINTMENT
  CATALOG_ITEM
  TREATMENT_KIT
  INVOICE
  CLINICAL_REPORT
  TREATMENT_PLAN
  PRESCRIPTION
  AUTH
  PLAN
  WEBHOOK_SOURCE
  COMMUNICATION_POLICY
  IMPORT_EXPORT
```

---

## Async Operation Status

```
AsyncStatus
  PENDING
  PROCESSING
  COMPLETED
  FAILED
```

---

## Plans

```
PlanId
  TRIAL
  WEEKLY
  BASIC           # Sprout (monthly)
  GROWTH          # Bloom (monthly)
  ENTERPRISE      # Flourish (monthly)
  BASIC_YEARLY    # Sprout (yearly)
  GROWTH_YEARLY   # Bloom (yearly)
  ENTERPRISE_YEARLY  # Flourish (yearly)
```

---

## Currency

Supported currency codes (ISO 4217) for service and product pricing:

`USD`, `INR`, `EUR`, `GBP`, `JPY`, `CNY`, `AUD`, `CAD`, `CHF`, `HKD`, `NZD`, `SGD`, `KRW`, `TRY`, `RUB`, `BRL`, `MXN`, `ZAR`, `SEK`, `NOK`, `DKK`, `PLN`, `CZK`, `HUF`, `MYR`, `PHP`, `TWD`, `THB`, `IDR`, `VND`, `AED`, `SAR`

---

## Report

```
ReportDataType
  COMPARE
  ANALYSIS
  QUESTION_SCORE
  STRESS_GRAPH

ReportListItem
  HAIRFALL_STAGE
  DOCTORS_NOTE
  STAGE_DESCRIPTION
```

---

## Service Type

```
ClinicServiceType
  VIRTUAL
  CLINICAL
```

---

## Access Token

```
AccessTokenType
  PUBLIC_API
  PLATFORM

AccessTokenLogType
  STARTED
  SUCCESS
  FAILURE
```
