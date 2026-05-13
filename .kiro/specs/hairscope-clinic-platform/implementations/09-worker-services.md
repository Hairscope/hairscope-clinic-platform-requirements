# Worker Services

> Covers: Reminder Service, Notification Service, Report Generation Service, and AI Models integration. Deployed as separate NestJS applications sharing `packages/shared` types.

---

# 1. Architecture

## 1.1 Deployment Model

Worker services SHALL be separate NestJS applications, each with its own entry point and Dockerfile.

Workers share types and contracts via `packages/shared`.

```text
packages/
├── api/                     → Main API (modular monolith)
├── worker-reminder/         → Reminder Service
├── worker-notification/     → Notification Service
├── worker-report/           → Report Generation Service
└── shared/                  → Shared types, contracts, utilities
```

## 1.2 Worker Bootstrap

Each worker SHALL bootstrap as a standalone NestJS application:

```typescript
// packages/worker-reminder/src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(ReminderWorkerModule);
  await app.listen(config.get('WORKER_REMINDER_PORT'));
}
bootstrap();
```

## 1.3 Shared Infrastructure

All workers SHALL connect to:

- MongoDB (same cluster, same database)
- Redis (same instance, different key prefixes)
- GCS (for file storage where applicable)

Workers SHALL NOT expose GraphQL endpoints.

Workers MAY expose a health check HTTP endpoint.

---

# 2. Reminder Service

## 2.1 Responsibility

The Reminder Service orchestrates time-based workflows.

It does NOT deliver notifications — it emits `ReminderDue` events consumed by the Notification Service.

## 2.2 Events Consumed

| Event | Source | Action |
|-------|--------|--------|
| `AppointmentBooked` | Appointments module | Create reminder schedules |
| `AppointmentRescheduled` | Appointments module | Update reminder schedules |
| `AppointmentCancelled` | Appointments module | Cancel reminder schedules |
| `SessionCompleted` | Sessions module | Create follow-up reminder schedules |

## 2.3 ReminderSchedule Schema

```typescript
const ReminderScheduleSchema = new Schema({
  triggerId: { type: String, required: true, index: true },
  triggerType: { type: String, enum: ['APPOINTMENT', 'SESSION', 'FOLLOW_UP'], required: true },
  recipientId: { type: Schema.Types.ObjectId, required: true },
  recipientType: { type: String, enum: ['STAFF', 'PATIENT', 'LEAD'], required: true },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  ruleId: { type: Schema.Types.ObjectId, required: true },
  fireAt: { type: Date, required: true, index: true },
  timezone: { type: String, required: true },
  status: {
    type: String,
    enum: ['SCHEDULED', 'DUE', 'FIRED', 'MISSED', 'CANCELLED', 'PAUSED'],
    default: 'SCHEDULED',
  },
  firedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

ReminderScheduleSchema.index({ status: 1, fireAt: 1 });
ReminderScheduleSchema.index({ triggerId: 1, status: 1 });
```

## 2.4 Schedule Creation

```typescript
@Injectable()
export class ReminderScheduleService {
  constructor(
    private readonly scheduleRepo: ReminderScheduleRepository,
    private readonly policyClient: CommunicationPolicyClient,
    private readonly reminderQueue: InjectQueue('reminder-fire'),
  ) {}

  async createSchedules(event: AppointmentBookedPayload): Promise<void> {
    const rules = await this.policyClient.getActiveReminderRules(
      event.clinicId,
      'APPOINTMENT',
    );

    for (const rule of rules) {
      const fireAt = new Date(event.appointmentStartTime.getTime() - rule.offsetMs);

      // Skip if fire time is in the past
      if (fireAt <= new Date()) continue;

      const schedule = await this.scheduleRepo.create({
        triggerId: event.appointmentId,
        triggerType: 'APPOINTMENT',
        recipientId: event.patientId,
        recipientType: 'PATIENT',
        organizationId: event.organizationId,
        clinicId: event.clinicId,
        ruleId: rule.id,
        fireAt,
        timezone: event.clinicTimezone,
      });

      // Enqueue delayed job
      const delay = fireAt.getTime() - Date.now();
      await this.reminderQueue.add('fire', { scheduleId: schedule.id }, { delay });
    }
  }
}
```

## 2.5 Fire Mechanism

BullMQ delayed jobs SHALL trigger reminder fires:

```typescript
@Processor('reminder-fire')
export class ReminderFireProcessor extends WorkerHost {
  constructor(
    private readonly scheduleRepo: ReminderScheduleRepository,
    private readonly redisStreams: RedisStreamsPublisher,
    private readonly redlock: Redlock,
  ) {
    super();
  }

  async process(job: Job<{ scheduleId: string }>): Promise<void> {
    const { scheduleId } = job.data;

    // Distributed lock to prevent duplicate fires
    const lock = await this.redlock.acquire([`reminder-fire:${scheduleId}`], 10000);
    try {
      const schedule = await this.scheduleRepo.findById(scheduleId);

      if (!schedule || schedule.status !== 'SCHEDULED') return;

      // Mark as fired
      await this.scheduleRepo.updateStatus(scheduleId, 'FIRED');

      // Emit ReminderDue event to Redis Streams
      await this.redisStreams.publish({
        stream: 'events:Reminder',
        key: schedule.triggerId,
        data: {
          eventType: 'ReminderDue',
          scheduleId: schedule.id,
          recipientId: schedule.recipientId,
          recipientType: schedule.recipientType,
          triggerId: schedule.triggerId,
          triggerType: schedule.triggerType,
          clinicId: schedule.clinicId,
          organizationId: schedule.organizationId,
          ruleId: schedule.ruleId,
        },
      });
    } finally {
      await lock.release();
    }
  }
}
```

## 2.6 Rescheduling

When an appointment is rescheduled:

```typescript
async handleRescheduled(event: AppointmentRescheduledPayload): Promise<void> {
  // Cancel existing schedules
  const existing = await this.scheduleRepo.findByTriggerId(event.appointmentId, 'SCHEDULED');
  for (const schedule of existing) {
    await this.scheduleRepo.updateStatus(schedule.id, 'CANCELLED');
    await this.reminderQueue.remove(schedule.id);
  }

  // Create new schedules with updated time
  await this.createSchedules({
    ...event,
    appointmentStartTime: event.newStartTime,
  });
}
```

## 2.7 Cancellation

When an appointment is cancelled, all pending reminder schedules SHALL be cancelled:

```typescript
async handleCancelled(event: AppointmentCancelledPayload): Promise<void> {
  await this.scheduleRepo.cancelAllForTrigger(event.appointmentId);
}
```

---

# 3. Notification Service

## 3.1 Responsibility

The Notification Service handles message rendering, channel selection, delivery, tracking, and retry.

## 3.2 Events Consumed

| Event | Action |
|-------|--------|
| `ReminderDue` | Render and deliver reminder notification |
| `SendNotificationIntent` | Render and deliver explicit notification |

## 3.3 Processing Pipeline

```text
1. Receive event
2. Resolve recipient channel preferences (Communication Policy)
3. Check quiet hours
4. Render template with variables
5. Select channel (primary from policy)
6. Deliver via provider adapter
7. Track delivery status
8. On failure → retry or fallback to next channel
```

## 3.4 Template Rendering

```typescript
@Injectable()
export class TemplateRenderer {
  private readonly handlebars = Handlebars.create();

  async render(templateId: string, variables: Record<string, any>): Promise<RenderedContent> {
    const template = await this.templateRepo.findById(templateId);
    if (!template) throw new TemplateNotFoundError(templateId);

    const subject = this.handlebars.compile(template.subject)(variables);
    const body = this.handlebars.compile(template.body)(variables);

    return { subject, body, format: template.format };
  }
}
```

## 3.5 Channel Resolution

```typescript
@Injectable()
export class ChannelResolver {
  constructor(private readonly policyClient: CommunicationPolicyClient) {}

  async resolve(recipientId: string, notificationType: string): Promise<ChannelChain> {
    const policy = await this.policyClient.getChannelPolicy(recipientId, notificationType);

    return {
      primary: policy.primaryChannel,
      fallback: policy.fallbackChannels,
    };
  }
}
```

## 3.6 Provider Adapters

```typescript
// Email via SMTP2Go
@Injectable()
export class EmailAdapter implements ChannelAdapter {
  constructor(private readonly transporter: Transporter) {}

  async send(notification: PreparedNotification): Promise<DeliveryResult> {
    const result = await this.transporter.sendMail({
      from: notification.from,
      to: notification.recipientEmail,
      subject: notification.subject,
      html: notification.body,
    });
    return { success: true, providerMessageId: result.messageId };
  }
}

// Push via FCM
@Injectable()
export class PushAdapter implements ChannelAdapter {
  constructor(private readonly fcm: FirebaseMessaging) {}

  async send(notification: PreparedNotification): Promise<DeliveryResult> {
    const result = await this.fcm.send({
      token: notification.recipientDeviceToken,
      notification: {
        title: notification.subject,
        body: notification.body,
      },
    });
    return { success: true, providerMessageId: result };
  }
}

// In-App
@Injectable()
export class InAppAdapter implements ChannelAdapter {
  constructor(private readonly notificationRepo: InAppNotificationRepository) {}

  async send(notification: PreparedNotification): Promise<DeliveryResult> {
    const record = await this.notificationRepo.create({
      recipientId: notification.recipientId,
      title: notification.subject,
      body: notification.body,
      read: false,
      createdAt: new Date(),
    });
    return { success: true, providerMessageId: record.id };
  }
}
```

## 3.7 Delivery Tracking

```typescript
const DeliveryRecordSchema = new Schema({
  notificationIntentId: { type: String, required: true },
  recipientId: { type: Schema.Types.ObjectId, required: true },
  channel: { type: String, enum: ['EMAIL', 'PUSH', 'IN_APP', 'SMS', 'WHATSAPP'], required: true },
  status: {
    type: String,
    enum: ['PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED'],
    default: 'PENDING',
  },
  providerMessageId: { type: String },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date },
  deliveredAt: { type: Date },
  failureReason: { type: String },
  createdAt: { type: Date, default: Date.now },
});
```

## 3.8 Retry and Fallback

```typescript
async deliver(notification: PreparedNotification, channelChain: ChannelChain): Promise<void> {
  const channels = [channelChain.primary, ...channelChain.fallback];

  for (const channel of channels) {
    const adapter = this.getAdapter(channel);
    let success = false;

    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const result = await adapter.send(notification);
        await this.deliveryRepo.markSent(notification.id, channel, result.providerMessageId);
        success = true;
        break;
      } catch (error) {
        await this.deliveryRepo.recordAttempt(notification.id, channel, attempt, error.message);
        if (attempt < 5) {
          await this.delay(this.calculateBackoff(attempt));
        }
      }
    }

    if (success) break;
    // If primary failed after all retries, try next channel in fallback chain
  }
}
```

## 3.9 Rate Limiting

Per-recipient rate limits SHALL prevent notification spam:

| Scope | Limit |
|-------|-------|
| Per recipient, per channel, per hour | 10 notifications |
| Per recipient, all channels, per day | 50 notifications |

```typescript
async isRateLimited(recipientId: string, channel: string): Promise<boolean> {
  const key = `notif-rate:${recipientId}:${channel}:${currentHour()}`;
  const count = await this.redis.incr(key);
  if (count === 1) await this.redis.expire(key, 3600);
  return count > 10;
}
```

## 3.10 Quiet Hours

```typescript
async isInQuietHours(recipientId: string, clinicId: string): Promise<boolean> {
  const policy = await this.policyClient.getQuietHours(clinicId);
  if (!policy.enabled) return false;

  const recipientTz = await this.getRecipientTimezone(recipientId, clinicId);
  const localHour = new Date().toLocaleString('en-US', { timeZone: recipientTz, hour: 'numeric', hour12: false });
  const hour = parseInt(localHour);

  return hour >= policy.startHour || hour < policy.endHour;
}
```

Notifications received during quiet hours SHALL be held and delivered when the quiet window ends.

---

# 4. Report Generation Service

## 4.1 Responsibility

The Report Generation Service produces PDF documents from clinical data using Typst templates.

## 4.2 Events Consumed

| Event | Output |
|-------|--------|
| `SessionCompleted` | Session report PDF |
| `TreatmentPlanSigned` | Treatment plan PDF |
| `PrescriptionSigned` | Prescription PDF |

## 4.3 Processing Pipeline

```text
1. Consume event from Redis Streams
2. Load data from relevant modules via published contracts
3. Render Typst template with data
4. Compile via Typst CLI
5. Upload PDF to GCS
6. Emit ReportGenerated event with URL
```

## 4.4 Implementation

```typescript
@Processor('report-generation')
export class ReportGenerationProcessor extends WorkerHost {
  constructor(
    private readonly dataLoader: ReportDataLoader,
    private readonly typstCompiler: TypstCompiler,
    private readonly storageService: GcsStorageService,
    private readonly redisStreams: RedisStreamsPublisher,
  ) {
    super();
  }

  async process(job: Job<ReportGenerationJob>): Promise<void> {
    const { eventType, entityId, organizationId, clinicId } = job.data;

    // 1. Load data
    const data = await this.dataLoader.load(eventType, entityId, { organizationId, clinicId });

    // 2. Select template
    const templatePath = this.resolveTemplate(eventType);

    // 3. Render template with data
    const typstContent = await this.renderTemplate(templatePath, data);

    // 4. Compile to PDF
    const pdfBuffer = await this.typstCompiler.compile(typstContent);

    // 5. Upload to GCS
    const fileName = `reports/${organizationId}/${clinicId}/${entityId}-${Date.now()}.pdf`;
    const url = await this.storageService.upload(fileName, pdfBuffer, 'application/pdf');

    // 6. Emit event
    await this.redisStreams.publish({
      stream: 'events:Report',
      key: entityId,
      data: {
        eventType: 'ReportGenerated',
        entityId,
        reportType: eventType,
        url,
        organizationId,
        clinicId,
      },
    });
  }
}
```

## 4.5 Typst Compiler

```typescript
@Injectable()
export class TypstCompiler {
  async compile(typstContent: string): Promise<Buffer> {
    const tmpInput = path.join(os.tmpdir(), `${randomUUID()}.typ`);
    const tmpOutput = path.join(os.tmpdir(), `${randomUUID()}.pdf`);

    await fs.writeFile(tmpInput, typstContent);

    try {
      await execAsync(`typst compile ${tmpInput} ${tmpOutput}`);
      return await fs.readFile(tmpOutput);
    } finally {
      await fs.unlink(tmpInput).catch(() => {});
      await fs.unlink(tmpOutput).catch(() => {});
    }
  }
}
```

## 4.6 Template Structure

Typst templates SHALL be stored in `typst/templates/`:

```text
typst/templates/
├── session-report.typ
├── treatment-plan.typ
├── prescription.typ
└── partials/
    ├── header.typ
    ├── footer.typ
    └── clinic-info.typ
```

## 4.7 Retry

Report generation SHALL retry on failure:

- Maximum 3 attempts
- Backoff: 30s, 60s, 120s
- On final failure: emit `ReportGenerationFailed` event

---

# 5. AI Models Integration

## 5.1 Responsibility

The AI integration worker calls external AI APIs for image analysis and emits results as events.

External AI API implementation details are out of scope — this worker handles the integration contract.

## 5.2 Events Consumed

| Event | Action |
|-------|--------|
| `SessionSaved` | Submit images for AI analysis |

## 5.3 Processing

```typescript
@Processor('ai-analysis')
export class AIAnalysisProcessor extends WorkerHost {
  constructor(
    private readonly aiClient: ExternalAIClient,
    private readonly storageService: GcsStorageService,
    private readonly redisStreams: RedisStreamsPublisher,
  ) {
    super();
  }

  async process(job: Job<AIAnalysisJob>): Promise<void> {
    const { sessionId, imageUrls, organizationId, clinicId } = job.data;

    try {
      // Call external AI API with images
      const analysis = await this.aiClient.analyze({
        images: imageUrls,
        analysisType: 'hair_scalp',
      });

      // Emit success event
      await this.redisStreams.publish({
        stream: 'events:AIAnalysis',
        key: sessionId,
        data: {
          eventType: 'AIAnalysisCompleted',
          sessionId,
          results: JSON.stringify(analysis.results),
          confidence: analysis.confidence,
          organizationId,
          clinicId,
        },
      });
    } catch (error) {
      // Emit failure event (after retries exhausted by BullMQ)
      if (job.attemptsMade >= 2) {
        await this.redisStreams.publish({
          stream: 'events:AIAnalysis',
          key: sessionId,
          data: {
            eventType: 'AIAnalysisFailed',
            sessionId,
            reason: error.message,
            organizationId,
            clinicId,
          },
        });
      }
      throw error; // Let BullMQ handle retry
    }
  }
}
```

## 5.4 Retry Configuration

```typescript
new Queue('ai-analysis', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30000, // 30s, 60s, 120s
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
```

## 5.5 External AI Client

```typescript
@Injectable()
export class ExternalAIClient {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const response = await firstValueFrom(
      this.httpService.post(
        this.configService.get('AI_API_URL'),
        request,
        {
          headers: {
            Authorization: `Bearer ${this.configService.get('AI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000, // 60s timeout for AI processing
        },
      ),
    );

    return response.data;
  }
}
```

---

# 6. Worker Module Registration

## 6.1 Reminder Worker Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({ /* ... */ }),
    BullModule.forRootAsync({ /* Redis connection */ }),
    BullModule.registerQueue(
      { name: 'reminder-fire' },
    ),
    MongooseModule.forFeature([
      { name: ReminderSchedule.name, schema: ReminderScheduleSchema },
    ]),
  ],
  providers: [
    ReminderScheduleService,
    ReminderFireProcessor,
    ReminderScheduleRepository,
    RedisStreamsPublisher,
    CommunicationPolicyClient,
    IdempotencyStore,
  ],
})
export class ReminderWorkerModule {}
```

## 6.2 Notification Worker Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({ /* ... */ }),
    BullModule.forRootAsync({ /* Redis connection */ }),
    MongooseModule.forFeature([
      { name: DeliveryRecord.name, schema: DeliveryRecordSchema },
      { name: InAppNotification.name, schema: InAppNotificationSchema },
    ]),
  ],
  providers: [
    NotificationProcessor,
    TemplateRenderer,
    ChannelResolver,
    EmailAdapter,
    PushAdapter,
    InAppAdapter,
    DeliveryRecordRepository,
    CommunicationPolicyClient,
    IdempotencyStore,
  ],
})
export class NotificationWorkerModule {}
```

## 6.3 Report Worker Module

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({ /* ... */ }),
    BullModule.forRootAsync({ /* Redis connection */ }),
    BullModule.registerQueue(
      { name: 'report-generation' },
    ),
  ],
  providers: [
    ReportGenerationProcessor,
    ReportDataLoader,
    TypstCompiler,
    GcsStorageService,
    RedisStreamsPublisher,
    IdempotencyStore,
  ],
})
export class ReportWorkerModule {}
```

---
