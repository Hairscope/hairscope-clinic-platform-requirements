# Module 2: Organization — Frontend Tasks

> Implementation tasks for the Organization module frontend (clinic profile, settings, staff availability, dashboards).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/organization`

### Task 1: Organization Service
- 1.1 Create `src/services/organization.service.ts`
- 1.2 Add GET_ORGANIZATION query (org details, clinics list)
- 1.3 Add UPDATE_ORGANIZATION mutation
- 1.4 Add CREATE_CLINIC mutation
- 1.5 Add DEACTIVATE_CLINIC mutation
- 1.6 Add REACTIVATE_CLINIC mutation

### Task 2: Clinic Service
- 2.1 Create `src/services/clinic.service.ts`
- 2.2 Add GET_CLINIC_PROFILE query
- 2.3 Add UPDATE_CLINIC_PROFILE mutation
- 2.4 Add UPDATE_CLINIC_WORKING_HOURS mutation
- 2.5 Add UPDATE_RECORD_VISIBILITY_MODE mutation
- 2.6 Add UPDATE_CURRENCY_ENFORCEMENT mutation

### Task 3: Staff Availability Service
- 3.1 Create `src/services/availability.service.ts`
- 3.2 Add GET_STAFF_AVAILABILITY query
- 3.3 Add UPDATE_STAFF_AVAILABILITY mutation
- 3.4 Add GET_STAFF_LIST_FOR_AVAILABILITY query (staff with availability status)

### Task 4: Transfer Service
- 4.1 Create `src/services/transfer.service.ts`
- 4.2 Add TRANSFER_STAFF mutation
- 4.3 Add GET_TRANSFER_PREREQUISITES query (unresolved records check)

### Task 5: Dashboard Service
- 5.1 Create `src/services/dashboard.service.ts`
- 5.2 Add GET_DASHBOARD_KPIS query (clinic-scoped)
- 5.3 Add GET_ORG_DASHBOARD_KPIS query (org-scoped, aggregated)

---

## Section 2: Custom Hooks

**Branch:** `feature/organization`

### Task 6: Clinic Profile Hook
- 6.1 Create `src/hooks/useClinicProfile.ts`
- 6.2 Fetch clinic profile with useQuery, return loading/error/data
- 6.3 Provide updateProfile function wrapping the mutation

### Task 7: Working Hours Hook
- 7.1 Create `src/hooks/useWorkingHours.ts`
- 7.2 Manage per-day schedule state (7 days, start/end/closed)
- 7.3 Validate `startTime < endTime` before submit
- 7.4 Return `{ workingHours, updateDay, save, loading, error }`

### Task 8: Staff Availability Hook
- 8.1 Create `src/hooks/useStaffAvailability.ts`
- 8.2 Fetch availability for a given staffId
- 8.3 Manage per-day schedule state with save function
- 8.4 Return `{ availability, updateDay, save, loading, error }`

### Task 9: Dashboard Hook
- 9.1 Create `src/hooks/useDashboard.ts`
- 9.2 Fetch KPIs based on user role (org vs clinic scope)
- 9.3 Support clinic filter for OrganizationAdmin
- 9.4 Return `{ kpis, loading, error, setClinicFilter }`

---

## Section 3: Pages

**Branch:** `feature/organization`

### Task 10: Clinic Profile Settings Page
- 10.1 Create `src/app/(dashboard)/settings/clinic/page.tsx`
- 10.2 Display clinic profile form with all fields (name, address, email, phone, website, timezone, language, currency)
- 10.3 Logo upload with preview
- 10.4 Terms and conditions textarea
- 10.5 Wrap in PermissionGate module="organization" action="edit"

### Task 11: Organization Settings Page
- 11.1 Create `src/app/(dashboard)/settings/organization/page.tsx`
- 11.2 Organization details section (name, currency enforcement policy)
- 11.3 Clinics list with create/deactivate/reactivate actions
- 11.4 Clinic-level record visibility toggle (`OPEN`/`RESTRICTED`, per-staff assignment) AND org-level cross-clinic visibility (`CLINIC_ONLY`/`ORGANIZATION_WIDE`, ORG-11 — permission-driven, non-clinical details only)
- 11.5 Lead assignment mode toggle (AUTO_ASSIGN/MANUAL_ASSIGN)
- 11.6 Treatment recommendation mode toggle (`STAGE_SCALE`/`HAIRSCORE`) — Recommendation Engine matching strategy
- 11.7 Wrap in PermissionGate — OrganizationAdmin only

### Task 12: Staff Availability Page
- 12.1 Create `src/app/(dashboard)/settings/availability/page.tsx`
- 12.2 Staff selector dropdown (for ClinicAdmin managing others)
- 12.3 Weekly schedule grid (7 days × start/end/available toggle)
- 12.4 Save button with validation
- 12.5 Wrap in PermissionGate module="organization" action="edit"

### Task 13: Dashboard Page
- 13.1 Create `src/app/(dashboard)/page.tsx` (default landing)
- 13.2 Org-scoped dashboard for OrganizationAdmin with clinic filter
- 13.3 Clinic-scoped dashboard for clinic staff
- 13.4 KPI cards layout (placeholder metrics until backend defines them)

---

## Section 4: Module Components

**Branch:** `feature/organization`

### Task 14: Clinic Profile Form
- 14.1 Create `src/components/modules/organization/ClinicProfileForm.tsx`
- 14.2 react-hook-form + zod schema (name, address, timezone required)
- 14.3 Timezone select (IANA timezones)
- 14.4 Language select (EN, ES, IT, NL, FR, RU, AR, DE)
- 14.5 Currency select (ISO 4217) with enforcement indicator
- 14.6 Working hours inline editor (per-day rows)

### Task 15: Working Hours Editor
- 15.1 Create `src/components/modules/organization/WorkingHoursEditor.tsx`
- 15.2 7-row grid: day name, start time picker, end time picker, closed toggle
- 15.3 Validation: startTime < endTime when not closed
- 15.4 Warning dialog when changes affect existing appointments

### Task 16: Create Clinic Modal
- 16.1 Create `src/components/modules/organization/CreateClinicModal.tsx`
- 16.2 Form with name and address (required), optional fields
- 16.3 Call CREATE_CLINIC mutation, trigger refetch on success

### Task 17: Clinic Deactivation Dialog
- 17.1 Create `src/components/modules/organization/ClinicDeactivateDialog.tsx`
- 17.2 Warning about staff access revocation
- 17.3 Block if last active clinic in organization
- 17.4 Call DEACTIVATE_CLINIC mutation

### Task 18: Staff Transfer Modal
- 18.1 Create `src/components/modules/organization/StaffTransferModal.tsx`
- 18.2 Destination clinic selector
- 18.3 Role assignment for destination clinic
- 18.4 Display unresolved records warning (blocking condition)
- 18.5 Call TRANSFER_STAFF mutation

### Task 19: Availability Schedule Grid
- 19.1 Create `src/components/modules/organization/AvailabilityGrid.tsx`
- 19.2 Weekly grid with time pickers per day
- 19.3 Available/unavailable toggle per day
- 19.4 Controlled component with value/onChange props

### Task 20: Dashboard KPI Cards
- 20.1 Create `src/components/modules/organization/DashboardKPICard.tsx`
- 20.2 Reusable card: title, value, trend indicator, icon
- 20.3 Loading skeleton state

---

## Section 5: Integration

**Branch:** `feature/organization`

### Task 21: Sidebar Navigation
- 21.1 Add Settings section to sidebar (Clinic Profile, Organization, Availability)
- 21.2 Wrap Organization link in PermissionGate (OrganizationAdmin only)
- 21.3 Use Building2 icon for Organization, Settings icon for Clinic, Clock icon for Availability

### Task 22: Self-Registration Page
- 22.1 Create `src/app/(auth)/register/page.tsx`
- 22.2 Registration form: firstName, lastName, email, phone, orgName, clinicName, clinicAddress
- 22.3 react-hook-form + zod validation (all fields required)
- 22.4 Call SELF_REGISTER mutation
- 22.5 On success: show confirmation message with email check instruction
- 22.6 Link from login page to register page

---

## Section 6: Communication Settings (Settings Sub-Page)

**Branch:** `feature/organization`

### Task 23: Communication Service
- 23.1 Create `src/services/communication.service.ts`
- 23.2 Add GET_NOTIFICATION_TEMPLATES query (list all templates)
- 23.3 Add CREATE_NOTIFICATION_TEMPLATE, UPDATE_NOTIFICATION_TEMPLATE, DELETE_NOTIFICATION_TEMPLATE mutations
- 23.4 Add GET_CHANNEL_PREFERENCES, UPDATE_CHANNEL_PREFERENCES queries/mutations
- 23.5 Add GET_QUIET_HOURS, UPDATE_QUIET_HOURS queries/mutations
- 23.6 Add GET_DELIVERY_RECORDS query (pagination, filters)

### Task 24: Communication Hooks
- 24.1 Create `src/hooks/useNotificationTemplates.ts` (list, CRUD)
- 24.2 Create `src/hooks/useDeliveryRecords.ts` (pagination, filters)
- 24.3 Create `src/hooks/useCommunicationSettings.ts` (channel prefs, quiet hours)

### Task 25: Communication Settings Page
- 25.1 Create `src/app/(dashboard)/settings/communication/page.tsx`
- 25.2 Tab navigation: Templates, Delivery Log, Channels, Quiet Hours
- 25.3 Wrap in PermissionGate module="organization" action="edit"

### Task 26: Communication Components
- 26.1 Create `src/components/modules/communication/NotificationTemplateList.tsx`
- 26.2 Create `src/components/modules/communication/NotificationTemplateForm.tsx`
- 26.3 Create `src/components/modules/communication/DeliveryRecordsTable.tsx`
- 26.4 Create `src/components/modules/communication/ChannelPreferencesEditor.tsx`
- 26.5 Create `src/components/modules/communication/QuietHoursEditor.tsx`
