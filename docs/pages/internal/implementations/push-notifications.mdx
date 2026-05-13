# Push Notifications

> Covers: Firebase Cloud Messaging (FCM) integration, device token management, notification payload structure, topic subscriptions, and delivery tracking.

---

# 1. Firebase Admin Setup

## 1.1 Configuration

FCM SHALL be accessed via the Firebase Admin SDK:

```typescript
import * as admin from 'firebase-admin';

@Module({
  providers: [
    {
      provide: 'FIREBASE_APP',
      useFactory: (config: ConfigService) => {
        return admin.initializeApp({
          credential: admin.credential.cert({
            projectId: config.get('FIREBASE_PROJECT_ID'),
            clientEmail: config.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: config.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
          }),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'FIREBASE_MESSAGING',
      useFactory: (app: admin.app.App) => app.messaging(),
      inject: ['FIREBASE_APP'],
    },
    PushNotificationService,
  ],
  exports: [PushNotificationService],
})
export class PushNotificationModule {}
```

## 1.2 Environment Variables

```env
FIREBASE_PROJECT_ID=hairscope-platform
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@hairscope-platform.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

# 2. Device Token Management

## 2.1 Schema

```typescript
const DeviceTokenSchema = new Schema({
  staffId: { type: Schema.Types.ObjectId, index: true },
  patientId: { type: Schema.Types.ObjectId, index: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  token: { type: String, required: true, unique: true },
  platform: { type: String, enum: ['IOS', 'ANDROID', 'WEB'], required: true },
  appType: { type: String, enum: ['CLINIC_WEB', 'CLINIC_MOBILE', 'CARE_APP', 'PRO_APP'], required: true },
  isActive: { type: Boolean, default: true },
  lastUsedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

DeviceTokenSchema.index({ staffId: 1, isActive: 1 });
DeviceTokenSchema.index({ patientId: 1, isActive: 1 });
```

## 2.2 Token Registration

```typescript
@Injectable()
export class DeviceTokenService {
  constructor(private readonly tokenRepo: DeviceTokenRepository) {}

  async register(dto: RegisterDeviceTokenDto, context: TenantContext): Promise<void> {
    // Deactivate existing token if it belongs to a different user
    await this.tokenRepo.deactivateByToken(dto.token);

    await this.tokenRepo.upsert({
      token: dto.token,
      staffId: context.staffId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      platform: dto.platform,
      appType: dto.appType,
      isActive: true,
      lastUsedAt: new Date(),
    });
  }

  async unregister(token: string): Promise<void> {
    await this.tokenRepo.deactivateByToken(token);
  }

  async getActiveTokens(recipientId: string, recipientType: 'STAFF' | 'PATIENT'): Promise<string[]> {
    const field = recipientType === 'STAFF' ? 'staffId' : 'patientId';
    const devices = await this.tokenRepo.findActive({ [field]: recipientId });
    return devices.map(d => d.token);
  }
}
```

## 2.3 Token Cleanup

Invalid tokens SHALL be deactivated when FCM returns `messaging/registration-token-not-registered`:

```typescript
async handleInvalidToken(token: string): Promise<void> {
  await this.tokenRepo.deactivateByToken(token);
  this.logger.warn(`Deactivated invalid FCM token: ${token.slice(0, 10)}...`);
}
```

---

# 3. Push Notification Service

## 3.1 Send to Device

```typescript
@Injectable()
export class PushNotificationService {
  constructor(
    @Inject('FIREBASE_MESSAGING') private readonly messaging: admin.messaging.Messaging,
    private readonly deviceTokenService: DeviceTokenService,
    private readonly logger: Logger,
  ) {}

  async sendToRecipient(
    recipientId: string,
    recipientType: 'STAFF' | 'PATIENT',
    notification: PushPayload,
  ): Promise<PushResult> {
    const tokens = await this.deviceTokenService.getActiveTokens(recipientId, recipientType);

    if (tokens.length === 0) {
      return { success: false, reason: 'NO_ACTIVE_DEVICES' };
    }

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data ?? {},
      android: {
        priority: 'high',
        notification: {
          channelId: notification.channelId ?? 'default',
          sound: 'default',
        },
      },
      apns: {
        payload: {
          aps: {
            alert: { title: notification.title, body: notification.body },
            sound: 'default',
            badge: notification.badge,
          },
        },
      },
      webpush: {
        notification: {
          title: notification.title,
          body: notification.body,
          icon: '/icons/notification-icon.png',
        },
      },
    };

    const response = await this.messaging.sendEachForMulticast(message);

    // Handle failures
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
        this.deviceTokenService.handleInvalidToken(tokens[idx]);
      }
    });

    return {
      success: response.successCount > 0,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  }
}
```

## 3.2 Types

```typescript
interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  channelId?: string;
  badge?: number;
}

interface PushResult {
  success: boolean;
  reason?: string;
  successCount?: number;
  failureCount?: number;
}
```

---

# 4. Notification Channels (Android)

| Channel ID | Name | Description |
|-----------|------|-------------|
| `appointments` | Appointments | Appointment reminders and updates |
| `sessions` | Sessions | Session-related notifications |
| `leads` | Leads | New lead assignments |
| `billing` | Billing | Invoice and payment notifications |
| `default` | General | General platform notifications |

---

# 5. Integration with Notification Service

The Push adapter in the Notification Service SHALL use PushNotificationService:

```typescript
@Injectable()
export class PushAdapter implements ChannelAdapter {
  constructor(private readonly pushService: PushNotificationService) {}

  async send(notification: PreparedNotification): Promise<DeliveryResult> {
    const result = await this.pushService.sendToRecipient(
      notification.recipientId,
      notification.recipientType,
      {
        title: notification.subject,
        body: notification.body,
        data: {
          type: notification.notificationType,
          entityId: notification.entityId,
          action: notification.action ?? 'open',
        },
        channelId: this.resolveChannel(notification.notificationType),
      },
    );

    if (result.success) {
      return { success: true, providerMessageId: `fcm-${Date.now()}` };
    }

    throw new PushDeliveryError(result.reason);
  }

  private resolveChannel(notificationType: string): string {
    const channelMap: Record<string, string> = {
      APPOINTMENT_REMINDER: 'appointments',
      APPOINTMENT_CONFIRMATION: 'appointments',
      SESSION_REPORT_READY: 'sessions',
      NEW_LEAD_ASSIGNED: 'leads',
      INVOICE_READY: 'billing',
    };
    return channelMap[notificationType] ?? 'default';
  }
}
```

---

# 6. GraphQL Integration

## 6.1 Device Token Mutations

```typescript
@Resolver()
@UseGuards(AuthGuard, TenantGuard)
export class DeviceTokenResolver {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Mutation(() => Boolean)
  async registerDeviceToken(
    @Args('input') input: RegisterDeviceTokenInput,
    @CurrentUser() user: TenantContext,
  ): Promise<boolean> {
    await this.deviceTokenService.register(input, user);
    return true;
  }

  @Mutation(() => Boolean)
  async unregisterDeviceToken(
    @Args('token') token: string,
  ): Promise<boolean> {
    await this.deviceTokenService.unregister(token);
    return true;
  }
}
```

---

# 7. Health Check

```typescript
@Injectable()
export class PushHealthIndicator extends HealthIndicator {
  constructor(
    @Inject('FIREBASE_MESSAGING') private readonly messaging: admin.messaging.Messaging,
  ) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      // Dry run send to validate connectivity
      await this.messaging.send({ topic: 'health-check', notification: { title: 'ping' } }, true);
      return this.getStatus('push', true);
    } catch {
      return this.getStatus('push', false);
    }
  }
}
```

---
