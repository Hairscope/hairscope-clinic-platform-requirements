# Clinic Web App — Design

> Covers: Frontend architecture, component hierarchy, data flow patterns, module boundaries, and interaction with the backend GraphQL API.

---

# 1. Architecture Overview

```text
┌─────────────────────────────────────────────────────────┐
│                    Next.js App (Bun)                     │
├─────────────────────────────────────────────────────────┤
│  App Router                                             │
│  ├── Server Components (SSR, data fetching)             │
│  ├── Client Components (interactivity, subscriptions)   │
│  └── Server Actions (auth, mutations via cookies)       │
├─────────────────────────────────────────────────────────┤
│  State Layer                                            │
│  ├── Apollo Client Cache (server data)                  │
│  └── Zustand Stores (UI state)                          │
├─────────────────────────────────────────────────────────┤
│  GraphQL Layer                                          │
│  ├── Apollo HTTP Link (queries, mutations, uploads)     │
│  ├── Apollo WS Link (subscriptions)                     │
│  └── Error Link (401 → refresh → retry)                 │
├─────────────────────────────────────────────────────────┤
│  Auth Layer                                             │
│  ├── Middleware (route protection)                      │
│  ├── Server Actions (login, refresh, logout)            │
│  └── httpOnly Cookies (token storage)                   │
└─────────────────────────────────────────────────────────┘
            │
            │ HTTPS / WSS
            ▼
┌─────────────────────────────────────────────────────────┐
│              Hairscope Backend (GraphQL API)             │
└─────────────────────────────────────────────────────────┘
```

---

# 2. Design Principles

## DP-1 Server-First Rendering

Pages SHALL render on the server by default (Server Components).

Client Components SHALL be used only when interactivity, subscriptions, or browser APIs are required.

## DP-2 Colocation

Components, hooks, and GraphQL operations SHALL be colocated with the module they belong to.

Shared components live in `components/ui/` and `components/shared/`.

## DP-3 Thin Client

Business logic lives in the backend. The frontend is a presentation layer.

The frontend SHALL NOT:
- Compute access decisions (server does this)
- Enforce business invariants (server does this)
- Store sensitive data in client state

The frontend MAY:
- Validate form inputs before submission (UX optimization)
- Optimistically update the UI (with server reconciliation)

## DP-4 Module Isolation

Each feature module (patients, appointments, leads, etc.) SHALL be self-contained:
- Own page routes
- Own components
- Own GraphQL operations
- Own hooks

Cross-module dependencies SHALL go through shared types or the GraphQL schema.

## DP-5 Progressive Enhancement

Core functionality SHALL work without JavaScript where possible (Server Components + Server Actions).

Enhanced interactivity (real-time updates, drag-and-drop, camera) requires Client Components.

---

# 3. Component Architecture

## 3.1 Component Hierarchy

```text
Layout (Server Component)
├── Sidebar (Client Component — interactive navigation)
├── Header (Client Component — user menu, notifications)
└── Page Content (Server Component — data fetching)
    └── Module Components (mix of Server + Client)
        ├── List/Table (Server Component — initial data)
        ├── Filters (Client Component — interactive)
        ├── Forms (Client Component — input handling)
        └── Modals/Dialogs (Client Component — overlay)
```

## 3.2 Component Categories

| Category | Location | Rendering | Examples |
|----------|----------|-----------|----------|
| UI primitives | `components/ui/` | Client | Button, Input, Dialog, Select (shadcn/ui) |
| Shared | `components/shared/` | Mixed | DataTable, PageHeader, EmptyState, LoadingSpinner |
| Module | `components/modules/{name}/` | Mixed | PatientCard, AppointmentCalendar, LeadKanban |
| Layout | `app/(dashboard)/layout.tsx` | Server + Client | Sidebar, Header, MainContent |

## 3.3 Server vs Client Decision

| Use Server Component when | Use Client Component when |
|--------------------------|--------------------------|
| Fetching data for initial render | Handling user interactions (clicks, inputs) |
| Rendering static content | Using React hooks (useState, useEffect) |
| Accessing backend directly | Subscribing to real-time updates |
| No browser APIs needed | Using browser APIs (camera, clipboard) |
| SEO-relevant content | Animations and transitions |

---

# 4. Data Flow

## 4.1 Read Flow (Queries)

```text
Page (Server Component)
  → fetch() to GraphQL API (server-side, with cookie)
  → Render initial HTML
  → Hydrate on client
  → Apollo Client takes over for subsequent queries
  → Cache-and-network policy for fresh data
```

## 4.2 Write Flow (Mutations)

```text
User Action (form submit, button click)
  → Client Component calls Apollo mutation
  → Apollo sends to backend GraphQL API
  → Backend validates, persists, emits events
  → Apollo updates cache (optimistic or refetch)
  → UI reflects new state
```

## 4.3 Real-Time Flow (Subscriptions)

```text
Client Component mounts
  → Apollo subscribes via WebSocket
  → Backend emits event (e.g., AppointmentStatusChanged)
  → Apollo receives update
  → Cache updated automatically
  → Component re-renders with new data
```

## 4.4 Auth Flow

```text
Login Form (Client Component)
  → Calls Server Action (loginAction)
  → Server Action calls backend mutation
  → Backend returns tokens
  → Server Action sets httpOnly cookies
  → Redirect to dashboard

Subsequent Requests:
  → Middleware checks cookie presence
  → Apollo HTTP Link sends cookie automatically (credentials: include)
  → Backend validates JWT from cookie
  → On 401: Error Link triggers refresh Server Action → retry
```

---

# 5. Module Structure

Each business module follows this pattern:

```text
src/
├── app/(dashboard)/{module}/
│   ├── page.tsx                    → List page (Server Component)
│   ├── [id]/page.tsx               → Detail page (Server Component)
│   └── loading.tsx                 → Loading skeleton
├── components/modules/{module}/
│   ├── {Module}List.tsx            → List/table component
│   ├── {Module}Detail.tsx          → Detail view
│   ├── {Module}Form.tsx            → Create/edit form
│   ├── {Module}Card.tsx            → Card for grid views
│   └── {Module}Filters.tsx         → Filter controls
├── graphql/
│   ├── queries/{module}.graphql    → Query operations
│   ├── mutations/{module}.graphql  → Mutation operations
│   └── subscriptions/{module}.graphql → Subscription operations
└── hooks/
    └── use-{module}.ts             → Custom hooks wrapping Apollo
```

---

# 6. Styling Architecture

## 6.1 Tailwind Layers

```text
Base Layer (Tailwind defaults + custom fonts/colors)
  → Component Layer (shadcn/ui components)
    → Utility Layer (page-specific overrides)
```

## 6.2 Design Tokens

Design tokens SHALL be defined in `tailwind.config.ts`:

- Colors: brand palette, semantic colors (success, warning, error)
- Typography: font family, sizes, weights
- Spacing: consistent scale
- Shadows: elevation levels
- Border radius: consistent rounding

## 6.3 Dark Mode

Dark mode SHALL be supported via Tailwind's `class` strategy.

The UI store persists the user's theme preference.

---

# 7. Error Handling

## 7.1 GraphQL Errors

Apollo error link SHALL:
1. Intercept `UNAUTHENTICATED` → trigger refresh
2. Intercept `FORBIDDEN` → show access denied UI
3. Intercept `VALIDATION_ERROR` → map to form field errors
4. Intercept `INTERNAL_ERROR` → show generic error toast

## 7.2 Error Boundaries

Each module page SHALL have an `error.tsx` boundary that:
- Catches rendering errors
- Shows a user-friendly error message
- Provides a retry action
- Logs the error for debugging

## 7.3 Loading States

Each module page SHALL have a `loading.tsx` that shows:
- Skeleton UI matching the expected content shape
- No layout shift when content loads

---

# 8. Internationalization

## 8.1 Strategy

- `next-intl` for message translation
- Locale detected from: user preference (Zustand) → browser → default (EN)
- Translation files in `public/locales/{locale}/`
- Server Components use `getTranslations()`
- Client Components use `useTranslations()`

## 8.2 Supported Locales

EN, ES, IT, NL, FR, RU, AR, DE (matching backend clinic language setting)

## 8.3 RTL Support

Arabic (AR) requires RTL layout. Tailwind's `rtl:` variant SHALL be used for directional styles.

---

# 9. Accessibility

## 9.1 Standards

The app SHALL conform to WCAG 2.1 Level AA.

## 9.2 Implementation

- shadcn/ui components are built on Radix (accessible by default)
- All interactive elements SHALL have visible focus indicators
- All images SHALL have alt text
- Color contrast SHALL meet AA ratio (4.5:1 for text)
- Keyboard navigation SHALL work for all workflows
- Screen reader announcements for dynamic content (aria-live)

---

# 10. Performance

## 10.1 Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3s |
| Cumulative Layout Shift | < 0.1 |

## 10.2 Strategies

- Server Components for initial render (no client JS bundle)
- Code splitting per route (automatic with App Router)
- Image optimization via `next/image`
- Apollo cache to avoid redundant network requests
- Lazy loading for heavy components (calendar, rich text editor, camera)
- Prefetching for likely navigation targets

---
