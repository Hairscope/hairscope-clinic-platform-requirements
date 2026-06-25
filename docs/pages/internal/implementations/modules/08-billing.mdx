# Billing Module Implementation

> Covers: Invoice lifecycle, line items from sessions/catalog, payment status recording (no payment processing), and invoice PDF generation.

> **Status: not yet implemented in code.** This document reflects the agreed billing model and will be refined when the module is actually built. Key decisions captured below:
> - The platform does **not** process payments and does **not** store card numbers or bank account details. It records the **amount**, references (patient, session, catalog items), the invoice **status**, and a free-text payment **method** label (`CASH` / `CARD` / `BANK_TRANSFER` / `OTHER`).
> - Invoices are created from a manual **"Generate Invoice"** action in the frontend — **not** automatically on `SessionCompleted` and **not** on `TreatmentPlanSigned`.
> - Invoice lifecycle: `DRAFT → ISSUED → PAID → REFUNDED / PARTIALLY_REFUNDED`, plus `CANCELLED`.
> - If an invoice is wrong, staff **cancel** it (`CANCELLED`) and generate a fresh one rather than mutating an issued invoice.

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
    enum: ['DRAFT', 'ISSUED', 'PAID', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CANCELLED'],
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
  method: { type: String, enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'OTHER'], required: true }, // text label only — NO card/bank details stored
  reference: { type: String }, // optional free-text reference (e.g. receipt no.), never card/account numbers
  paidAt: { type: Date, default: Date.now },
  organizationId: { type: Schema.Types.ObjectId, required: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  recordedBy: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});
```

---

# 4. Invoice Service

> The `finalize`/`recordPayment` methods below are illustrative and predate the agreed model. Under the current model, "finalize" corresponds to transitioning `DRAFT → ISSUED`, payment recording sets `ISSUED → PAID`, and a wrong invoice is moved to `CANCELLED` (then regenerated). Method names and refund handling (`REFUNDED` / `PARTIALLY_REFUNDED`) will be aligned when the module is implemented.

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
      invoice.status = 'ISSUED'; // remains ISSUED until fully paid (no partial-payment status in the model)
    }

    await this.invoiceRepo.save(invoice, context);
    await this.auditService.append('PAYMENT_RECORDED', { invoiceId: dto.invoiceId, amount: dto.amount });

    return payment;
  }
}
```

---

# 6. Invoice Generation Trigger

Invoice creation is **manual**: a staff member clicks **"Generate Invoice"** in the frontend, which calls `createFromSession` (or a standalone-invoice mutation). Invoices are **not** created automatically on `SessionCompleted` or `TreatmentPlanSigned`.

When generating from a session, line items are pre-populated from the session's recommended catalog items (and the linked appointment's SERVICE, if any); staff then review, adjust, and `ISSUE` the invoice. Signed Treatment Plan / Prescription documents may be used as a **source for suggested line items** at generation time, but signing them does not itself create or mutate an invoice.

If an issued invoice is wrong, staff **cancel** it (status → `CANCELLED`) and generate a new one — issued invoices are not edited in place.

The illustrative line-item population below shows how catalog references map to line items at generation time:

```typescript
@Injectable()
export class BillingEventHandler {
  // Illustrative: builds line items from a session's signed treatment plan when the
  // staff triggers "Generate Invoice". Not an automatic event subscription.
  async buildLineItemsFromTreatmentPlan(planId: string, context: TenantContext): Promise<InvoiceLineItem[]> {
    const plan = await this.treatmentPlanRepo.findById(planId, context);
    return Promise.all(
      plan.routines.map(async (routine) => ({
        description: routine.itemName,
        catalogItemId: routine.catalogItemId,
        quantity: 1,
        unitPrice: await this.getCatalogItemPrice(routine.catalogItemId),
        total: await this.getCatalogItemPrice(routine.catalogItemId),
      })),
    );
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
