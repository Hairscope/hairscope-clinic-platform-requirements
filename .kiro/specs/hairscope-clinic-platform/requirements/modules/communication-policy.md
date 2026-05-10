# Communication Policy Module

> Covers: Notification templates, channel preferences, appointment reminder rules, follow-up reminder rules, consent preferences, notification branding, and timezone policy.
> Events emitted: none (configuration module — engines read from it)
> Events consumed: none

> **Architectural note:** The Communication Policy Module is the business configuration layer for notifications and reminders. It does NOT send notifications or schedule reminders — it defines the rules, templates, and preferences that the Notification Delivery Engine and Reminder Scheduling Engine consume. Staff with sufficient permission configure behavior here.

---

## Glossary

- **NotificationTemplate**: A message template with placeholders for dynamic content. Defined per notification type and channel. Supports localization.
- **ChannelPreference**: A per-recipient or per-Organization configuration specifying which channels are preferred for which notification types.
- **ReminderRule**: A business rule defining when reminders should fire relative to a triggering event. Contains: trigger type, offset(s), channel(s), template reference, and priority.
- **ConsentPreference**: A record of a recipient's consent to receive communications via specific channels or for specific purposes.
- **NotificationBranding**: Organization-level branding applied to outgoing notifications (logo, colors, sender name, reply-to address).
- **TimezonePolicy**: Configuration determining how timezone is resolved for notification scheduling (Clinic timezone, patient timezone, or explicit override).
- **NotificationType**: A categorization of notifications. Values: `TRANSACTIONAL` (cannot be unsubscribed), `OPERATIONAL` (system alerts), `APPOINTMENT` (booking/reminder), `CLINICAL` (session/report), `MARKETING` (promotional).

---

## Permission Model

| Permission | What it covers |
|-----------|---------------|
| `organization.edit` | Configure Organization-level templates, branding, default rules, and channel settings |
| `organization.view` | View Organization-level communication policy configuration |

Communication Policy configuration is restricted to OrganizationAdmins and ClinicAdmins (for clinic-level overrides where permitted).

---

## Requirements

### CMP-1: Notification Templates

**User Story:** As an OrganizationAdmin, I want to configure notification templates so that all communications from my clinics have consistent messaging and branding.

#### Acceptance Criteria

1. THE Platform SHALL maintain notification templates per Organization, organized by notification type and channel.
2. EACH template SHALL contain: `templateId`, `notificationType`, `channel`, `subject` (for email), `body` (with placeholder syntax), `locale`, and `version`.
3. THE Platform SHALL support placeholders in templates using `{{variableName}}` syntax. Available variables are defined per notification type.
4. THE Platform SHALL provide default templates for all platform-defined notification types. OrganizationAdmins MAY override defaults with custom templates.
5. THE Platform SHALL support templates in all platform-supported locales (see `shared/enums.md` Locale).
6. WHEN a template is updated, THE Platform SHALL version the template. Previous versions are retained for audit purposes.
7. THE Platform SHALL validate that all required placeholders are present in a template before saving.
8. WHEN a template is created, edited, or deleted, THE Platform SHALL record the change in the AuditLog.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Missing required placeholder in template body | `VALIDATION_ERROR` (field: `body`) |
| Invalid placeholder syntax | `VALIDATION_ERROR` (field: `body`) |
| Template not found | `NOT_FOUND` |
| Clinic-level Staff attempting to edit Organization templates | `FORBIDDEN` |

#### Correctness Properties

- For any notification type T and channel C: at least one active template SHALL exist (either custom or platform default).
- For any template update: the previous version SHALL remain accessible for audit purposes.

---

### CMP-2: Channel Preferences

**User Story:** As an OrganizationAdmin, I want to configure which channels are used for each notification type so that I can control how my clinics communicate with patients and staff.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to configure channel preferences per notification type at the Organization level.
2. Channel preferences SHALL define: primary channel, fallback chain (ordered list of alternative channels), and whether multi-channel delivery is enabled (send on multiple channels simultaneously).
3. THE Platform SHALL provide sensible defaults:
   - Appointment reminders: Email (primary), WhatsApp (fallback)
   - AI analysis complete: In-App (primary), Push (fallback)
   - Report generated: Email (primary)
   - Security alerts: Email (primary), SMS (fallback)
4. THE Platform SHALL allow recipients (Staff or Patients) to override Organization-level preferences for their own notifications, subject to the constraint that transactional notifications cannot be disabled.
5. WHEN channel preferences are updated, THE Platform SHALL record the change in the AuditLog.

#### Correctness Properties

- For any notification type T: at least one channel SHALL be configured (either Organization default or platform default).
- Recipient-level overrides SHALL take precedence over Organization-level preferences for non-transactional notifications.

---

### CMP-3: Appointment Reminder Rules

**User Story:** As an OrganizationAdmin, I want to configure when appointment reminders are sent so that patients receive timely notifications before their visits.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to configure one or more reminder rules per appointment type.
2. EACH reminder rule SHALL define: `offset` (time before appointment), `channels` (which channels to use), `templateId`, `priority`, and `recipientType` (PATIENT, STAFF, or BOTH).
3. THE Platform SHALL provide default reminder rules:
   - 24 hours before: Email to Patient
   - 2 hours before: Email + WhatsApp to Patient
4. OrganizationAdmins SHALL be able to override, add, or remove reminder rules.
5. THE Platform SHALL allow ClinicAdmins to override Organization-level reminder rules for their specific Clinic.
6. Clinic-level overrides SHALL take precedence over Organization-level rules for that Clinic.
7. WHEN reminder rules are updated, THE Platform SHALL record the change in the AuditLog.
8. WHEN reminder rules are updated, THE change SHALL apply to all future appointments only. Existing reminder schedules are not retroactively modified.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Offset ≤ 0 | `VALIDATION_ERROR` (field: `offset`) |
| No channels specified | `VALIDATION_ERROR` (field: `channels`) |
| Invalid templateId | `VALIDATION_ERROR` (field: `templateId`) |

#### Correctness Properties

- For any appointment A booked after a rule change: the new rules SHALL apply.
- For any appointment A booked before a rule change: existing reminder schedules SHALL remain unchanged.
- Clinic-level rules SHALL override Organization-level rules for appointments in that Clinic.

---

### CMP-4: Follow-Up Reminder Rules

**User Story:** As an OrganizationAdmin, I want to configure follow-up reminders after sessions so that patients are reminded about their treatment routines and next appointments.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to configure follow-up reminder rules triggered by `SessionCompleted`.
2. EACH follow-up rule SHALL define: `offset` (time after session completion), `channels`, `templateId`, `priority`, `recipientType`, and `recurrencePattern` (ONCE or RECURRING with interval).
3. THE Platform SHALL support recurring follow-up reminders (e.g., daily routine reminders for 30 days after a session).
4. THE Platform SHALL provide default follow-up rules:
   - 24 hours after session: Email to Patient with report link
5. OrganizationAdmins and ClinicAdmins SHALL be able to configure custom follow-up rules.
6. Follow-up reminders SHALL be extensible to the Hairscope Care App in the future (out of scope for this iteration but the data model SHALL support it).

#### Correctness Properties

- For any session S completed at time T with follow-up rule R (offset O): a reminder schedule SHALL be created with `fireAt = T + O`.
- Recurring follow-up reminders SHALL continue until their configured end condition (end date, max count, or explicit cancellation).

---

### CMP-5: Consent Preferences

**User Story:** As a ClinicAdmin, I want to record patient communication consent so that the platform only sends notifications to patients who have agreed to receive them.

#### Acceptance Criteria

1. THE Platform SHALL maintain consent records per recipient (Patient or Lead) per communication purpose.
2. Consent purposes SHALL include: `APPOINTMENT_REMINDERS`, `TREATMENT_FOLLOW_UP`, `MARKETING`, `OPERATIONAL`.
3. EACH consent record SHALL contain: `recipientId`, `recipientType`, `purpose`, `channel`, `granted` (boolean), `grantedAt` or `revokedAt`, `recordedByStaffId`.
4. THE Platform SHALL require explicit consent before sending non-transactional notifications to Patients and Leads.
5. THE Platform SHALL allow ClinicAdmins to record consent on behalf of a Patient (e.g., verbal consent during visit).
6. THE Platform SHALL allow Patients to revoke consent at any time (via unsubscribe mechanism handled by Notification Engine).
7. WHEN consent is granted or revoked, THE Platform SHALL record the change in the AuditLog.
8. Transactional notifications (security alerts, password reset) SHALL NOT require consent and SHALL NOT be affected by consent revocation.

#### Failure Cases

| Condition | Error Code |
|-----------|------------|
| Attempting to send non-transactional notification without consent | Notification skipped (silent, logged) |
| Patient not found | `PATIENT_NOT_FOUND` |

#### Correctness Properties

- For any Patient P without consent for purpose X: no notification of purpose X SHALL be delivered to P.
- Transactional notifications SHALL always be deliverable regardless of consent state.
- Consent records SHALL be immutable once created. Revocation creates a new record; it does not modify the original grant.

---

### CMP-6: Notification Branding

**User Story:** As an OrganizationAdmin, I want to configure branding for outgoing notifications so that all communications reflect my organization's identity.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to configure notification branding at the Organization level: `senderName`, `replyToEmail`, `logoUrl`, `primaryColor`, `footerText`.
2. THE Platform SHALL allow ClinicAdmins to override `senderName` and `replyToEmail` at the Clinic level for notifications sent on behalf of their Clinic.
3. THE Notification Engine SHALL apply branding when rendering templates.
4. THE Platform SHALL provide default branding (Hairscope platform branding) until custom branding is configured.
5. WHEN branding is updated, THE Platform SHALL apply the new branding to all future notifications. Previously sent notifications are not affected.

#### Correctness Properties

- Clinic-level branding overrides SHALL take precedence over Organization-level branding for notifications originating from that Clinic.
- All outgoing email notifications SHALL include the configured `senderName` and `replyToEmail`.

---

### CMP-7: Quiet Hours Configuration

**User Story:** As an OrganizationAdmin, I want to configure quiet hours so that non-urgent notifications are not sent during off-hours.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to configure quiet hours at the Organization level: `startTime`, `endTime`, `daysOfWeek` (which days quiet hours apply), `timezone`.
2. THE Platform SHALL allow ClinicAdmins to override quiet hours for their Clinic.
3. Quiet hours SHALL apply to notifications with priority `NORMAL` and `LOW` only. `URGENT` and `HIGH` priority notifications bypass quiet hours.
4. THE Platform SHALL provide a default quiet hours configuration: 22:00–08:00 local time, all days.
5. WHEN quiet hours are updated, THE Platform SHALL apply the new configuration to all future notification scheduling.

#### Correctness Properties

- For any non-urgent notification N scheduled during quiet hours: N SHALL be held until quiet hours end.
- For any urgent notification N: N SHALL be delivered immediately regardless of quiet hours.

---

### CMP-8: Rate Limit Configuration

**User Story:** As an OrganizationAdmin, I want to configure notification rate limits so that recipients are not overwhelmed with messages.

#### Acceptance Criteria

1. THE Platform SHALL allow OrganizationAdmins to configure per-recipient rate limits: maximum notifications per hour per channel.
2. THE Platform SHALL provide default rate limits: 10 notifications per hour per recipient per channel.
3. Rate limits SHALL apply across all notification types combined (not per type).
4. THE Platform SHALL allow exceptions for `TRANSACTIONAL` notifications — they SHALL NOT count toward rate limits.

#### Correctness Properties

- For any recipient R and channel C in any 1-hour window: count of non-transactional notifications delivered ≤ configured rate limit.
- Transactional notifications SHALL never be blocked by rate limits.

