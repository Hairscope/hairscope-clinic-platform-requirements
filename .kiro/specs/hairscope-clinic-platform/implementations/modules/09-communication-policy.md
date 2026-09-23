# Communication Policy Module Implementation

> Covers: Reminder rules, channel preferences, templates, quiet hours, unsubscribe preferences, and branding. This module defines rules — it does NOT send notifications or schedule reminders.

---

# 1. Module Structure

```text
packages/api/src/modules/communication-policy/
├── communication-policy.module.ts
├── entities/
│   ├── reminder-rule.schema.ts
│   ├── channel-preference.schema.ts
│   ├── notification-template.schema.ts
│   ├── quiet-hours.schema.ts
│   └── unsubscribe-preference.schema.ts
├── repositories/
│   ├── reminder-rule.repository.ts
│   ├── channel-preference.repository.ts
│   ├── notification-template.repository.ts
│   ├── quiet-hours.repository.ts
│   └── unsubscribe-preference.repository.ts
├── services/
│   ├── reminder-rule.service.ts
│   ├── channel-preference.service.ts
│   ├── notification-template.service.ts
│   └── quiet-hours.service.ts
├── resolvers/
│   ├── reminder-rule.resolver.ts
│   ├── channel-preference.resolver.ts
│   └── notification-template.resolver.ts
└── dto/
    ├── create-reminder-rule.input.ts
    ├── update-channel-preference.input.ts
    └── set-quiet-hours.input.ts
```

---

# 2. Reminder Rule Schema

```typescript
const ReminderRuleSchema = new Schema({
  name: { type: String, required: true },
  triggerEvent: {
    type: String,
    enum: ['APPOINTMENT_BOOKED', 'SESSION_COMPLETED', 'INVOICE_DUE'],
    required: true,
  },
  triggerType: {
    type: String,
    enum: ['APPOINTMENT', 'SESSION', 'FOLLOW_UP'],
    required: true,
  },
  offsetMs: { type: Number, required: true }, // Negative = before, Positive = after
  channels: [{
    type: String,
    enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS', 'WHATSAPP'],
  }],
  templateId: { type: Schema.Types.ObjectId, ref: 'NotificationTemplate' },
  isActive: { type: Boolean, default: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

ReminderRuleSchema.index({ clinicId: 1, triggerEvent: 1, isActive: 1 });
```

Example rules:

```text
24h before appointment → EMAIL
2h before appointment  → PUSH
15m before appointment → PUSH
```

---

# 3. Channel Preference Schema

```typescript
const ChannelPreferenceSchema = new Schema({
  recipientId: { type: Schema.Types.ObjectId, required: true },
  recipientType: { type: String, enum: ['STAFF', 'PATIENT', 'LEAD'], required: true },
  notificationType: { type: String, required: true },
  primaryChannel: {
    type: String,
    enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS', 'WHATSAPP'],
    required: true,
  },
  fallbackChannels: [{
    type: String,
    enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS', 'WHATSAPP'],
  }],
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  updatedAt: { type: Date, default: Date.now },
});

ChannelPreferenceSchema.index(
  { recipientId: 1, notificationType: 1 },
  { unique: true },
);
```

---

# 4. Notification Template Schema

```typescript
const NotificationTemplateSchema = new Schema({
  name: { type: String, required: true },
  channel: { type: String, enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS', 'WHATSAPP'], required: true },
  subject: { type: String }, // For EMAIL
  body: { type: String, required: true }, // Handlebars template
  variables: [{ type: String }], // Available template variables
  format: { type: String, enum: ['HTML', 'PLAIN_TEXT'], default: 'HTML' },
  isActive: { type: Boolean, default: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

NotificationTemplateSchema.index({ clinicId: 1, name: 1, channel: 1 }, { unique: true });
```

---

# 5. Quiet Hours Schema

```typescript
const QuietHoursSchema = new Schema({
  enabled: { type: Boolean, default: false },
  startHour: { type: Number, min: 0, max: 23, default: 22 }, // 10 PM
  endHour: { type: Number, min: 0, max: 23, default: 8 },   // 8 AM
  timezone: { type: String }, // Falls back to clinic timezone
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, unique: true },
  updatedAt: { type: Date, default: Date.now },
});
```

---

# 6. Reminder Rule Service

```typescript
@Injectable()
export class ReminderRuleService {
  async getActiveRules(clinicId: string, triggerEvent: string): Promise<ReminderRule[]> {
    return this.reminderRuleRepo.findActive(clinicId, triggerEvent);
  }

  async create(dto: CreateReminderRuleDto, context: TenantContext): Promise<ReminderRule> {
    const rule = await this.reminderRuleRepo.create({
      ...dto,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.staffId,
    });

    await this.auditService.append('REMINDER_RULE_CREATED', { ruleId: rule.id });
    return rule;
  }

  async update(ruleId: string, dto: UpdateReminderRuleDto, context: TenantContext): Promise<ReminderRule> {
    const rule = await this.reminderRuleRepo.findById(ruleId, context);
    if (!rule) throw new NotFoundError('ReminderRule');

    const updated = await this.reminderRuleRepo.update(ruleId, dto, context);
    await this.auditService.append('REMINDER_RULE_UPDATED', { ruleId, changes: dto });
    return updated;
  }

  async deactivate(ruleId: string, context: TenantContext): Promise<void> {
    await this.reminderRuleRepo.update(ruleId, { isActive: false }, context);
    await this.auditService.append('REMINDER_RULE_DEACTIVATED', { ruleId });
  }
}
```

---

# 7. Published Contract

The Communication Policy module exposes a published contract consumed by Worker Services:

```typescript
// packages/shared/src/contracts/communication-policy.contract.ts
export interface CommunicationPolicyContract {
  getActiveReminderRules(clinicId: string, triggerEvent: string): Promise<ReminderRule[]>;
  getChannelPolicy(recipientId: string, notificationType: string): Promise<ChannelPolicy>;
  getQuietHours(clinicId: string): Promise<QuietHoursConfig>;
  getTemplate(templateId: string): Promise<NotificationTemplate>;
}
```

Worker Services access this contract via an internal GraphQL client that queries the main API. Workers SHALL NOT query the Communication Policy module's database collections directly — this preserves module encapsulation.

```typescript
// packages/shared/src/clients/communication-policy.client.ts
@Injectable()
export class CommunicationPolicyClient implements CommunicationPolicyContract {
  constructor(private readonly graphqlClient: InternalGraphQLClient) {}

  async getActiveReminderRules(clinicId: string, triggerEvent: string): Promise<ReminderRule[]> {
    const result = await this.graphqlClient.query({
      query: GET_ACTIVE_REMINDER_RULES,
      variables: { clinicId, triggerEvent },
    });
    return result.data.activeReminderRules;
  }

  async getChannelPolicy(recipientId: string, notificationType: string): Promise<ChannelPolicy> {
    const result = await this.graphqlClient.query({
      query: GET_CHANNEL_POLICY,
      variables: { recipientId, notificationType },
    });
    return result.data.channelPolicy;
  }
}
```

The `InternalGraphQLClient` authenticates with a service-to-service token and calls the main API's GraphQL endpoint. This keeps one API surface (GraphQL) for all consumers.

---

# 8. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReminderRule.name, schema: ReminderRuleSchema },
      { name: ChannelPreference.name, schema: ChannelPreferenceSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      { name: QuietHours.name, schema: QuietHoursSchema },
      { name: UnsubscribePreference.name, schema: UnsubscribePreferenceSchema },
    ]),
  ],
  providers: [
    ReminderRuleService,
    ChannelPreferenceService,
    NotificationTemplateService,
    QuietHoursService,
    ReminderRuleRepository,
    ChannelPreferenceRepository,
    NotificationTemplateRepository,
    QuietHoursRepository,
    UnsubscribePreferenceRepository,
    ReminderRuleResolver,
    ChannelPreferenceResolver,
    NotificationTemplateResolver,
  ],
  exports: [
    ReminderRuleService,
    ChannelPreferenceService,
    NotificationTemplateService,
    QuietHoursService,
  ],
})
export class CommunicationPolicyModule {}
```

---
