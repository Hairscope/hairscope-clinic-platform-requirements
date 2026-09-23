# Frontend API Workflow — Order of Events

> A complete map of all GraphQL APIs the frontend consumes, organized by user journey flow.

---

## 🔓 Phase 1: Unauthenticated (Public APIs)

These are the only APIs accessible without a JWT token.

```
┌─────────────────────────────────────────────────────────────┐
│                    UNAUTHENTICATED ZONE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐                      │
│  │ selfRegister │     │    login     │                      │
│  │  (new org)   │     │ (email+pass) │                      │
│  └──────┬───────┘     └──────┬───────┘                      │
│         │                    │                              │
│         │              ┌─────┴─────┐                        │
│         │              │  refresh  │ (auto, via cookie)     │
│         │              └───────────┘                        │
│         │                                                   │
│  ┌──────┴──────────┐  ┌──────────────────────┐              │
│  │  acceptInvite   │  │ requestPasswordReset │              │
│  │ (invited staff) │  └─────────┬────────────┘              │
│  └─────────────────┘            │                           │
│                        ┌────────┴────────┐                  │
│                        │  resetPassword  │                  │
│                        └─────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

| # | API | When Used | Input |
|---|-----|-----------|-------|
| 1 | `selfRegister` | First-time org owner signs up | name, email, phone, org name, clinic name, address |
| 2 | `login` | Returning user logs in | email, password |
| 3 | `refresh` | Auto — when access token expires (15min) | cookie (automatic) |
| 4 | `acceptInvite` | Invited staff clicks email link | token, password |
| 5 | `requestPasswordReset` | User forgot password | email |
| 6 | `resetPassword` | User clicks reset link from email | token, newPassword |

---

## 🔒 Phase 2: Post-Login — Dashboard Load

After login, the frontend loads the dashboard. These APIs fire on app initialization.

```
LOGIN SUCCESS
    │
    ├──→ staffList          (sidebar: who's online)
    ├──→ roles              (for permission-based UI rendering)
    ├──→ patients           (dashboard: recent patients count)
    ├──→ appointments       (dashboard: today's schedule)
    ├──→ leads              (dashboard: new leads count)
    └──→ invoices           (dashboard: pending payments)
```

| # | API | Purpose | Permission |
|---|-----|---------|------------|
| 1 | `staffList` | Load team members for sidebar/assignments | staff.view |
| 2 | `roles` | Determine what UI elements to show | staff.edit |
| 3 | `patients` | Patient count, recent activity | patients.view |
| 4 | `appointments` | Today's schedule widget | appointments.view |
| 5 | `leads` | New leads notification badge | leads.view |
| 6 | `invoices` | Pending payments widget | billing.view |

---

## 🔒 Phase 3: Core Workflows (By Page)

### 3A. Patients Module

```
patients (list) ──→ patient (detail) ──→ sessions (history)
                                    ──→ treatmentProgress
                                    ──→ medicalDocuments
```

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View patient list | `patients(first, after, search)` | Navigate to /patients |
| View patient detail | `patient(id)` | Click patient row |
| Create patient | `createPatient(input)` | "Add Patient" button |
| Edit patient | `updatePatient(input)` | Edit form submit |
| View treatment progress | `treatmentProgress(patientId)` | Progress tab |
| Upload document | `uploadMedicalDocument(input)` | Upload button |
| GDPR erase | `gdprErasePatient(patientId)` | Admin action (rare) |

---

### 3B. Sessions Module

```
createSession ──→ saveSession (auto-save) ──→ completeSession
                                          ──→ createTreatmentPlan ──→ signTreatmentPlan
                                          ──→ signPrescription
```

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| Start new session | `createSession(patientId, type)` | "New Session" button |
| Auto-save progress | `saveSession(sessionId, data)` | Periodic / on change |
| Complete session | `completeSession(sessionId)` | "Complete" button |
| Create treatment plan | `createTreatmentPlan(input)` | After session complete |
| Sign treatment plan | `signTreatmentPlan(planId)` | Doctor signature |
| Sign prescription | `signPrescription(prescriptionId)` | Doctor signature |
| Delete draft | `deleteSession(sessionId)` | Delete draft button |

---

### 3C. Leads Module

```
leads (list) ──→ createLead ──→ updateLead (status changes)
                            ──→ convertLead (→ becomes Patient)
                            ──→ markLeadLost
```

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View leads | `leads(first, after, status, assignedTo)` | Navigate to /leads |
| Create lead manually | `createLead(input)` | "Add Lead" button |
| Update lead status | `updateLead(leadId, status)` | Status dropdown |
| Convert to patient | `convertLead(leadId)` | "Convert" button |
| Mark as lost | `markLeadLost(leadId, reason)` | "Lost" button |

**Note:** Leads also arrive via webhook (`POST /webhooks/leads`) — not a frontend concern.

---

### 3D. Appointments Module

```
availableSlots ──→ bookAppointment ──→ confirmAppointment
                                   ──→ rescheduleAppointment
                                   ──→ cancelAppointment
                                   ──→ completeAppointment
                                   ──→ markNoShow
```

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View calendar | `appointments(date, status, assignedTo)` | Navigate to /appointments |
| Check availability | `availableSlots(clinicId, date, serviceId, duration)` | Open booking modal |
| Book appointment | `bookAppointment(input)` | Confirm booking |
| Walk-in | `createWalkIn(input)` | "Walk-in" button |
| Reschedule | `rescheduleAppointment(id, newSlot)` | Drag/drop or edit |
| Cancel | `cancelAppointment(id, reason)` | Cancel button |
| Confirm | `confirmAppointment(id)` | Confirm button |
| Complete | `completeAppointment(id)` | After session done |
| No-show | `markNoShow(id)` | Mark no-show button |

---

### 3E. Catalog Module

```
catalogItems (list) ──→ createCatalogItem ──→ updateCatalogItem
                                          ──→ deactivateCatalogItem

treatmentKits (list) ──→ createTreatmentKit ──→ updateTreatmentKit
                                            ──→ deactivateTreatmentKit
```

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View catalog | `catalogItems(first, after, type, isActive)` | Navigate to /catalog |
| View item detail | `catalogItem(id)` | Click item |
| Create item | `createCatalogItem(input)` | "Add Item" button |
| Update item | `updateCatalogItem(input)` | Edit form |
| Deactivate item | `deactivateCatalogItem(itemId)` | Deactivate button |
| View kits | `treatmentKits(first, after)` | Kits tab |
| Create kit | `createTreatmentKit(input)` | "Create Kit" button |
| Qualified staff for service | `qualifiedStaff(serviceId)` | Assignment dropdown |

---

### 3F. Billing Module

```
invoices (list) ──→ invoice (detail) ──→ addLineItem
                                     ──→ removeLineItem
                                     ──→ finalizeInvoice ──→ recordPayment
                                     ──→ voidInvoice
```

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View invoices | `invoices(first, after, patientId, status)` | Navigate to /billing |
| View invoice detail | `invoice(id)` | Click invoice |
| Create invoice | `createInvoice(patientId, sessionId?)` | "New Invoice" or auto |
| Add line item | `addLineItem(invoiceId, item)` | Add item button |
| Remove line item | `removeLineItem(invoiceId, index)` | Remove button |
| Finalize | `finalizeInvoice(invoiceId)` | "Finalize" button |
| Record payment | `recordPayment(invoiceId, amount, method)` | Payment form |
| Void invoice | `voidInvoice(invoiceId)` | Void button (admin) |
| View payments | `payments(invoiceId)` | Payments tab |

**Note:** Invoices are auto-created when a treatment plan is signed (event-driven).

---

## 🔒 Phase 4: Settings & Admin

### 4A. Organization Settings

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View org info | `organization` | Navigate to /settings |
| View clinic | `clinic(id)` | Clinic settings tab |
| Update clinic | `updateClinicProfile(input)` | Save settings |
| Create new clinic | `createClinic(input)` | "Add Clinic" (multi-clinic) |
| Set staff availability | `setStaffAvailability(input)` | Availability calendar |
| Update report template | `updateReportTemplate(input)` | Report settings |

### 4B. Staff & Role Management

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View staff | `staffList(limit, skip)` | Navigate to /settings/staff |
| View staff detail | `staff(id)` | Click staff member |
| Invite new staff | `sendInvite(email, roles)` | "Invite" button |
| Resend invite | `resendInvite(staffId)` | Resend button |
| Cancel invite | `cancelInvite(staffId)` | Cancel button |
| Update staff | `updateStaff(input)` | Edit form |
| Deactivate staff | `deactivateStaff(staffId)` | Deactivate button |
| Reactivate staff | `reactivateStaff(staffId)` | Reactivate button |
| View roles | `roles` | Roles tab |
| Create role | `createRole(input)` | "New Role" button |
| Update role | `updateRole(input)` | Edit permissions |
| Delete role | `deleteRole(roleId)` | Delete button |

### 4C. Audit Log

| Flow | APIs Called | Trigger |
|------|-------------|---------|
| View audit log | `auditLogs(action?, staffId?, from?, to?, first, after)` | Navigate to /audit |

---

## 🔒 Phase 5: Session Actions (Always Available)

| API | When | Purpose |
|-----|------|---------|
| `logout` | User clicks logout | Clears session + cookies |
| `refresh` | Every 14 minutes (auto) | Keeps session alive |

---

## Event-Driven (Backend → Frontend via Subscriptions)

These are real-time updates pushed to the frontend:

| Event | Subscription | UI Update |
|-------|-------------|-----------|
| Appointment status change | `appointmentUpdated` | Calendar refresh |
| New lead arrives | `newLead` | Badge counter + notification |
| Session progress | `sessionProgressUpdated` | Live progress bar |

---

## Complete API Count

| Category | Queries | Mutations | Total |
|----------|---------|-----------|-------|
| Auth (public) | 0 | 5 | 5 |
| IAM | 3 | 11 | 14 |
| Organization | 4 | 4 | 8 |
| Patients | 4 | 4 | 8 |
| Sessions | 4 | 7 | 11 |
| Leads | 2 | 4 | 6 |
| Appointments | 3 | 7 | 10 |
| Catalog | 5 | 6 | 11 |
| Billing | 3 | 6 | 9 |
| Audit | 1 | 0 | 1 |
| **Total** | **29** | **54** | **83** |
