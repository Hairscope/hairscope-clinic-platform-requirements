# Clinic Web App — Tech Stack

> Covers: Technology choices, versions, and dependency management for the Hairscope Clinic Web App.

---

# 1. Runtime

| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 6.x (strict mode) |
| Runtime | Node.js | 24 LTS |
| Package Manager | Bun (primary), pnpm (fallback) | Bun 1.x, pnpm 11.x |

Next.js 16 with App Router and Server Actions SHALL be used.

Server Actions SHALL handle server-side operations (auth flows, cookie management, SSR data fetching).

Apollo Client SHALL handle client-side GraphQL (subscriptions, cache, optimistic updates).

---

# 2. Core Dependencies

| Concern | Package | Purpose |
|---------|---------|---------|
| GraphQL Client | `@apollo/client` + `apollo-upload-client` | GraphQL queries, mutations, subscriptions, file uploads |
| State Management | `zustand` | Client-side UI state |
| Styling | `tailwindcss` | Utility-first CSS |
| UI Components | `shadcn/ui` (Radix + Tailwind) | Accessible, composable components |
| Validation | `zod` | Form and schema validation |
| i18n | `next-intl` | Internationalization (EN, ES, IT, NL, FR, RU, AR, DE) |
| Rich Text | `@tiptap/react` + extensions | Doctor's notes, observations |
| Charts | `recharts` | Treatment progress graphs |
| Calendar | `react-big-calendar` | Appointment calendar view |
| Toasts | `sonner` | Notifications and feedback |
| Date Picker | `react-datepicker` | Date/time selection |
| Phone Input | `react-phone-number-input` | International phone format |
| Camera | `jslib-html5-camera-photo` | Trichoscopy image capture |
| Image Crop | `react-advanced-cropper` | Image editing before upload |

---

# 3. Development Dependencies

| Concern | Package | Purpose |
|---------|---------|---------|
| Testing | `playwright` | E2E testing |
| Testing | `vitest` | Unit and component tests |
| Linting | `eslint` + `eslint-config-next` | Code quality |
| Formatting | `prettier` + `prettier-plugin-tailwindcss` | Code formatting with Tailwind class sorting |

---

# 4. Architecture Patterns

## 4.1 Server Actions vs Apollo Client

| Use Case | Approach |
|----------|----------|
| Login / Logout / Refresh | Server Actions (sets httpOnly cookies) |
| SSR data fetching (initial page load) | Server Components + fetch |
| Client-side queries with cache | Apollo Client |
| Real-time updates (subscriptions) | Apollo Client (graphql-ws) |
| Mutations with optimistic UI | Apollo Client |
| File uploads | Apollo Client (graphql-upload) |

## 4.2 Authentication Flow

1. Login form submits to a Server Action
2. Server Action calls backend GraphQL login mutation
3. Backend returns JWT + refresh token
4. Server Action sets httpOnly cookies on the response
5. Subsequent requests include cookies automatically
6. Apollo Client reads auth state from a Zustand store (not the cookie directly)

## 4.3 Module Organization

```
src/
├── app/                    → Next.js App Router pages
│   ├── (auth)/             → Login, forgot password (public)
│   ├── (dashboard)/        → Authenticated pages
│   │   ├── patients/
│   │   ├── sessions/
│   │   ├── appointments/
│   │   ├── leads/
│   │   ├── catalog/
│   │   ├── billing/
│   │   ├── staff/
│   │   └── settings/
│   └── layout.tsx
├── components/
│   ├── ui/                 → shadcn/ui components
│   ├── shared/             → App-wide shared components
│   └── modules/            → Module-specific components
├── lib/
│   ├── apollo/             → Apollo Client setup, links, cache
│   ├── actions/            → Server Actions
│   └── utils/              → Utility functions
├── stores/                 → Zustand stores
├── hooks/                  → Custom React hooks
├── graphql/
│   ├── queries/            → .graphql query files
│   ├── mutations/          → .graphql mutation files
│   └── subscriptions/      → .graphql subscription files
├── types/                  → TypeScript types
├── constants/              → App constants
└── i18n/                   → Translation files
```

---

# 5. Version Constraints

All dependencies SHALL use exact versions (no ranges).

---
