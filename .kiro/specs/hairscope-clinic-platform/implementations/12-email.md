# Email

> Covers: SMTP2Go integration via Nodemailer, email templates, transactional email types, delivery tracking, and configuration.

---

# 1. SMTP2Go Configuration

## 1.1 Nodemailer Transport

Email SHALL be sent via SMTP2Go using Nodemailer:

```typescript
import { createTransport, Transporter } from 'nodemailer';

@Module({
  providers: [
    {
      provide: 'EMAIL_TRANSPORT',
      useFactory: (config: ConfigService): Transporter => {
        return createTransport({
          host: config.get('SMTP_HOST', 'mail.smtp2go.com'),
          port: config.get('SMTP_PORT', 2525),
          secure: false,
          auth: {
            user: config.get('SMTP_USER'),
            pass: config.get('SMTP_PASS'),
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
        });
      },
      inject: [ConfigService],
    },
    EmailService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
```

## 1.2 Environment Variables

```env
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=2525
SMTP_USER=hairscope-platform
SMTP_PASS=<smtp2go-api-key>
EMAIL_FROM_NAME=Hairscope
EMAIL_FROM_ADDRESS=noreply@hairscope.ai
```

---

# 2. Email Service

## 2.1 Core Service

```typescript
@Injectable()
export class EmailService {
  constructor(
    @Inject('EMAIL_TRANSPORT') private readonly transporter: Transporter,
    private readonly config: ConfigService,
    private readonly logger: Logger,
  ) {}

  async send(options: SendEmailOptions): Promise<EmailResult> {
    const from = `${this.config.get('EMAIL_FROM_NAME')} <${this.config.get('EMAIL_FROM_ADDRESS')}>`;

    try {
      const result = await this.transporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        headers: {
          'X-Organization-Id': options.organizationId,
          'X-Notification-Id': options.notificationId,
        },
      });

      this.logger.log(`Email sent to ${options.to}, messageId: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      this.logger.error(`Email failed to ${options.to}: ${error.message}`);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
```

## 2.2 Types

```typescript
interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  organizationId: string;
  notificationId?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
```

---

# 3. Email Types

## 3.1 Transactional Emails

| Email Type | Trigger | Recipient |
|-----------|---------|-----------|
| Staff Invite | Staff invited to organization | Invited staff |
| Password Reset | Password reset requested | Staff member |
| Appointment Reminder | ReminderDue event | Patient/Lead |
| Appointment Confirmation | AppointmentBooked event | Patient/Lead |
| Appointment Cancellation | AppointmentCancelled event | Patient/Lead |
| Session Report Ready | ReportGenerated event | Patient |
| Invoice | InvoiceFinalized event | Patient |

## 3.2 System Emails

| Email Type | Trigger | Recipient |
|-----------|---------|-----------|
| Failed Event Alert | Event processing failure threshold | Operations team |
| Worker Health Alert | Worker health check failure | Operations team |

---

# 4. Template Rendering

## 4.1 Handlebars Templates

Email templates SHALL use Handlebars for rendering:

```typescript
@Injectable()
export class EmailTemplateRenderer {
  private readonly templates: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templateDir = path.join(__dirname, 'templates');
    const files = readdirSync(templateDir).filter(f => f.endsWith('.hbs'));

    for (const file of files) {
      const name = path.basename(file, '.hbs');
      const content = readFileSync(path.join(templateDir, file), 'utf-8');
      this.templates.set(name, Handlebars.compile(content));
    }
  }

  render(templateName: string, variables: Record<string, any>): RenderedEmail {
    const template = this.templates.get(templateName);
    if (!template) throw new TemplateNotFoundError(templateName);

    const subjectTemplate = this.templates.get(`${templateName}-subject`);
    const subject = subjectTemplate ? subjectTemplate(variables) : '';
    const html = template(variables);

    return { subject, html };
  }
}
```

## 4.2 Template Structure

```text
packages/worker-notification/src/templates/
├── appointment-reminder.hbs
├── appointment-reminder-subject.hbs
├── appointment-confirmation.hbs
├── appointment-confirmation-subject.hbs
├── appointment-cancellation.hbs
├── appointment-cancellation-subject.hbs
├── staff-invite.hbs
├── staff-invite-subject.hbs
├── password-reset.hbs
├── password-reset-subject.hbs
├── report-ready.hbs
├── report-ready-subject.hbs
├── invoice.hbs
├── invoice-subject.hbs
└── partials/
    ├── header.hbs
    ├── footer.hbs
    └── button.hbs
```

## 4.3 Template Example

```handlebars
{{!-- appointment-reminder.hbs --}}
{{> header}}

<div style="padding: 24px; font-family: 'Inter', sans-serif;">
  <h2>Appointment Reminder</h2>
  <p>Hi {{patientName}},</p>
  <p>This is a reminder for your upcoming appointment:</p>

  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr>
      <td style="padding: 8px; font-weight: bold;">Date:</td>
      <td style="padding: 8px;">{{appointmentDate}}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Time:</td>
      <td style="padding: 8px;">{{appointmentTime}}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Clinic:</td>
      <td style="padding: 8px;">{{clinicName}}</td>
    </tr>
    <tr>
      <td style="padding: 8px; font-weight: bold;">Doctor:</td>
      <td style="padding: 8px;">{{doctorName}}</td>
    </tr>
  </table>

  {{#if rescheduleUrl}}
  <p>Need to reschedule?</p>
  {{> button text="Reschedule Appointment" url=rescheduleUrl}}
  {{/if}}
</div>

{{> footer}}
```

---

# 5. Integration with Notification Service

The Email adapter in the Notification Service SHALL use the EmailService:

```typescript
@Injectable()
export class EmailAdapter implements ChannelAdapter {
  constructor(private readonly emailService: EmailService) {}

  async send(notification: PreparedNotification): Promise<DeliveryResult> {
    const result = await this.emailService.send({
      to: notification.recipientEmail,
      subject: notification.subject,
      html: notification.body,
      organizationId: notification.organizationId,
      notificationId: notification.id,
    });

    if (result.success) {
      return { success: true, providerMessageId: result.messageId };
    }

    throw new EmailDeliveryError(result.error);
  }
}
```

---

# 6. Direct Emails (Non-Notification)

Some emails are sent directly without going through the Notification Service:

- Staff Invite emails (sent by IAM module)
- Password Reset emails (sent by Auth module)

These SHALL use the EmailService directly:

```typescript
// In AuthService
async requestPasswordReset(email: string): Promise<void> {
  const staff = await this.staffRepo.findByEmail(email);
  if (!staff) return; // Silent fail to prevent enumeration

  const token = this.generateResetToken();
  await this.resetTokenRepo.create({ staffId: staff.id, tokenHash: await argon2.hash(token) });

  const resetUrl = `${this.config.get('APP_URL')}/reset-password?token=${token}`;

  await this.emailService.send({
    to: email,
    subject: 'Reset your Hairscope password',
    html: this.templateRenderer.render('password-reset', {
      staffName: staff.fullName,
      resetUrl,
      expiresIn: '24 hours',
    }).html,
    organizationId: staff.organizationId,
  });
}
```

---

# 7. Health Check

```typescript
@Injectable()
export class EmailHealthIndicator extends HealthIndicator {
  constructor(private readonly emailService: EmailService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const connected = await this.emailService.verifyConnection();
    return this.getStatus('email', connected);
  }
}
```

---
