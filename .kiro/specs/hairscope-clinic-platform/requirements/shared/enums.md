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
  VIDEO_AD
  WEBSITE
  SELFIE_ANALYSIS
  REFERRAL
  SOCIAL_MEDIA
  WALK_IN
  OTHER

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
  ACTIVE         # Booked / Scheduled
  PROGRESS       # In Progress
  COMPLETED
  CANCEL         # Cancelled
  DELETED

AppointmentType
  CLINIC
  VIRTUAL
```

Valid status transitions:
- `ACTIVE → PROGRESS`
- `ACTIVE → COMPLETED`
- `ACTIVE → CANCEL`
- `PROGRESS → COMPLETED`
- `PROGRESS → CANCEL`

---

## Invoice

```
InvoiceStatus
  DRAFT
  FINALIZED
```

Valid status transitions:
- `DRAFT → FINALIZED`

---

## Product

```
ProductType
  COSMETIC    # No prescription required
  MEDICAL     # Prescription required
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

---

## Reminder

```
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
  DOCTOR
```

---

## Notification

```
NotificationChannel
  IN_APP
  PUSH
  EMAIL
  WHATSAPP

NotificationEvent
  AI_ANALYSIS_COMPLETED
  AI_ANALYSIS_FAILED
  REPORT_GENERATED
  APPOINTMENT_BOOKED
  APPOINTMENT_RESCHEDULED
  APPOINTMENT_CANCELLED
  INVITE_SENT
  STAFF_TRANSFERRED
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

  # Roles & Permissions
  ROLE_CREATED
  ROLE_UPDATED
  ROLE_DELETED
  PERMISSION_UPDATED

  # Organization & Clinic
  ORGANIZATION_CREATED
  CLINIC_CREATED
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

  # Leads
  LEAD_CREATED
  LEAD_UPDATED
  LEAD_CONVERTED
  LEAD_DELETED

  # Appointments
  APPOINTMENT_CREATED
  APPOINTMENT_RESCHEDULED
  APPOINTMENT_CANCELLED
  APPOINTMENT_STATUS_CHANGED

  # Products
  PRODUCT_CREATED
  PRODUCT_UPDATED
  PRODUCT_DELETED

  # Billing
  INVOICE_GENERATED
  INVOICE_CHARGE_ADDED
  INVOICE_CHARGE_EDITED
  INVOICE_CHARGE_REMOVED
  INVOICE_FINALIZED

  # Reports
  REPORT_GENERATED
  REPORT_REGENERATED
  REPORT_SHARED

  # Auth
  LOGIN_SUCCESS
  LOGIN_FAILURE
  LOGOUT

  # Plan
  PLAN_UPDATED

AuditResourceType
  STAFF
  ROLE
  PERMISSION
  ORGANIZATION
  CLINIC
  CLINIC_PROFILE
  PATIENT
  SESSION
  TRICHOSCOPY_IMAGE
  MEDICAL_DOCUMENT
  LEAD
  APPOINTMENT
  PRODUCT
  INVOICE
  REPORT
  AUTH
  PLAN
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
