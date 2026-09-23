# Catalog Module Implementation

> Covers: Catalog items (SERVICE/MEDICATION/COSMETIC/SUPPLEMENT), Treatment Kits, Routines with dosage/frequency/duration/timeSlots, qualified staff, and pricing.

> **Current code vs target design.** The backend currently implements a simpler `products` collection (type `SERVICE`/`MEDICINE`/`COSMETIC`/`SUPPLEMENT`, with `purchaseLink` and `isActive`) — see `18-collection-schemas.md`. The richer CatalogItem + Treatment Kit + structured Routine model described below is the **target**; the full design (including `MEDICATION` vs `MEDICINE` naming, routines, kits, qualified staff, and document generation ownership) will be finalized when the catalog module is reworked in code.

---

# 1. Module Structure

```text
packages/api/src/modules/catalog/
├── catalog.module.ts
├── entities/
│   ├── catalog-item.schema.ts
│   └── treatment-kit.schema.ts
├── repositories/
│   ├── catalog-item.repository.ts
│   └── treatment-kit.repository.ts
├── services/
│   ├── catalog-item.service.ts
│   └── treatment-kit.service.ts
├── resolvers/
│   ├── catalog-item.resolver.ts
│   └── treatment-kit.resolver.ts
└── dto/
    ├── create-catalog-item.input.ts
    ├── update-catalog-item.input.ts
    ├── create-treatment-kit.input.ts
    └── update-treatment-kit.input.ts
```

---

# 2. Catalog Item Schema

```typescript
const CatalogItemSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['SERVICE', 'MEDICATION', 'COSMETIC', 'SUPPLEMENT'],
    required: true,
  },
  price: { type: Number, required: true },
  currency: { type: String, required: true }, // Inherited from clinic at creation
  durationMinutes: { type: Number }, // For SERVICE type
  dosageOptions: [{ type: String }], // For MEDICATION/COSMETIC/SUPPLEMENT
  frequencyOptions: [{ type: String }], // e.g., "every 2 weeks", "daily"
  durationOptions: [{ type: String }], // e.g., "6 months", "30 days"
  timeSlotOptions: [{ type: String }], // e.g., "morning", "evening", "before meals"
  instructions: { type: String },
  qualifiedStaff: [{ type: Schema.Types.ObjectId, ref: 'Staff' }],
  isActive: { type: Boolean, default: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

CatalogItemSchema.index({ clinicId: 1, type: 1, isActive: 1 });
CatalogItemSchema.index({ clinicId: 1, name: 'text' });
```

---

# 3. Treatment Kit Schema

```typescript
const TreatmentKitSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  items: [{
    catalogItemId: { type: Schema.Types.ObjectId, required: true, ref: 'CatalogItem' },
    dosage: { type: String },
    frequency: { type: String },
    duration: { type: String },
    timeSlots: [{ type: String }],
    instructions: { type: String },
  }],
  totalPrice: { type: Number },
  discountedPrice: { type: Number },
  isActive: { type: Boolean, default: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId },
});

TreatmentKitSchema.index({ clinicId: 1, isActive: 1 });
```

---

# 4. Catalog Item Service

```typescript
@Injectable()
export class CatalogItemService {
  async create(dto: CreateCatalogItemDto, context: TenantContext): Promise<CatalogItem> {
    // Validate clinic has currency configured
    const clinic = await this.clinicRepo.findById(context.clinicId, context);
    if (!clinic.currency) throw new ClinicCurrencyNotSetError();

    const item = await this.catalogItemRepo.create({
      ...dto,
      currency: clinic.currency,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.staffId,
    });

    await this.auditService.append('CATALOG_ITEM_CREATED', { itemId: item.id });
    return item;
  }

  async update(itemId: string, dto: UpdateCatalogItemDto, context: TenantContext): Promise<CatalogItem> {
    const item = await this.catalogItemRepo.findById(itemId, context);
    if (!item) throw new NotFoundError('CatalogItem');

    const updated = await this.catalogItemRepo.update(itemId, dto, context);

    await this.auditService.append('CATALOG_ITEM_UPDATED', { itemId, changes: dto });
    return updated;
  }

  async deactivate(itemId: string, context: TenantContext): Promise<CatalogItem> {
    const item = await this.catalogItemRepo.findById(itemId, context);
    if (!item) throw new NotFoundError('CatalogItem');

    const updated = await this.catalogItemRepo.update(itemId, { isActive: false }, context);

    // Emit event for downstream consumers (e.g., cancel future appointments using this service)
    await this.outboxRepo.insert({
      eventType: 'CatalogItemDeactivated',
      aggregateId: itemId,
      aggregateType: 'CatalogItem',
      payload: { itemId, type: item.type, clinicId: context.clinicId },
    });

    return updated;
  }

  async getQualifiedStaff(serviceId: string, context: TenantContext): Promise<Staff[]> {
    const item = await this.catalogItemRepo.findById(serviceId, context);
    if (!item || item.type !== 'SERVICE') throw new NotFoundError('Service');

    return this.staffRepo.findByIds(item.qualifiedStaff, context);
  }
}
```

---

# 5. Treatment Kit Service

```typescript
@Injectable()
export class TreatmentKitService {
  async create(dto: CreateTreatmentKitDto, context: TenantContext): Promise<TreatmentKit> {
    // Validate all items exist and are active
    for (const item of dto.items) {
      const catalogItem = await this.catalogItemRepo.findById(item.catalogItemId, context);
      if (!catalogItem || !catalogItem.isActive) {
        throw new InvalidCatalogItemError(item.catalogItemId);
      }
    }

    // Calculate total price
    const totalPrice = await this.calculateTotalPrice(dto.items, context);

    const kit = await this.treatmentKitRepo.create({
      ...dto,
      totalPrice,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      createdBy: context.staffId,
    });

    await this.auditService.append('TREATMENT_KIT_CREATED', { kitId: kit.id });
    return kit;
  }

  private async calculateTotalPrice(items: KitItem[], context: TenantContext): Promise<number> {
    let total = 0;
    for (const item of items) {
      const catalogItem = await this.catalogItemRepo.findById(item.catalogItemId, context);
      total += catalogItem.price;
    }
    return total;
  }
}
```

---

# 6. Visibility

Catalog items and Treatment Kits are NOT affected by visibility mode — they are shared clinic resources visible to all staff with `catalog.view` permission.

---

# 7. Module Registration

```typescript
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CatalogItem.name, schema: CatalogItemSchema },
      { name: TreatmentKit.name, schema: TreatmentKitSchema },
    ]),
  ],
  providers: [
    CatalogItemService,
    TreatmentKitService,
    CatalogItemRepository,
    TreatmentKitRepository,
    CatalogItemResolver,
    TreatmentKitResolver,
  ],
  exports: [CatalogItemService, CatalogItemRepository],
})
export class CatalogModule {}
```

---
