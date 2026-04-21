# API Contracts

> Defines the GraphQL API surface, operation naming conventions, pagination, subscriptions, file upload contracts, and webhook ingestion contracts.

---

## 1. API Technology

All platform API operations use **GraphQL** unless explicitly noted below.

| Operation | Protocol | Reason |
|-----------|----------|--------|
| All queries, mutations, subscriptions | GraphQL over HTTP/WebSocket | Primary API |
| File uploads (images, PDFs) | HTTP multipart (`multipart/form-data`) | GraphQL does not natively support binary uploads |
| Webhook lead ingestion | HTTP POST (`application/json`) | External campaign systems use standard HTTP |

---

## 2. GraphQL Operation Naming

| Type | Convention | Example |
|------|-----------|---------|
| Query | `camelCase` noun or noun phrase | `patient`, `sessionList`, `invoiceSummary` |
| Mutation | `camelCase` verb + noun | `createPatient`, `saveSession`, `finalizeInvoice` |
| Subscription | `camelCase` past-tense event | `aiAnalysisCompleted`, `appointmentStatusChanged`, `reportGenerated` |

---

## 3. Pagination

All list queries that may return more than 20 records MUST support cursor-based pagination following the **Relay Connection Specification**.

```graphql
type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type XxxConnection {
  edges: [XxxEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type XxxEdge {
  node: Xxx!
  cursor: String!
}
```

Arguments: `first: Int`, `after: String`, `last: Int`, `before: String`.

Default page size: 20. Maximum page size: 100.

---

## 4. Error Format

All GraphQL errors use this structure:

```json
{
  "errors": [{
    "message": "Human-readable description",
    "extensions": {
      "code": "ERROR_CODE",
      "field": "fieldName",
      "traceId": "uuid-v4"
    }
  }]
}
```

- `code` — always present; see `shared/error-codes.md`
- `field` — present only for field-level validation errors
- `traceId` — always present; used for server-side log correlation

Multiple validation errors on the same mutation are returned together in the `errors` array.

---

## 5. Authentication Header

All authenticated GraphQL requests must include:

```
Authorization: Bearer <jwt>
```

Web component requests must include:

```
X-API-Key: <clinic-api-key>
```

---

## 6. Schema Versioning Header

Every GraphQL response includes:

```
X-Schema-Version: 1.0.0
```

---

## 7. GraphQL Subscriptions

Subscriptions are delivered over WebSocket using the `graphql-ws` protocol.

| Subscription | Trigger | Subscriber |
|-------------|---------|------------|
| `aiAnalysisCompleted` | AI analysis finishes for a Session | Staff who saved the Session |
| `aiAnalysisFailed` | AI analysis fails after retries | Staff who saved the Session |
| `reportGenerated` | PDF report is ready | Staff in the Clinic |
| `appointmentStatusChanged` | Appointment status transitions | Staff in the Clinic |
| `sessionStatusChanged` | Session status transitions | Staff in the Clinic |

All subscriptions are scoped to the authenticated user's Clinic. Cross-clinic subscriptions are not permitted.

---

## 8. File Upload Contract

### Endpoint
```
POST /upload
Content-Type: multipart/form-data
Authorization: Bearer <jwt>
```

### Request Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | Binary | Yes | File content |
| `type` | String | Yes | `GLOBAL_IMAGE`, `TRICHOSCOPY_IMAGE`, `MEDICAL_DOCUMENT`, `CLINIC_LOGO`, `PRODUCT_IMAGE`, `SERVICE_IMAGE` |
| `clinicId` | UUID | Yes | Target Clinic |
| `associatedId` | UUID | Conditional | Session ID (for images), Patient ID (for documents) |

### Constraints

| Constraint | Value |
|------------|-------|
| Max file size | 10 MB |
| Accepted types for images | `image/jpeg`, `image/png` |
| Accepted types for documents | `image/jpeg`, `image/png`, `application/pdf` |

### Response

```json
{
  "fileId": "uuid",
  "url": "https://...",
  "type": "GLOBAL_IMAGE",
  "sizeBytes": 1048576,
  "uploadedAt": "2025-04-21T10:30:00Z"
}
```

### Failure Cases

| Condition | HTTP Status | Error |
|-----------|-------------|-------|
| File exceeds 10MB | 400 | `FILE_TOO_LARGE` |
| Invalid file type | 400 | `INVALID_FILE_TYPE` |
| Missing `type` field | 400 | `VALIDATION_ERROR` |
| Unauthenticated | 401 | `UNAUTHENTICATED` |

---

## 9. Webhook Ingestion Contract

### Endpoint
```
POST /webhooks/leads/{sourceId}
Content-Type: application/json
X-API-Key: <clinic-api-key>
```

### Behaviour

1. The platform looks up the `Webhook_Source` by `sourceId` and validates the API key.
2. The payload is parsed using the configured `Field_Mapping` for that source.
3. A Lead record is created with `source = WEBHOOK` and `leadSource = campaignId` from the mapped field.
4. A `LeadCreated` domain event is emitted.

### Response

```json
{ "leadId": "uuid", "status": "CREATED" }
```

### Failure Cases

| Condition | HTTP Status | Error Code |
|-----------|-------------|------------|
| Invalid API key | 401 | `WEBHOOK_INVALID_API_KEY` |
| Missing required mapped field | 422 | `WEBHOOK_MAPPING_ERROR` |
| Malformed JSON | 400 | `WEBHOOK_PAYLOAD_INVALID` |
| Source not found | 404 | `NOT_FOUND` |

---

## 10. Rate Limiting

| Scope | Limit |
|-------|-------|
| Authenticated GraphQL requests | 1000 requests / minute per Staff member |
| File uploads | 60 uploads / minute per Clinic |
| Webhook ingestion | 500 requests / minute per Webhook_Source |
| Web component API key requests | 200 requests / minute per API key |

Rate limit exceeded responses return HTTP 429 with error code `RATE_LIMITED`.

---

## 11. Async Operation Polling

For long-running operations (AI analysis, PDF generation), the platform uses a combination of:

1. **Subscriptions** — preferred; client subscribes to completion events.
2. **Polling query** — fallback; client queries `asyncOperationStatus(operationId: uuid)`.

```graphql
type AsyncOperation {
  id: ID!
  status: AsyncStatus!
  result: JSON
  error: String
  createdAt: DateTime!
  completedAt: DateTime
}
```

Async operations are retained for 24 hours after completion.
