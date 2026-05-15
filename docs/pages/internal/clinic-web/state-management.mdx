# Clinic Web App — State Management

> Covers: Zustand store patterns, what goes in Zustand vs Apollo cache, and store organization.

---

# 1. State Strategy

| State Type | Where | Example |
|-----------|-------|---------|
| Server data (entities) | Apollo Client cache | Patients, appointments, sessions |
| UI state (local) | Zustand | Sidebar open/closed, active tab, modal state |
| Auth state | Zustand (synced from cookies) | Current user, role, clinic |
| Form state | React state (local) | Form inputs before submission |
| Real-time data | Apollo subscriptions | Appointment status changes |

Apollo Client is the source of truth for server data. Zustand handles UI-only state that doesn't come from the API.

---

# 2. Store Organization

```
src/stores/
├── auth.store.ts           → Current user, role, permissions
├── ui.store.ts             → Sidebar, theme, layout preferences
├── session.store.ts        → Active trichoscopy session state (camera, images)
└── notifications.store.ts  → In-app notification queue
```

---

# 3. Auth Store

```typescript
// src/stores/auth.store.ts
import { create } from 'zustand';

interface AuthState {
  user: {
    staffId: string;
    firstName: string;
    lastName: string;
    email: string;
    organizationId: string;
    clinicId: string;
    roles: string[];
  } | null;
  isAuthenticated: boolean;
  setUser: (user: AuthState['user']) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
```

---

# 4. UI Store

```typescript
// src/stores/ui.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: string;
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
  setLocale: (locale: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'system',
      locale: 'en',
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'hairscope-ui' },
  ),
);
```

---

# 5. Rules

- Zustand stores SHALL NOT duplicate data available in Apollo cache
- Zustand stores SHALL be used for UI state that persists across page navigations
- Stores that need persistence across sessions SHALL use the `persist` middleware
- Each store SHALL be small and focused on one concern

---
