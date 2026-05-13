# Billing Module Implementation

> Covers: Invoice lifecycle, line items from sessions/treatment plans, payment recording, auto-sync with sessions, and invoice PDF generation trigger.

---

# 1. Module Structure

```text
packages/api/src/modules/billing/
├── billing.module.ts
├── entities/
│   ├── invoice.schema.ts
│   └── payment.schema.ts
├── repositories/
│   ├── invoice.repository.ts
│   └── payment.repository.ts
├── services/
│   ├── invoice.service.ts
│   └── payment.service.ts
├── resolvers/
│   ├── invoice.resolver.ts
│   └── payment.resolver.ts
├── dto/
│   ├── create-invoice.input.ts
│   ├── add-line-item.input.ts
│   └── record-payment.input.ts
└── events/
    └── billing-event.handler.ts
```

---

# 2. Invoice Schema

```typescript
const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true },
  patientId: { type: Schema.Types.ObjectId, required: true, index: true },
  sessionId: { type: Schema.Types.ObjectId, index: true },
  status: {
    type: String,
    enum: ['DRAFT', 'FINALIZED', 'PARTIALLY_PAID', 'PAID', 'VOID'],
    default: 'DRAFT',
  },
  lineItems: [{
    description: { type: String, required: true },
    catalogItemId: { type: Schema.Types.ObjectId },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    total: { type: Number, required: true },
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  amountPaid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  currency: { type: String, required: true },
  dueDate: { type: Date },
  finalizedAt: { type: Date },
  pdfUrl: { type: String },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

InvoiceSchema.index({ clinicId: 1, patientId: 1, status: 1 });
InvoiceSchema.index({ clinicId: 1, invoiceNumber: 1 }, { unique: true });
```

---

# 3. Payment Schema

```typescript
const PaymentSchema = new Schema({
  invoiceId: { type: Schema.Types.ObjectId, required: true, index: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER'], required: true },
  reference: { type: String },
  paidAt: { type: Date, default: Date.now },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  recordedBy: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

---

# 4. Invoice Service

```typescript
@Injectable()
export class InvoiceService {
  async createFromSession(sessionId: string, context: TenantContext): Promise<Invoice> {
    const session = await this.sessionRepo.findById(sessionId, context);
    if (!session) throw new NotFoundError('Session');

    const invoiceNumber = await this.generateInvoiceNumber(context);
    const clinic = await this.clinicRepo.findById(context.clinicId, context);

    const invoice = await this.invoiceRepo.create({
      invoiceNumber,
      patientId: session.patientId,
      sessionId,
      status: 'DRAFT',
      lineItems: [],
      subtotal: 0,
      tax: 0,
      discount: 0,
      total: 0,
      amountPaid: 0,
      balance: 0,
      currency: clinic.currency,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.staffId,
    });

    return invoice;
  }

  async addLineItem(invoiceId: string, dto: AddLineItemDto, context: TenantContext): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findById(invoiceId, context);
    if (!invoice) throw new NotFoundError('Invoice');
    if (invoice.status !== 'DRAFT') throw new InvoiceFinalizedError();

    const lineItem = {
      description: dto.description,
      catalogItemId: dto.catalogItemId,
      quantity: dto.quantity,
      unitPrice: dto.unitPrice,
      total: dto.quantity * dto.unitPrice,
    };

    invoice.lineItems.push(lineItem);
    this.recalculateTotals(invoice);

    return this.invoiceRepo.save(invoice, context);
  }

  async finalize(invoiceId: string, context: TenantContext): Promise<Invoice> {
    const invoice = await this.invoiceRepo.findById(invoiceId, context);
    if (!invoice) throw new NotFoundError('Invoice');
    if (invoice.status !== 'DRAFT') throw new InvoiceAlreadyFinalizedError();

    const session_tx = await this.connection.startSession();
    session_tx.startTransaction();

    try {
      const finalized = await this.invoiceRepo.update(invoiceId, {
        status: 'FINALIZED',
        finalizedAt: new Date(),
      }, context, { session: session_tx });

      await this.auditService.append('INVOICE_FINALIZED', { invoiceId }, { session: session_tx });
      await this.outboxRepo.insert({
        eventType: 'InvoiceFinalized',
        aggregateId: invoiceId,
        aggregateType: 'Invoice',
        payload: {
          invoiceId,
          patientId: invoice.patientId,
          total: invoice.total,
          organizationId: context.organizationId,
          clinicId: context.clinicId,
        },
      }, { session: session_tx });

      await session_tx.commitTransaction();
      return finalized;
    } catch (error) {
      await session_tx.abortTransaction();
      throw error;
    } finally {
      session_tx.endSession();
    }
  }

  private recalculateTotals(invoice: Invoice): void {
    invoice.subtotal = invoice.lineItems.reduce((sum, item) => sum + item.total, 0);
    invoice.total = invoice.subtotal + invoice.tax - invoice.discount;
    invoice.balance = invoice.total - invoice.amountPaid;
  }

  private async generateInvoiceNumber(context: TenantContext): Promise<string> {
    const count = await this.invoiceRepo.countByClinic(context.clinicId);
    const prefix = 'INV';
    return `${prefix}-${String(count + 1).padStart(6, '0')}`;
  }
}
```

---

# 5. Payment Service

```typescript
@Injectable()
export class PaymentService {
  async recordPayment(dto: RecordPaymentDto, context: TenantContext): Promise<Payment> {
    const invoice = await this.invoiceRepo.findById(dto.invoiceId, context);
    if (!invoice) throw new NotFoundError('Invoice');
    if (invoice.status === 'DRAFT') throw new InvoiceNotFinalizedError();
    if (invoice.status === 'PAID') throw new InvoiceAlreadyPaidError();

    const payment = await this.paymentRepo.create({
      invoiceId: dto.invoiceId,
      amount: dto.amount,
      method: dto.method,
      reference: dto.reference,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      recordedBy: context.staffId,
    });

    // Update invoice
    invoice.amountPaid += dto.amount;
    invoice.balance = invoice.total - invoice.amountPaid;

    if (invoice.balance <= 0) {
      invoice.status = 'PAID';
    } else {
      invoice.status = 'PARTIALLY_PAID';
    }

    await this.invoiceRepo.save(invoice, context);
    await this.auditService.append('PAYMENT_RECORDED', { invoiceId: dto.invoiceId, amount: dto.amount });

    return payment;
  }
}
```

---

# 6. Event Handlers

```typescript
@Injectable()
export class BillingEventHandler {
  @OnEvent('SessionCompleted')
  async handleSessionCompleted(event: SessionCompletedEvent): Promise<void> {
    if (await this.idempotencyStore.isDuplicate(event.eventId)) return;

    // Auto-create invoice for completed session
    await this.invoiceService.createFromSession(event.payload.sessionId, {
      staffId: event.payload.doctorId,
      organizationId: event.payload.organizationId,
      clinicId: event.payload.clinicId,
    });

    await this.idempotencyStore.markProcessed(event.eventId);
  }

  @OnEvent('TreatmentPlanSigned')
  async handleTreatmentPlanSigned(event: TreatmentPlanSignedEvent): Promise<void> {
    if (await this.idempotencyStore.isDuplicate(event.eventId)) return;

    // Auto-add treatment plan items to invoice
    const plan = await this.treatmentPlanRepo.findById(event.payload.planId);
    const invoice = await this.invoiceRepo.findBySession(event.payload.sessionId);

    if (invoice && invoice.status === 'DRAFT') {
      for (const routine of plan.routines) {
        await this.invoiceService.addLineItem(invoice.id, {
          description: routine.itemName,
          catalogItemId: routine.catalogItemId,
          quantity: 1,
          unitPrice: await this.getCatalogItemPrice(routine.catalogItemId),
        }, { organizationId: plan.organizationId, clinicId: plan.clinicId });
      }
    }

    await this.idempotencyStore.markProcessed(event.eventId);
  }
}
```

---

# 7. Visibility

Invoice visibility follows the linked Session — if a staff member can see the session, they can see its invoice (in RESTRICTED mode).

---

# 8. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  providers: [
    InvoiceService,
    PaymentService,
    BillingEventHandler,
    InvoiceRepository,
    PaymentRepository,
    InvoiceResolver,
    PaymentResolver,
  ],
  exports: [InvoiceService, InvoiceRepository],
})
export class BillingModule {}
```

---
