# Error Codes

> Canonical error code registry. All GraphQL error responses must use a code from this list in the `extensions.code` field.

---

## Format

```json
{
  "errors": [{
    "message": "Human-readable description",
    "extensions": {
      "code": "ERROR_CODE",
      "field": "fieldName",
      "traceId": "uuid"
    }
  }]
}
```

- `code` — always present
- `field` — present only for validation errors targeting a specific field
- `traceId` — always present for server errors; optional for client errors

---

## Authentication & Authorization

| Code | HTTP Equivalent | Description |
|------|----------------|-------------|
| `UNAUTHENTICATED` | 401 | No valid token provided or token expired |
| `FORBIDDEN` | 403 | Valid token but insufficient permissions |
| `INVALID_CREDENTIALS` | 401 | Email or password is incorrect |
| `ACCOUNT_DEACTIVATED` | 403 | Staff account is inactive |
| `PLAN_LIMIT_EXCEEDED` | 403 | Feature not available on current subscription plan |
| `ORG_SCOPE_VIOLATION` | 403 | Organization_Admin attempted to access a clinical module |
| `CROSS_ORG_ACCESS_DENIED` | 403 | Request targets data outside the user's Organization |

---

## Invite & Registration

| Code | Description |
|------|-------------|
| `INVITE_NOT_FOUND` | Invite token does not exist |
| `INVITE_EXPIRED` | Invite token has passed its 7-day expiry |
| `INVITE_ALREADY_USED` | Invite token has already been used (password was set) |
| `INVITE_REVOKED` | Invite token was invalidated by a resend |
| `INVITE_CANCELLED` | Invite was cancelled by an Admin |
| `EMAIL_ALREADY_EXISTS` | Email address already has an Active or Inactive Staff record in this Clinic |
| `EMAIL_ALREADY_INVITED` | Email address already has a Pending_Registration Staff record in this Clinic |

---

## Validation

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | One or more input fields failed validation (use `field` extension) |
| `INVALID_TIMEZONE` | Timezone identifier is not a valid IANA timezone |
| `INVALID_DATE_FORMAT` | Date/time value is not valid ISO 8601 UTC |
| `FILE_TOO_LARGE` | Uploaded file exceeds the 10MB limit |
| `INVALID_FILE_TYPE` | Uploaded file type is not accepted (must be JPEG, PNG, or PDF) |

---

## Staff & Identity

| Code | Description |
|------|-------------|
| `LAST_CLINIC_ADMIN` | Operation would leave a Clinic with no active Clinic_Admin |
| `LAST_ORG_ADMIN` | Operation would leave an Organization with no active Organization_Admin |
| `LAST_ACTIVE_CLINIC` | Operation would leave an Organization with no active Clinic |
| `RECIPIENT_REQUIRED` | Staff deletion requires at least one data reassignment recipient |
| `RECIPIENT_INACTIVE` | Selected recipient is inactive |
| `TRANSFER_FAILED` | Reassignment failed mid-operation; full rollback applied |
| `ROLE_NOT_EDITABLE` | Attempted to edit a fixed system role (e.g., Organization_Admin) |
| `ROLE_NOT_DELETABLE` | Attempted to delete a system role (Organization_Admin or Clinic_Admin) |
| `CROSS_ORG_TRANSFER_DENIED` | Inter-clinic transfer attempted across different Organizations |

---

## Patient

| Code | Description |
|------|-------------|
| `PATIENT_NOT_FOUND` | Patient record does not exist or is outside scope |
| `DUPLICATE_PATIENT_EMAIL` | A Patient with this email already exists in this Clinic |
| `DUPLICATE_PATIENT_PHONE` | A Patient with this phone already exists in this Clinic |
| `PATIENT_DELETE_NOT_ALLOWED` | Patients cannot be deleted; use GDPR erasure |

---

## Session

| Code | Description |
|------|-------------|
| `SESSION_NOT_FOUND` | Session does not exist or is outside scope |
| `ACTIVE_SESSION_EXISTS` | Patient already has an active (Draft or Saved) Session |
| `SESSION_NOT_DELETABLE` | Session is in Saved or Completed status and cannot be deleted |
| `SESSION_SAVE_VALIDATION` | Session does not meet save requirements (missing images, etc.) |
| `TRICHOSCOPY_COUNT_INVALID` | Session does not have exactly 6 Trichoscopy_Images |
| `FRONTAL_IMAGE_REQUIRED` | Session must have at least one Frontal Global_Image |
| `SESSION_LOCKED` | Session is Saved or Completed; image capture is not allowed |

---

## Lead

| Code | Description |
|------|-------------|
| `LEAD_NOT_FOUND` | Lead does not exist or is outside scope |
| `LEAD_ALREADY_CONVERTED` | Lead has already been converted to a Patient |
| `CONVERSION_DUPLICATE_EMAIL` | A Patient with this email already exists; conversion blocked |
| `CONVERSION_DUPLICATE_PHONE` | A Patient with this phone already exists; conversion blocked |
| `INVALID_STATUS_TRANSITION` | Attempted lead status change is not permitted |

---

## Appointment

| Code | Description |
|------|-------------|
| `APPOINTMENT_NOT_FOUND` | Appointment does not exist or is outside scope |
| `SLOT_NOT_AVAILABLE` | Selected appointment slot is already occupied |
| `SLOT_OUTSIDE_WORKING_HOURS` | Selected slot is outside the Clinic's configured working hours |
| `INVALID_APPOINTMENT_STATUS_TRANSITION` | Attempted status transition is not in the valid set |
| `APPOINTMENT_NOT_CANCELLABLE` | Appointment is in Completed or No_Show status |
| `CLINIC_TIMEZONE_NOT_SET` | Clinic timezone must be configured before appointments can be booked or displayed |
| `SERVICE_NO_QUALIFIED_STAFF` | Service has no qualified staff configured; cannot be booked until at least one qualified staff member is assigned |

---

## Invoice

| Code | Description |
|------|-------------|
| `INVOICE_NOT_FOUND` | Invoice does not exist or is outside scope |
| `INVOICE_ALREADY_FINALIZED` | Invoice is Finalized and cannot be edited |
| `INVOICE_CHARGE_VALIDATION` | Misc charge is missing description or amount |

---

## Webhook

| Code | Description |
|------|-------------|
| `WEBHOOK_INVALID_API_KEY` | Webhook request has an invalid or missing API key |
| `WEBHOOK_MAPPING_ERROR` | Payload is missing a required mapped field |
| `WEBHOOK_PAYLOAD_INVALID` | Payload cannot be parsed |

---

## System

| Code | Description |
|------|-------------|
| `INTERNAL_ERROR` | Unexpected server error (use `traceId` for debugging) |
| `SERVICE_UNAVAILABLE` | Downstream service (AI, PDF, email) is temporarily unavailable |
| `ASYNC_OPERATION_FAILED` | Async operation failed after maximum retries |
| `CONFIRMATION_REQUIRED` | Destructive operation requires explicit confirmation flag |
| `NOT_FOUND` | Generic not found (use specific codes where available) |
| `RATE_LIMITED` | Request rate limit exceeded |
