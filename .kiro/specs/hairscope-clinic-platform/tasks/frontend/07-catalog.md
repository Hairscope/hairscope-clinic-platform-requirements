# Module 7: Catalog — Frontend Tasks

> **TBD (deferred).** The catalog backend currently exposes a simpler `products` model; the full CatalogItem + Treatment Kit + Routine + signature/document-generation frontend below is the **target** and is deferred until the catalog module rework is confirmed.

> Implementation tasks for the Catalog module frontend (services, medications, cosmetics, supplements, treatment kits, routines, document generation).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/catalog`

### Task 1: Catalog Service
- 1.1 Create `src/services/catalog.service.ts`
- 1.2 Add CATALOG_ITEMS_LIST query (pagination, search, filter by type/price)
- 1.3 Add GET_CATALOG_ITEM query (single by ID)
- 1.4 Add CREATE_CATALOG_ITEM mutation
- 1.5 Add UPDATE_CATALOG_ITEM mutation
- 1.6 Add DELETE_CATALOG_ITEM mutation
- 1.7 Add UPDATE_QUALIFIED_STAFF mutation (SERVICE type)

### Task 2: Treatment Kit Service
- 2.1 Create `src/services/treatment-kit.service.ts`
- 2.2 Add TREATMENT_KITS_LIST query (pagination, search)
- 2.3 Add GET_TREATMENT_KIT query (single by ID)
- 2.4 Add CREATE_TREATMENT_KIT mutation
- 2.5 Add UPDATE_TREATMENT_KIT mutation
- 2.6 Add DELETE_TREATMENT_KIT mutation

### Task 3: Routine Service
- 3.1 Create `src/services/routine.service.ts`
- 3.2 Add ROUTINE_TEMPLATES_LIST query (reusable routine library)
- 3.3 Add CREATE_ROUTINE_TEMPLATE mutation
- 3.4 Add UPDATE_ROUTINE_TEMPLATE mutation
- 3.5 Add DELETE_ROUTINE_TEMPLATE mutation

### Task 4: Signature Service
- 4.1 Create `src/services/signature.service.ts`
- 4.2 Add GET_MY_SIGNATURE query
- 4.3 Add UPLOAD_SIGNATURE mutation
- 4.4 Add DELETE_SIGNATURE mutation

---

## Section 2: Custom Hooks

**Branch:** `feature/catalog`

### Task 5: Catalog List Hook
- 5.1 Create `src/hooks/useCatalogList.ts`
- 5.2 Apollo useQuery with CATALOG_ITEMS_LIST, page size 20
- 5.3 Cursor-based pagination (loadMore via fetchMore)
- 5.4 300ms debounced search
- 5.5 Type filter (SERVICE, MEDICATION, COSMETIC, SUPPLEMENT)
- 5.6 Price range filter
- 5.7 Return `{ items, loading, error, hasNextPage, loadMore, setSearch, setFilters, refetch }`

### Task 6: Treatment Kit Hook
- 6.1 Create `src/hooks/useTreatmentKits.ts`
- 6.2 Fetch treatment kits list with search
- 6.3 Return `{ kits, loading, error, hasNextPage, loadMore, setSearch, refetch }`

---

## Section 3: Pages

**Branch:** `feature/catalog`

### Task 7: Catalog Page
- 7.1 Create `src/app/(dashboard)/catalog/page.tsx`
- 7.2 Tab navigation: Items, Treatment Kits, Routines
- 7.3 Items tab: search, type filter tabs, price filter, catalog table
- 7.4 Treatment Kits tab: search, kits grid/list
- 7.5 Routines tab: routine template library
- 7.6 Create Item / Create Kit / Create Routine buttons
- 7.7 Wrap in PermissionGate module="catalog" action="view"

---

## Section 4: Module Components

**Branch:** `feature/catalog`

### Task 8: Catalog Table
- 8.1 Create `src/components/modules/catalog/CatalogTable.tsx`
- 8.2 @tanstack/react-table: Name, Type (badge), Price, Duration (SERVICE), Actions
- 8.3 Type badges: SERVICE=blue, MEDICATION=purple, COSMETIC=pink, SUPPLEMENT=green
- 8.4 Actions dropdown: Edit, Manage Staff (SERVICE), Delete
- 8.5 Row click opens edit form/modal

### Task 9: Catalog Item Form
- 9.1 Create `src/components/modules/catalog/CatalogItemForm.tsx`
- 9.2 react-hook-form + zod: name, price required; type required
- 9.3 Type selector (SERVICE, MEDICATION, COSMETIC, SUPPLEMENT)
- 9.4 Conditional fields: duration (SERVICE), routine required (MEDICATION)
- 9.5 Image upload for item
- 9.6 External link field (optional)
- 9.7 Inline routine editor (or select from library)
- 9.8 Create and Edit modes

### Task 10: Qualified Staff Manager
- 10.1 Create `src/components/modules/catalog/QualifiedStaffManager.tsx`
- 10.2 List of currently qualified staff for a SERVICE item
- 10.3 Add staff member (search/select from clinic staff)
- 10.4 Remove staff member button
- 10.5 Call UPDATE_QUALIFIED_STAFF mutation

### Task 11: Treatment Kit Form
- 11.1 Create `src/components/modules/catalog/TreatmentKitForm.tsx`
- 11.2 react-hook-form + zod: name, price required; at least 1 item
- 11.3 Kit items list with catalog item picker
- 11.4 Routine override per kit item (optional)
- 11.5 Image upload, external link, description
- 11.6 Create and Edit modes

### Task 12: Routine Template Form
- 12.1 Create `src/components/modules/catalog/RoutineTemplateForm.tsx`
- 12.2 Product routine fields: name, dosage, schedule (TimeSlots), frequency, duration, instructions
- 12.3 Service routine fields: name, frequency, duration, totalSessions, instructions
- 12.4 TimeSlot multi-select picker component
- 12.5 Create and Edit modes

### Task 13: Delete Catalog Item Dialog
- 13.1 Create `src/components/modules/catalog/DeleteCatalogItemDialog.tsx`
- 13.2 SERVICE: show count of affected future appointments
- 13.3 Confirmation required for SERVICE with active appointments
- 13.4 Non-SERVICE: option to set INACTIVE or hard delete
- 13.5 Call DELETE_CATALOG_ITEM mutation

### Task 14: Digital Signature Manager
- 14.1 Create `src/components/modules/catalog/DigitalSignatureManager.tsx`
- 14.2 Display current signature image (if uploaded)
- 14.3 Upload new signature (PNG/JPEG, max 2MB)
- 14.4 Delete signature button with confirmation
- 14.5 Accessible from staff profile/settings

---

## Section 5: Integration

**Branch:** `feature/catalog`

### Task 15: Sidebar Navigation
- 15.1 Add Catalog link to sidebar (/catalog)
- 15.2 Wrap in PermissionGate module="catalog" action="view"
- 15.3 Use Package icon for Catalog

### Task 16: Cross-Module Integration
- 16.1 Catalog item picker used in Session Recommendations (Module 4)
- 16.2 Service list used in Appointment Booking (Module 6)
- 16.3 Digital signature check before Treatment Plan/Prescription generation
