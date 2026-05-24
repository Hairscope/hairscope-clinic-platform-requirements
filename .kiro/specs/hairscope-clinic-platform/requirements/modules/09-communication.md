# Notification Service

> Covers: Notification intent processing, template rendering, channel selection, delivery scheduling, retry logic, delivery tracking, provider webhook handling, and deduplication.
> Events consumed: `ReminderDue`, `SendNotificationIntent` (explicit command), and any domain event configured as a notification trigger in the Communication Policy Module.
> Events emitted: `NotificationDelivered`, `NotificationFailed`, `NotificationBounced`

> **Architectural note:** The Notification Service is an infrastructure-layer service responsible for notification delivery. It owns delivery state, interacts with external providers, and produces side effects. It is invoked by domain events and explicit commands.

---

## Glossary

- **NotificationIntent**: A structured request to deliver a message to one or more recipients via one or more channels. Contains: recipient, template reference, template variables, channel preferences, priority, and scheduling metadata.
- **NotificationTemplate**: A pre-defined message structure with placeholders for dynamic content. Owned by the Communication Policy Module. The service renders templates but does not define them.
- **Channel**: A delivery medium. Supported channels: `EMAIL`, `WHATSAPP`, `SMS`, `PUSH`, `IN_APP`, `WEBHOOK`.
- **ChannelProvider**: An external service that handles actual delivery for a specific channel (e.g., SendGrid for email, Twilio for SMS/WhatsApp, FCM for push).
- **DeliveryRecord**: A persistent record tracking the lifecycle of a single notification delivery attempt per channel.
- **DeliveryStatus**: `PENDING` | `QUEUED` | `SENT` | `DELIVERED` | `FAILED` | `BOUNCED` | `UNSUBSCRIBED`.
- **FallbackChain**: An ordered list of channels to attempt if the primary channel fails. Configured per notification type in the Communication Policy Module.
- **QuietHours**: A time window during which non-urgent notifications are held and delivered after the window ends. Configured per Organization or Clinic in the Communication Policy Module.
- **IdempotencyKey**: A unique key per notification intent used to prevent duplicate deliveries on retry.

---

## Requirements

### NDE-1: Notification Intent Processing

**User Story:** As a platform service, I want to submit a notification intent so that the service handles all delivery concerns without the calling module needing to know about channels, templates, or providers.

#### Acceptance Criteria

1. THE Notification Service SHALL accept notification intents via:
   - Domain event consumption (e.g., `ReminderDue`, `AIAnalysisCompleted`, `AppointmentBooked`)
   - Explicit `SendNotificationIntent` command from any module's application layer
2. EACH notification intent SHALL contain: `recipientId`, `recipientType` (STAFF | PATIENT | LEAD), `templateId`, `templateVariables`, `priority` (URGENT | HIGH | NORMAL | LOW), and optional `scheduledAt` (ISO 8601 UTC).
3. WHEN a notification intent is received, THE Service SHALL:
   - Resolve the recipient's channel preferences from the Communication Policy Module
   - Render the template with provided variables
   - Determine the delivery channel(s) based on policy
   - Queue the notification for delivery
4. THE Service SHALL support both immediate and scheduled delivery. If `scheduledAt` is provided, the notification SHALL be held until that time.
5. THE Service SHALL deduplicate notification intents using the `idempotencyKey`. If a duplicate intent is received, it SHALL be silently ignored.
6. THE Service SHALL respect the recipient's unsubscribe preferences. If a recipient has unsubscribed from a channel or notification type, delivery SHALL be skipped for that channel.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| Unknown `templateId` | Intent rejected, `NotificationFailed` emitted |
| Unknown `recipientId` | Intent rejected, `NotificationFailed` emitted |
| All channels unsubscribed by recipient | Intent skipped, no delivery attempted |
| Duplicate `idempotencyKey` | Intent silently ignored |

#### Correctness Properties

- For any notification intent I with idempotencyKey K: at most one delivery attempt per channel SHALL be initiated for K, regardless of how many times I is submitted.
- For any recipient R who has unsubscribed from channel C: no notification SHALL be delivered to R via C.

---

### NDE-2: Multi-Channel Delivery and Fallback

**User Story:** As a platform operator, I want notifications to fall back to alternative channels when the primary channel fails so that critical messages always reach the recipient.

#### Acceptance Criteria

1. THE Service SHALL support delivery to multiple channels simultaneously (e.g., Email + Push for the same notification).
2. THE Service SHALL support fallback chains: if delivery to the primary channel fails, THE Service SHALL attempt the next channel in the configured fallback order.
3. THE fallback chain configuration SHALL be defined in the Communication Policy Module per notification type.
4. THE Service SHALL NOT attempt fallback for notifications with priority `LOW`.
5. THE Service SHALL attempt fallback within a configurable timeout window (default: 5 minutes after primary failure).
6. WHEN all channels in the fallback chain fail, THE Service SHALL emit `NotificationFailed` with the full delivery attempt history.

#### Correctness Properties

- For any notification N with fallback chain [C1, C2, C3]: if C1 fails, C2 SHALL be attempted. If C2 fails, C3 SHALL be attempted. If all fail, `NotificationFailed` is emitted.
- For any notification N delivered successfully on channel Cx: no further fallback channels SHALL be attempted for N.

---

### NDE-3: Delivery Lifecycle and Tracking

**User Story:** As a ClinicAdmin, I want to see the delivery status of notifications so that I can verify messages are reaching staff and patients.

#### Acceptance Criteria

1. THE Service SHALL create a `DeliveryRecord` for each channel attempt, tracking: `notificationId`, `recipientId`, `channel`, `status`, `attemptCount`, `sentAt`, `deliveredAt`, `failedAt`, `providerMessageId`, `errorReason`.
2. THE Service SHALL update delivery status based on provider webhooks (delivery receipts, bounces, failures).
3. THE Service SHALL support the following status transitions:
   - `PENDING → QUEUED → SENT → DELIVERED`
   - `PENDING → QUEUED → SENT → BOUNCED`
   - `PENDING → QUEUED → FAILED`
   - `PENDING → FAILED` (validation failure)
4. WHEN a provider webhook reports delivery, THE Service SHALL update the record to `DELIVERED` and emit `NotificationDelivered`.
5. WHEN a provider webhook reports a bounce, THE Service SHALL update the record to `BOUNCED` and emit `NotificationBounced`.
6. DeliveryRecords SHALL be retained for 90 days for operational visibility, then archived or deleted.

#### Correctness Properties

- For any DeliveryRecord D: `D.status` SHALL only transition forward through the defined state machine. No backward transitions are permitted.
- For any notification N with `status = DELIVERED`: the provider SHALL have confirmed receipt.

---

### NDE-4: Retry Logic

**User Story:** As a platform operator, I want failed notification deliveries to be automatically retried so that transient provider failures don't result in lost messages.

#### Acceptance Criteria

1. WHEN a delivery attempt fails with a transient error (provider timeout, 5xx response), THE Service SHALL retry with exponential backoff.
2. THE Service SHALL retry up to 5 times per channel before marking the delivery as `FAILED`.
3. Retry schedule: 30s, 1m, 2m, 5m, 10m.
4. WHEN all retries are exhausted for a channel, THE Service SHALL trigger the fallback chain (if configured) or emit `NotificationFailed`.
5. THE Service SHALL NOT retry for permanent failures (invalid recipient, unsubscribed, hard bounce).

#### Correctness Properties

- For any delivery attempt with a transient failure: `attemptCount` SHALL increment by 1 on each retry.
- For any delivery with `attemptCount = 5` and continued failure: status SHALL transition to `FAILED`.

---

### NDE-5: Quiet Hours and Timezone-Aware Delivery

**User Story:** As a ClinicAdmin, I want to prevent notifications from being sent during quiet hours so that staff and patients are not disturbed outside business hours.

#### Acceptance Criteria

1. THE Service SHALL support quiet hours configuration per Organization (defined in Communication Policy Module).
2. WHEN a non-urgent notification (priority `NORMAL` or `LOW`) is scheduled for delivery during quiet hours, THE Service SHALL hold the notification and deliver it at the start of the next active window.
3. Quiet hours SHALL be evaluated in the recipient's local timezone (derived from Clinic timezone for Staff, or patient-configured timezone for patients).
4. Notifications with priority `URGENT` or `HIGH` SHALL bypass quiet hours and be delivered immediately.
5. THE Service SHALL normalize all scheduling to UTC internally but evaluate quiet hours in the recipient's local timezone.

#### Correctness Properties

- For any non-urgent notification N scheduled during quiet hours [QS, QE] in recipient timezone: N SHALL NOT be delivered before QE.
- For any urgent notification N: N SHALL be delivered immediately regardless of quiet hours.

---

### NDE-6: Rate Limiting

**User Story:** As a platform operator, I want to rate-limit notification delivery so that providers are not overwhelmed and recipients are not spammed.

#### Acceptance Criteria

1. THE Service SHALL enforce per-recipient rate limits: no more than 10 notifications per hour per recipient per channel (configurable in Communication Policy Module).
2. THE Service SHALL enforce per-provider rate limits based on provider API contracts.
3. WHEN a rate limit is reached, THE Service SHALL queue the notification for delivery when the rate window resets.
4. THE Service SHALL NOT drop notifications due to rate limiting — they SHALL be deferred, not discarded.

#### Correctness Properties

- For any recipient R and channel C in any 1-hour window: count of delivered notifications ≤ configured rate limit.
- No notification SHALL be permanently lost due to rate limiting.

---

### NDE-7: Provider Webhook Handling

**User Story:** As a platform operator, I want the service to process delivery receipts from external providers so that notification status is always accurate.

#### Acceptance Criteria

1. THE Service SHALL expose HTTP webhook endpoints for each configured channel provider.
2. WHEN a provider sends a delivery receipt, THE Service SHALL update the corresponding DeliveryRecord status.
3. WHEN a provider reports a hard bounce, THE Service SHALL mark the recipient's channel as invalid and prevent future deliveries to that address until updated.
4. THE Service SHALL validate webhook signatures to prevent spoofed status updates.
5. Webhook processing SHALL be idempotent — processing the same webhook twice SHALL NOT produce duplicate state changes.

#### Failure Cases

| Condition | Behaviour |
|-----------|-----------|
| Invalid webhook signature | Webhook rejected, logged for security review |
| Unknown `providerMessageId` | Webhook ignored, logged for debugging |

---

### NDE-8: Unsubscribe Handling

**User Story:** As a recipient, I want to unsubscribe from specific notification types or channels so that I only receive communications I want.

#### Acceptance Criteria

1. THE Service SHALL maintain per-recipient unsubscribe preferences (stored in Communication Policy Module).
2. THE Service SHALL check unsubscribe preferences before every delivery attempt.
3. THE Service SHALL support unsubscribe at two levels:
   - Per channel (e.g., unsubscribe from all WhatsApp notifications)
   - Per notification type (e.g., unsubscribe from marketing notifications but keep appointment reminders)
4. THE Service SHALL include an unsubscribe link/mechanism in all non-transactional notifications where the channel supports it (e.g., email footer).
5. WHEN a recipient unsubscribes via a provider mechanism (e.g., email unsubscribe header), THE Service SHALL process the provider webhook and update preferences.
6. Transactional notifications (e.g., password reset, security alerts) SHALL NOT be unsubscribable.

#### Correctness Properties

- For any recipient R unsubscribed from channel C: no non-transactional notification SHALL be delivered to R via C after the unsubscribe is recorded.
