# Clinic Web App — Routing & Layouts

> Covers: Next.js App Router structure, route groups, layouts, and role-based page access.

---

# 1. Route Structure

```
src/app/
├── (auth)/                         → Public auth pages (no sidebar)
│   ├── login/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── register/page.tsx
│   ├── invite/[token]/page.tsx
│   └── layout.tsx                  → Centered card layout
│
├── (dashboard)/                    → Authenticated pages (with sidebar)
│   ├── layout.tsx                  → Sidebar + header + main content
│   ├── page.tsx                    → Dashboard home (KPIs)
│   ├── patients/
│   │   ├── page.tsx                → Patient list
│   │   └── [id]/
│   │       ├── page.tsx            → Patient detail (PatientPage)
│   │       └── sessions/
│   │           └── [sessionId]/page.tsx
│   ├── appointments/
│   │   ├── page.tsx                → Calendar view
│   │   └── [id]/page.tsx           → Appointment detail
│   ├── leads/
│   │   ├── page.tsx                → Lead list (kanban or table)
│   │   └── [id]/page.tsx           → Lead detail
│   ├── catalog/
│   │   ├── page.tsx                → Catalog items list
│   │   ├── kits/page.tsx           → Treatment kits
│   │   └── [id]/page.tsx           → Item detail
│   ├── billing/
│   │   ├── page.tsx                → Invoice list
│   │   └── [id]/page.tsx           → Invoice detail
│   ├── staff/
│   │   ├── page.tsx                → Staff list
│   │   └── [id]/page.tsx           → Staff profile
│   ├── settings/
│   │   ├── clinic/page.tsx         → Clinic profile
│   │   ├── roles/page.tsx          → Role management
│   │   ├── availability/page.tsx   → Staff availability
│   │   ├── communication/page.tsx  → Communication policy
│   │   └── organization/page.tsx   → Org settings (OrgAdmin only)
│   └── audit/page.tsx              → Audit log viewer
│
└── layout.tsx                      → Root layout (providers, fonts)
```

---

# 2. Layout Hierarchy

```text
Root Layout (providers, fonts, metadata)
├── (auth) Layout → Centered card, no navigation
└── (dashboard) Layout → Sidebar + Header + Content area
    ├── Sidebar (navigation, role-aware)
    ├── Header (user menu, notifications, clinic selector)
    └── Main content (page)
```

---

# 3. Role-Based Navigation

The sidebar SHALL show navigation items based on the user's effective permissions:

| Module | Required Permission | Visible To |
|--------|-------------------|------------|
| Dashboard | (always) | All authenticated staff |
| Patients | `patients.view` | Doctor, Nurse, ClinicAdmin |
| Appointments | `appointments.view` | All clinic staff |
| Leads | `leads.view` | Sales, Marketing, ClinicAdmin, OrgAdmin |
| Catalog | `catalog.view` | Doctor, ClinicAdmin |
| Billing | `billing.view` | ClinicAdmin, Receptionist |
| Staff | `staff.view` | ClinicAdmin, OrgAdmin |
| Settings | (role-based sections) | ClinicAdmin, OrgAdmin |
| Audit | `audit.view` | ClinicAdmin, OrgAdmin |

OrgAdmin SHALL see an additional clinic selector in the header to switch between clinics.

---

# 4. Protected Routes

All routes under `(dashboard)/` are protected by middleware (see `03-authentication.md`).

Page-level permission checks SHALL be done in the page component:

```typescript
// src/app/(dashboard)/patients/page.tsx
import { requirePermission } from '@/lib/auth/require-permission';

export default async function PatientsPage() {
  await requirePermission('patients', 'view');
  return <PatientList />;
}
```

---
