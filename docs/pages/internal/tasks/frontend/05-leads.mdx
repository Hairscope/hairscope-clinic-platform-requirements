# Module 5: Leads — Frontend Tasks

> Implementation tasks for the Leads module frontend (lead management, status pipeline, actions, conversion, distribution, webhooks).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/leads`

### Task 1: Lead Service
- [ ] 1.1 Create `src/services/lead.service.ts`
- [ ] 1.2 Add LEADS_LIST query (pagination, search, filters by status/priority/tags)
- [ ] 1.3 Add GET_LEAD query (full profile by ID)
- [ ] 1.4 Add CREATE_LEAD mutation
- [ ] 1.5 Add UPDATE_LEAD mutation (status, priority, tags)
- [ ] 1.6 Add CONVERT_LEAD_TO_PATIENT mutation
- [ ] 1.7 Add REASSIGN_LEAD mutation
- [ ] 1.8 Add ADD_LEAD_ACTION mutation
- [ ] 1.9 Add GET_LEAD_ACTIONS query (by leadId)

### Task 2: Unassigned Leads Service
- [ ] 2.1 Add GET_UNASSIGNED_LEADS query (OrganizationAdmin only)
- [ ] 2.2 Add ASSIGN_CLINIC_TO_LEAD mutation

### Task 3: Webhook Configuration Service
- [ ] 3.1 Create `src/services/webhook.service.ts`
- [ ] 3.2 Add GET_WEBHOOK_SOURCES query
- [ ] 3.3 Add CREATE_WEBHOOK_SOURCE mutation
- [ ] 3.4 Add UPDATE_WEBHOOK_SOURCE mutation
- [ ] 3.5 Add DELETE_WEBHOOK_SOURCE mutation

---

## Section 2: Custom Hooks

**Branch:** `feature/leads`

### Task 4: Lead List Hook
- [ ] 4.1 Create `src/hooks/useLeadList.ts`
- [ ] 4.2 Apollo useQuery with LEADS_LIST, page size 20
- [ ] 4.3 Cursor-based pagination (loadMore via fetchMore)
- [ ] 4.4 300ms debounced search
- [ ] 4.5 Status filter, priority filter, tag filter
- [ ] 4.6 Return `{ leads, loading, error, hasNextPage, loadMore, setSearch, setFilters, refetch }`

### Task 5: Lead Detail Hook
- [ ] 5.1 Create `src/hooks/useLead.ts`
- [ ] 5.2 Fetch single lead by ID with useQuery
- [ ] 5.3 Return `{ lead, loading, error, refetch }`

### Task 6: Lead Actions Hook
- [ ] 6.1 Create `src/hooks/useLeadActions.ts`
- [ ] 6.2 Fetch actions for a lead (reverse chronological)
- [ ] 6.3 Add action mutation wrapper
- [ ] 6.4 Return `{ actions, addAction, loading, error }`

---

## Section 3: Pages

**Branch:** `feature/leads`

### Task 7: Leads List Page
- [ ] 7.1 Create `src/app/(dashboard)/leads/page.tsx`
- [ ] 7.2 Search bar with debounced input
- [ ] 7.3 Filter bar: status pipeline tabs, priority dropdown, tags
- [ ] 7.4 Lead table with columns: Name, Source, Status, Priority, Assigned To, Created
- [ ] 7.5 Create Lead button (opens modal)
- [ ] 7.6 Unassigned Leads tab (OrganizationAdmin only)
- [ ] 7.7 Load More pagination button
- [ ] 7.8 Wrap in PermissionGate module="leads" action="view"

### Task 8: Lead Detail Page
- [ ] 8.1 Create `src/app/(dashboard)/leads/[id]/page.tsx`
- [ ] 8.2 Lead profile header (name, contact, source, priority badge, status badge)
- [ ] 8.3 Status pipeline indicator (visual step progress)
- [ ] 8.4 Actions timeline (reverse chronological)
- [ ] 8.5 Add Action form (inline)
- [ ] 8.6 Selfie Analysis Report viewer (if available)
- [ ] 8.7 Convert to Patient button
- [ ] 8.8 Book Appointment button
- [ ] 8.9 Reassign button (ClinicAdmin only)

---

## Section 4: Module Components

**Branch:** `feature/leads`

### Task 9: Lead Table
- [ ] 9.1 Create `src/components/modules/leads/LeadTable.tsx`
- [ ] 9.2 @tanstack/react-table with columns: Name, Source, Status, Priority, Assigned, Created, Actions
- [ ] 9.3 Status badges: NEW=info, CONTACTED=warning, QUALIFIED=success, CONVERTED=primary, LOST=danger
- [ ] 9.4 Priority badges: LOW=muted, MEDIUM=info, HIGH=warning, URGENT=danger
- [ ] 9.5 Row click navigates to lead detail page

### Task 10: Create Lead Modal
- [ ] 10.1 Create `src/components/modules/leads/CreateLeadModal.tsx`
- [ ] 10.2 react-hook-form + zod: at least firstName or lastName required
- [ ] 10.3 Optional fields: email, phone, age, genderAssignedAtBirth, priority, tags
- [ ] 10.4 Clinic selector (OrganizationAdmin only, for multi-clinic orgs)
- [ ] 10.5 Call CREATE_LEAD mutation
- [ ] 10.6 On success: close modal, trigger refetch

### Task 11: Lead Status Pipeline
- [ ] 11.1 Create `src/components/modules/leads/LeadStatusPipeline.tsx`
- [ ] 11.2 Visual step indicator: NEW -> CONTACTED -> QUALIFIED -> CONVERTED
- [ ] 11.3 LOST shown as separate branch/state
- [ ] 11.4 Click to change status (with confirmation for LOST)
- [ ] 11.5 Disable CONVERTED (only via conversion flow)

### Task 12: Lead Action Form
- [ ] 12.1 Create `src/components/modules/leads/LeadActionForm.tsx`
- [ ] 12.2 Action type dropdown (WhatsApp, Email, Facebook, Phone Call, In Person, Other)
- [ ] 12.3 Content textarea
- [ ] 12.4 Optional status change selector
- [ ] 12.5 Call ADD_LEAD_ACTION mutation
- [ ] 12.6 On success: clear form, refetch actions

### Task 13: Lead Actions Timeline
- [ ] 13.1 Create `src/components/modules/leads/LeadActionsTimeline.tsx`
- [ ] 13.2 Vertical timeline with action cards
- [ ] 13.3 Each card: action type icon, content, staff name, timestamp
- [ ] 13.4 Status change indicator on relevant actions

### Task 14: Convert Lead Dialog
- [ ] 14.1 Create `src/components/modules/leads/ConvertLeadDialog.tsx`
- [ ] 14.2 Preview of patient fields to be created (from lead data)
- [ ] 14.3 Error handling: CONVERSION_DUPLICATE_EMAIL, CONVERSION_DUPLICATE_PHONE
- [ ] 14.4 Call CONVERT_LEAD_TO_PATIENT mutation
- [ ] 14.5 On success: navigate to new patient page

### Task 15: Reassign Lead Modal
- [ ] 15.1 Create `src/components/modules/leads/ReassignLeadModal.tsx`
- [ ] 15.2 Staff member selector (active staff in same clinic)
- [ ] 15.3 Only enabled for NEW or LOST status (non-admin)
- [ ] 15.4 Call REASSIGN_LEAD mutation
- [ ] 15.5 On success: close modal, refetch lead

### Task 16: Unassigned Leads Panel
- [ ] 16.1 Create `src/components/modules/leads/UnassignedLeadsPanel.tsx`
- [ ] 16.2 List of unassigned leads with suggested clinic (if available)
- [ ] 16.3 Clinic assignment dropdown per lead
- [ ] 16.4 Assign button per lead
- [ ] 16.5 Only visible to OrganizationAdmin

---

## Section 5: Integration

**Branch:** `feature/leads`

### Task 17: Sidebar Navigation
- [ ] 17.1 Add Leads link to sidebar (/leads)
- [ ] 17.2 Wrap in PermissionGate module="leads" action="view"
- [ ] 17.3 Use UserPlus icon for Leads

### Task 18: Webhook Configuration Page
- [ ] 18.1 Create `src/app/(dashboard)/settings/webhooks/page.tsx`
- [ ] 18.2 List configured webhook sources with endpoint URLs
- [ ] 18.3 Create/Edit webhook source form (endpoint, field mapping)
- [ ] 18.4 Delete webhook source with confirmation
- [ ] 18.5 Wrap in PermissionGate — OrganizationAdmin only
