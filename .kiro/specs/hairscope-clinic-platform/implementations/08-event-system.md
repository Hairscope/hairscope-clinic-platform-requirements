# Event System

> Covers: Transactional Outbox implementation, outbox dispatcher, Redis Streams for event bus, event consumers, idempotency, retry logic, dead letter handling, and monitoring.

---

# 1. Transactional Outbox

## 1.1 Concept

Domain mutations, audit log entries, and outbox events SHALL be written in a single MongoDB transaction.

This guarantees that if the domain state changes, the event is guaranteed to be published (eventually).

## 1.2 Transaction Pattern

```typescript
const session = await this.connection.startSession();
session.startTransaction();

try {
  // 1. Domain mutation
  await this.patientRepo.save(patient, { session });

  // 2. Audit log
  await this.auditRepo.append({
    action: 'PATIENT_CREATED',
    entityId: patient.id,
    entityType: 'Patient',
    staffId: context.staffId,
    organizationId: context.organizationId,
    clinicId: context.clinicId,
    timestamp: new Date(),
  }, { session });

  // 3. Outbox event
  await this.outboxRepo.insert({
    eventType: 'PatientCreated',
    aggregateId: patient.id,
    aggregateType: 'Patient',
    payload: { patientId: patient.id, clinicId: context.clinicId },
    status: 'PENDING',
    createdAt: new Date(),
  }, { session });

  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

---

# 2. OutboxEvent Schema

## 2.1 MongoDB Schema

```typescript
const OutboxEventSchema = new Schema({
  eventType: { type: String, required: true, index: true },
  aggregateId: { type: String, required: true },
  aggregateType: { type: String, required: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED'],
    default: 'PENDING',
    index: true,
  },
  attempts: { type: Number, default: 0 },
  lastAttemptAt: { type: Date },
  publishedAt: { type: Date },
  failedAt: { type: Date },
  failureReason: { type: String },
  createdAt: { type: Date, default: Date.now },
});

OutboxEventSchema.index({ status: 1, createdAt: 1 });
OutboxEventSchema.index({ aggregateId: 1, createdAt: 1 });
```

## 2.2 Status Transitions

```text
PENDING → PROCESSING   (dispatcher picks up)
PROCESSING → PUBLISHED (successfully published to Redis Streams)
PROCESSING → PENDING   (transient failure, will retry)
PROCESSING → FAILED    (max attempts exceeded)
```

---

# 3. Outbox Dispatcher

## 3.1 Architecture

The Outbox Dispatcher SHALL be a BullMQ recurring job that runs every 2 seconds.

It polls for PENDING events, publishes them to Redis Streams, and updates their status.

## 3.2 Implementation

```typescript
@Injectable()
export class OutboxDispatcher {
  constructor(
    private readonly outboxRepo: OutboxEventRepository,
    private readonly redisStreams: RedisStreamsPublisher,
  ) {}

  @Cron('*/2 * * * * *') // Every 2 seconds
  async dispatch(): Promise<void> {
    const events = await this.outboxRepo.findPending({ limit: 100 });

    for (const event of events) {
      try {
        await this.outboxRepo.markProcessing(event.id);

        await this.redisStreams.publish({
          stream: `events:${event.aggregateType}`,
          key: event.aggregateId,  // Ordering key
          data: {
            eventId: event.id,
            eventType: event.eventType,
            aggregateId: event.aggregateId,
            aggregateType: event.aggregateType,
            payload: JSON.stringify(event.payload),
            createdAt: event.createdAt.toISOString(),
          },
        });

        await this.outboxRepo.markPublished(event.id);
      } catch (error) {
        await this.handleDispatchFailure(event, error);
      }
    }
  }

  private async handleDispatchFailure(event: OutboxEvent, error: Error): Promise<void> {
    const attempts = event.attempts + 1;

    if (attempts >= 10) {
      await this.outboxRepo.markFailed(event.id, error.message);
    } else {
      await this.outboxRepo.markPendingWithBackoff(event.id, attempts);
    }
  }
}
```

## 3.3 Distributed Lock

In multi-instance deployments, the dispatcher SHALL acquire a Redis distributed lock before polling:

```typescript
const lock = await this.redlock.acquire(['outbox-dispatcher-lock'], 5000);
try {
  await this.dispatch();
} finally {
  await lock.release();
}
```

This prevents duplicate publishing from multiple API instances.

---

# 4. Redis Streams Event Bus

## 4.1 Stream Structure

Events SHALL be published to Redis Streams organized by aggregate type:

```text
events:Patient       → PatientCreated, PatientUpdated, ...
events:Appointment   → AppointmentBooked, AppointmentCancelled, ...
events:Session       → SessionCompleted, SessionSaved, ...
```

## 4.2 Consumer Groups

Each consuming module/service SHALL have its own consumer group:

```typescript
// Reminder Service consumer group
await redis.xGroupCreate('events:Appointment', 'reminder-service', '0', { MKSTREAM: true });

// Notification Service consumer group
await redis.xGroupCreate('events:Appointment', 'notification-service', '0', { MKSTREAM: true });
```

Each consumer group receives every message independently (fan-out).

## 4.3 At-Least-Once Delivery

Redis Streams with consumer groups provide at-least-once delivery.

Consumers SHALL acknowledge messages after successful processing:

```typescript
await redis.xAck('events:Appointment', 'reminder-service', messageId);
```

Unacknowledged messages SHALL be reclaimed after a timeout (pending entry list).

---

# 5. Event Consumers

## 5.1 NestJS Consumer Pattern

```typescript
@Injectable()
export class AppointmentEventConsumer {
  constructor(
    private readonly reminderService: ReminderScheduleService,
    private readonly idempotencyStore: IdempotencyStore,
  ) {}

  @OnEvent('AppointmentBooked')
  async handleAppointmentBooked(event: AppointmentBookedEvent): Promise<void> {
    if (await this.idempotencyStore.isDuplicate(event.eventId)) {
      return; // Skip duplicate
    }

    await this.reminderService.createSchedules(event.payload);
    await this.idempotencyStore.markProcessed(event.eventId);
  }
}
```

## 5.2 BullMQ Processor Pattern

For worker services consuming from Redis Streams:

```typescript
@Processor('appointment-events')
export class AppointmentEventProcessor extends WorkerHost {
  async process(job: Job<StreamEvent>): Promise<void> {
    const event = job.data;

    if (await this.idempotencyStore.isDuplicate(event.eventId)) {
      return;
    }

    switch (event.eventType) {
      case 'AppointmentBooked':
        await this.handleBooked(event.payload);
        break;
      case 'AppointmentCancelled':
        await this.handleCancelled(event.payload);
        break;
    }

    await this.idempotencyStore.markProcessed(event.eventId);
  }
}
```

---

# 6. Idempotency

## 6.1 Store

Consumers SHALL store processed event IDs to prevent duplicate processing:

```typescript
@Injectable()
export class IdempotencyStore {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async isDuplicate(eventId: string): Promise<boolean> {
    const exists = await this.redis.exists(`idempotency:${eventId}`);
    return exists === 1;
  }

  async markProcessed(eventId: string): Promise<void> {
    // TTL of 7 days — events older than this are safe to ignore
    await this.redis.set(`idempotency:${eventId}`, '1', 'EX', 7 * 24 * 60 * 60);
  }
}
```

## 6.2 Guarantee

At-least-once delivery + idempotent consumers = effectively-once processing.

---

# 7. Retry Logic

## 7.1 Exponential Backoff

Failed event processing SHALL retry with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | 30 seconds |
| 2 | 1 minute |
| 3 | 2 minutes |
| 4 | 4 minutes |
| 5 | 8 minutes |
| 6 | 15 minutes (cap) |
| 7–10 | 15 minutes each |

Maximum attempts: 10.

## 7.2 BullMQ Configuration

```typescript
new Queue('event-processing', {
  defaultJobOptions: {
    attempts: 10,
    backoff: {
      type: 'custom',
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Custom backoff strategy
function calculateBackoff(attemptsMade: number): number {
  const delays = [30000, 60000, 120000, 240000, 480000, 900000];
  const index = Math.min(attemptsMade - 1, delays.length - 1);
  return delays[index];
}
```

---

# 8. Dead Letter

## 8.1 Failed Events

Events that exceed maximum retry attempts SHALL be marked as FAILED in the outbox.

FAILED events SHALL be isolated for manual resolution.

## 8.2 Resolution

```typescript
// Admin endpoint to retry failed events
async retryFailedEvent(eventId: string): Promise<void> {
  const event = await this.outboxRepo.findById(eventId);
  if (event.status !== 'FAILED') throw new InvalidStateError();

  await this.outboxRepo.resetToPending(eventId);
  // Dispatcher will pick it up on next poll
}
```

## 8.3 Alerting

The platform SHALL alert operations when:

- Failed event count exceeds threshold (> 5 in 1 hour)
- Any single event has been in FAILED state for > 1 hour without resolution

---

# 9. Ordering Guarantees

## 9.1 Per-Aggregate Ordering

Events for the same aggregate SHALL be published to the same Redis Stream key.

Stream key = `aggregateId`.

This guarantees ordering for events affecting the same entity.

## 9.2 Cross-Aggregate

No ordering guarantee exists across different aggregates.

Consumers SHALL NOT depend on cross-aggregate event ordering.

---

# 10. Monitoring

## 10.1 Metrics

The platform SHALL track:

| Metric | Alert Threshold |
|--------|----------------|
| Pending event count | > 100 |
| Failed event count | > 5 per hour |
| Oldest pending event age | > 5 minutes |
| Consumer lag (per group) | > 1000 messages |
| Dispatch rate (events/sec) | < 1 (if pending > 0) |

## 10.2 Health Check

```typescript
@Injectable()
export class EventSystemHealthIndicator extends HealthIndicator {
  async isHealthy(): Promise<HealthIndicatorResult> {
    const oldestPending = await this.outboxRepo.findOldestPending();
    const ageMs = oldestPending ? Date.now() - oldestPending.createdAt.getTime() : 0;

    const isHealthy = ageMs < 5 * 60 * 1000; // < 5 minutes

    return this.getStatus('event-system', isHealthy, {
      oldestPendingAgeMs: ageMs,
      pendingCount: await this.outboxRepo.countPending(),
      failedCount: await this.outboxRepo.countFailed(),
    });
  }
}
```

---
