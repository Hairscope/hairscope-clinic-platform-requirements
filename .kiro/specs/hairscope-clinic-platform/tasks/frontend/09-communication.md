# Module 9: Communication — Frontend Tasks

> Implementation tasks for the Communication module frontend (notification templates, delivery tracking, channel preferences, quiet hours, unsubscribe management).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/communication`

### Task 1: Communication Service
- [ ] 1.1 Create `src/services/communication.service.ts`
- [ ] 1.2 Add GET_NOTIFICATION_TEMPLATES query (list all templates)
- [ ] 1.3 Add GET_NOTIFICATION_TEMPLATE query (single by ID)
- [ ] 1.4 Add CREATE_NOTIFICATION_TEMPLATE mutation
- [ ] 1.5 Add UPDATE_NOTIFICATION_TEMPLATE mutation
- [ ] 1.6 Add DELETE_NOTIFICATION_TEMPLATE mutation

### Task 2: Delivery Tracking Service
- [ ] 2.1 Add GET_DELIVERY_RECORDS query (pagination, filters by status/channel/date)
- [ ] 2.2 Add GET_DELIVERY_RECORD query (single by ID)

### Task 3: Channel Preferences Service
- [ ] 3.1 Add GET_CHANNEL_PREFERENCES query (per organization)
- [ ] 3.2 Add UPDATE_CHANNEL_PREFERENCES mutation
- [ ] 3.3 Add GET_QUIET_HOURS query
- [ ] 3.4 Add UPDATE_QUIET_HOURS mutation
- [ ] 3.5 Add GET_FALLBACK_CHAINS query
- [ ] 3.6 Add UPDATE_FALLBACK_CHAIN mutation
- [ ] 3.7 Add GET_RATE_LIMITS query
- [ ] 3.8 Add UPDATE_RATE_LIMITS mutation

### Task 4: Unsubscribe Service
- [ ] 4.1 Add GET_UNSUBSCRIBE_PREFERENCES query (per recipient)
- [ ] 4.2 Add UPDATE_UNSUBSCRIBE_PREFERENCES mutation

---

## Section 2: Custom Hooks

**Branch:** `feature/communication`

### Task 5: Notification Templates Hook
- [ ] 5.1 Create `src/hooks/useNotificationTemplates.ts`
- [ ] 5.2 Fetch templates list with useQuery
- [ ] 5.3 Return `{ templates, loading, error, refetch }`

### Task 6: Delivery Records Hook
- [ ] 6.1 Create `src/hooks/useDeliveryRecords.ts`
- [ ] 6.2 Fetch delivery records with pagination and filters
- [ ] 6.3 Status filter, channel filter, date range filter
- [ ] 6.4 Return `{ records, loading, error, hasNextPage, loadMore, setFilters }`

### Task 7: Communication Settings Hook
- [ ] 7.1 Create `src/hooks/useCommunicationSettings.ts`
- [ ] 7.2 Fetch channel preferences, quiet hours, fallback chains, rate limits
- [ ] 7.3 Provide update functions for each setting
- [ ] 7.4 Return `{ preferences, quietHours, fallbackChains, rateLimits, update*, loading }`

---

## Section 3: Pages

**Branch:** `feature/communication`

### Task 8: Communication Settings Page
- [ ] 8.1 Create `src/app/(dashboard)/settings/communication/page.tsx`
- [ ] 8.2 Tab navigation: Templates, Delivery Log, Channels, Quiet Hours
- [ ] 8.3 Templates tab: list/manage notification templates
- [ ] 8.4 Delivery Log tab: searchable delivery records table
- [ ] 8.5 Channels tab: channel preferences and fallback chains
- [ ] 8.6 Quiet Hours tab: quiet hours configuration
- [ ] 8.7 Wrap in PermissionGate module="organization" action="edit"

---

## Section 4: Module Components

**Branch:** `feature/communication`

### Task 9: Notification Template List
- [ ] 9.1 Create `src/components/modules/communication/NotificationTemplateList.tsx`
- [ ] 9.2 Table: Template Name, Channel(s), Trigger Event, Status, Actions
- [ ] 9.3 Create Template button
- [ ] 9.4 Edit/Delete actions per template

### Task 10: Notification Template Form
- [ ] 10.1 Create `src/components/modules/communication/NotificationTemplateForm.tsx`
- [ ] 10.2 react-hook-form + zod: name, channel, subject, body with placeholders
- [ ] 10.3 Template variable picker (insert placeholders like `patientName`, `appointmentDate`)
- [ ] 10.4 Channel selector (EMAIL, WHATSAPP, SMS, PUSH, IN_APP)
- [ ] 10.5 Preview rendered template
- [ ] 10.6 Create and Edit modes

### Task 11: Delivery Records Table
- [ ] 11.1 Create `src/components/modules/communication/DeliveryRecordsTable.tsx`
- [ ] 11.2 @tanstack/react-table: Recipient, Channel, Template, Status, Sent At, Delivered At
- [ ] 11.3 Status badges: PENDING=gray, QUEUED=blue, SENT=info, DELIVERED=success, FAILED=danger, BOUNCED=orange
- [ ] 11.4 Filter bar: status, channel, date range
- [ ] 11.5 Click row to view full delivery record detail

### Task 12: Channel Preferences Editor
- [ ] 12.1 Create `src/components/modules/communication/ChannelPreferencesEditor.tsx`
- [ ] 12.2 Per-notification-type channel configuration
- [ ] 12.3 Fallback chain editor (drag-to-reorder channels)
- [ ] 12.4 Rate limit configuration per channel
- [ ] 12.5 Save button with validation

### Task 13: Quiet Hours Editor
- [ ] 13.1 Create `src/components/modules/communication/QuietHoursEditor.tsx`
- [ ] 13.2 Start time and end time pickers
- [ ] 13.3 Timezone display (from organization/clinic config)
- [ ] 13.4 Priority bypass indicator (URGENT/HIGH bypass quiet hours)
- [ ] 13.5 Save button

### Task 14: Delivery Record Detail
- [ ] 14.1 Create `src/components/modules/communication/DeliveryRecordDetail.tsx`
- [ ] 14.2 Full delivery lifecycle: status transitions with timestamps
- [ ] 14.3 Attempt count and retry history
- [ ] 14.4 Error reason (if failed/bounced)
- [ ] 14.5 Provider message ID reference

---

## Section 5: Integration

**Branch:** `feature/communication`

### Task 15: Sidebar Navigation
- [ ] 15.1 Add Communication link under Settings section (/settings/communication)
- [ ] 15.2 Wrap in PermissionGate module="organization" action="edit"
- [ ] 15.3 Use Bell icon for Communication
