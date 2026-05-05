# Products & Billing - Design

> **Version:** 1.0.0 | **Status:** Draft | **Branch:** designs
> **Requirements:** `requirements/modules/products.md`, `requirements/modules/billing.md`

---

## 1. Overview

Products is a per-clinic catalog used for session recommendations and prescription generation. Billing handles invoice generation triggered by `SessionCompleted`, with support for discounts, refunds, and analytics.

**Key design decisions:**
- Products are never sold through the platform - purchase links direct externally
- Medical products trigger Prescription generation in the report
- Invoice triggered by `SessionCompleted` event (not `AppointmentCompleted`)
- Invoice numbers are sequential integers scoped per clinic (atomic increment)
- Discounts: fixed amount or percentage; Total = (Subtotal - Discount) x (1 + TaxRate)
- Refunds: tracked for analytics only, no payment processing

---

## 2. Data Models

### 2.1 Product

```javascript
const ProductSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  createdBy: { type: String, required: true, ref: 'Staff' },

  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  price: { type: Number, default: null },
  currency: { type: String, default: '' },
  purchaseLink: { type: String, default: null }, // optional external URL
  productType: {
    type: String,
    enum: ['COSMETIC', 'MEDICAL'],
    required: true
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ProductSchema.index({ clinicId: 1, productType: 1, isActive: 1 });
ProductSchema.index({ clinicId: 1, name: 'text' }); // text search
```

### 2.2 Invoice

```javascript
const LineItemSchema = new Schema({
  type: { type: String, enum: ['SERVICE', 'PRODUCT', 'MISC_CHARGE'], required: true },
  referenceId: { type: String, default: null }, // serviceId or productId
  description: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  amount: { type: Number, required: true } // quantity * unitPrice
}, { _id: false });

const DiscountSchema = new Schema({
  description: { type: String, required: true },
  discountType: { type: String, enum: ['FIXED', 'PERCENTAGE'], required: true },
  value: { type: Number, required: true }, // amount or percentage (0-100)
  amount: { type: Number, required: true } // computed discount amount
}, { _id: false });

const RefundSchema = new Schema({
  id: { type: String, default: () => uuidv4() },
  amount: { type: Number, required: true },
  reason: { type: String, required: true },
  refundDate: { type: Date, required: true },
  recordedBy: { type: String, required: true, ref: 'Staff' },
  recordedAt: { type: Date, default: Date.now }
}, { _id: false });

const InvoiceSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  patientId: { type: String, required: true, ref: 'Patient' },
  sessionId: { type: String, required: true, ref: 'Session' },
  createdBy: { type: String, default: 'SYSTEM', ref: 'Staff' }, // attribution

  // Sequential invoice number per clinic
  invoiceNumber: { type: Number, required: true },

  // Line items
  lineItems: [LineItemSchema],
  discounts: [DiscountSchema],

  // Computed totals (stored for immutability after finalization)
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  taxableAmount: { type: Number, required: true },
  taxRate: { type: Number, required: true }, // percentage at time of invoice
  taxAmount: { type: Number, required: true },
  total: { type: Number, required: true },
  currency: { type: String, required: true },

  // Status
  status: {
    type: String,
    enum: ['DRAFT', 'FINALIZED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'DRAFT'
  },

  // Refunds
  refunds: [RefundSchema],
  totalRefunded: { type: Number, default: 0 },

  // PDF
  pdfUrl: { type: String, default: null },
  finalizedAt: { type: Date, default: null },
  finalizedBy: { type: String, default: null, ref: 'Staff' }
}, { timestamps: true });

// Sequential invoice number per clinic (unique)
InvoiceSchema.index({ clinicId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ clinicId: 1, status: 1 });
InvoiceSchema.index({ patientId: 1 });
InvoiceSchema.index({ sessionId: 1 }, { unique: true }); // one invoice per session
```

---

## 3. Key Flows

### 3.1 Invoice Generation (triggered by SessionCompleted event)

```javascript
// Consumed from event bus via Outbox Dispatcher
async function handleSessionCompleted(event) {
  const { sessionId, patientId, clinicId, appointmentId } = event.payload;

  // Check if invoice already exists (idempotency)
  const existing = await Invoice.findOne({ sessionId });
  if (existing) return; // already processed

  const session = await Session.findById(sessionId).populate('productRecommendations');
  const clinic = await Clinic.findById(clinicId);

  // Build line items
  const lineItems = [];

  // Service line item (from linked appointment if exists)
  if (appointmentId) {
    const appointment = await Appointment.findById(appointmentId).populate('service');
    if (appointment?.service) {
      lineItems.push({
        type: 'SERVICE',
        referenceId: appointment.service._id,
        description: appointment.service.name,
        quantity: 1,
        unitPrice: appointment.service.price,
        amount: appointment.service.price
      });
    }
  }

  // Product line items
  for (const rec of session.productRecommendations) {
    const product = await Product.findById(rec.productId);
    if (product?.price) {
      lineItems.push({
        type: 'PRODUCT',
        referenceId: product._id,
        description: product.name,
        quantity: 1,
        unitPrice: product.price,
        amount: product.price
      });
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxRate = clinic.taxRate || 0;
  const taxableAmount = subtotal;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;

  // Get next invoice number (atomic increment on Clinic)
  const updatedClinic = await Clinic.findByIdAndUpdate(
    clinicId,
    { $inc: { invoiceSequence: 1 } },
    { new: true }
  );

  await mongoose.startSession().then(async (dbSession) => {
    await dbSession.withTransaction(async () => {
      await Invoice.create([{
        clinicId, organizationId: clinic.organizationId,
        patientId, sessionId,
        invoiceNumber: updatedClinic.invoiceSequence,
        lineItems, discounts: [],
        subtotal, discountAmount: 0, taxableAmount,
        taxRate, taxAmount, total,
        currency: lineItems[0]?.currency || clinic.defaultCurrency || 'USD',
        status: 'DRAFT'
      }], { session: dbSession });

      await AuditLog.create([{ action: 'INVOICE_GENERATED', resourceId: sessionId, ... }],
        { session: dbSession }
      );
      await OutboxEvent.create([{
        eventType: 'InvoiceGenerated',
        aggregateType: 'INVOICE',
        aggregateId: sessionId,
        payload: { sessionId, patientId, clinicId }
      }], { session: dbSession });
    });
  });
}
```

### 3.2 Invoice Total Calculation

```javascript
function recalculateTotals(lineItems, discounts, taxRate) {
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);

  const discountAmount = discounts.reduce((sum, d) => {
    if (d.discountType === 'FIXED') return sum + d.value;
    if (d.discountType === 'PERCENTAGE') return sum + (subtotal * d.value / 100);
    return sum;
  }, 0);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = Math.max(0, taxableAmount + taxAmount); // clamped to 0

  return { subtotal, discountAmount, taxableAmount, taxAmount, total };
}
```

---

## 4. GraphQL Schema

### 4.1 Types

```graphql
type Product {
  id: UUID!
  clinicId: UUID!
  name: String!
  description: String
  imageUrl: URL
  price: Float
  currency: String
  purchaseLink: URL
  productType: ProductType!
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Invoice {
  id: UUID!
  clinicId: UUID!
  patientId: UUID!
  sessionId: UUID!
  invoiceNumber: Int!
  lineItems: [InvoiceLineItem!]!
  discounts: [InvoiceDiscount!]!
  subtotal: Float!
  discountAmount: Float!
  taxableAmount: Float!
  taxRate: Float!
  taxAmount: Float!
  total: Float!
  currency: String!
  status: InvoiceStatus!
  refunds: [InvoiceRefund!]!
  totalRefunded: Float!
  pdfUrl: URL
  finalizedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type InvoiceLineItem {
  type: String!
  referenceId: UUID
  description: String!
  quantity: Int!
  unitPrice: Float!
  amount: Float!
}

type InvoiceDiscount {
  description: String!
  discountType: String!
  value: Float!
  amount: Float!
}

type InvoiceRefund {
  id: UUID!
  amount: Float!
  reason: String!
  refundDate: DateTime!
  recordedBy: UUID!
  recordedAt: DateTime!
}

type InvoiceConnection {
  edges: [InvoiceEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type InvoiceEdge {
  cursor: String!
  node: Invoice!
}

type BillingAnalytics {
  clinicId: UUID
  dateFrom: DateTime!
  dateTo: DateTime!
  totalRevenue: Float!
  totalRefunded: Float!
  netRevenue: Float!
  invoiceCount: Int!
  currency: String!
}
```

### 4.2 Queries

```graphql
type Query {
  products(
    clinicId: UUID!
    productType: ProductType
    search: String
    activeOnly: Boolean
  ): [Product!]!

  product(id: UUID!): Product

  invoices(
    clinicId: UUID!
    status: InvoiceStatus
    dateFrom: DateTime
    dateTo: DateTime
    first: Int
    after: String
  ): InvoiceConnection!

  invoice(id: UUID!): Invoice

  billingAnalytics(
    clinicId: UUID    # null = all clinics (Org Admin only)
    dateFrom: DateTime!
    dateTo: DateTime!
  ): BillingAnalytics!
}
```

### 4.3 Mutations

```graphql
type Mutation {
  # Products (Clinic_Admin + Org_Admin)
  createProduct(input: CreateProductInput!): Product!
  updateProduct(id: UUID!, input: UpdateProductInput!): Product!
  deleteProduct(id: UUID!): Boolean!

  # Invoice editing (DRAFT only)
  addMiscCharge(invoiceId: UUID!, input: MiscChargeInput!): Invoice!
  updateMiscCharge(invoiceId: UUID!, lineItemIndex: Int!, input: MiscChargeInput!): Invoice!
  removeMiscCharge(invoiceId: UUID!, lineItemIndex: Int!): Invoice!
  addDiscount(invoiceId: UUID!, input: DiscountInput!): Invoice!
  updateDiscount(invoiceId: UUID!, discountIndex: Int!, input: DiscountInput!): Invoice!
  removeDiscount(invoiceId: UUID!, discountIndex: Int!): Invoice!

  # Finalization
  finalizeInvoice(invoiceId: UUID!): Invoice!

  # Refunds (FINALIZED only)
  recordRefund(invoiceId: UUID!, input: RefundInput!): Invoice!

  # PDF
  generateInvoicePdf(invoiceId: UUID!): AsyncOperation!
}

input CreateProductInput {
  clinicId: UUID!
  name: String!
  description: String
  price: Float
  currency: String
  purchaseLink: URL
  productType: ProductType!
}

input MiscChargeInput {
  description: String!
  amount: Float!
}

input DiscountInput {
  description: String!
  discountType: String!  # FIXED or PERCENTAGE
  value: Float!
}

input RefundInput {
  amount: Float!
  reason: String!
  refundDate: DateTime!
}
```

---

## 5. Access Control

| Operation | Allowed |
|-----------|---------|
| `products` query | Staff with `products.view` |
| `createProduct`, `updateProduct`, `deleteProduct` | Clinic_Admin, Org_Admin |
| `invoices` query | Staff with `billing.view` |
| `billingAnalytics` | Clinic_Admin (own clinic), Org_Admin (all clinics) |
| `addMiscCharge`, `addDiscount`, `finalizeInvoice` | Staff with `billing.edit` |
| `recordRefund` | Staff with `billing.edit` |
| Organization_Admin | No access to products or billing |

---

## 6. Invariant Enforcement

| Invariant | Enforcement |
|-----------|-------------|
| GI-22: Sequential invoice numbers per clinic | Atomic `$inc` on `Clinic.invoiceSequence` |
| GI-23: Finalized invoice immutable | `addMiscCharge`, `addDiscount` check `status = DRAFT` |
| One invoice per session | Unique index on `sessionId` + idempotency check in handler |
| Total clamped to 0 | `Math.max(0, ...)` in `recalculateTotals` |
| Refund cannot exceed total | `recordRefund` validates `amount + totalRefunded <= total` |
