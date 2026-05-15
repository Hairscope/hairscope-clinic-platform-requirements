# Clinic Web App — Testing

> Covers: Testing strategy, tools, and patterns for the Clinic Web App.

---

# 1. Test Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit | Vitest | Component logic, hooks, utilities |
| Component | Vitest + Testing Library | Component rendering and interaction |
| E2E | Playwright | Full user flows against running app |

---

# 2. Test Structure

```
src/
├── components/
│   └── modules/
│       └── patients/
│           ├── PatientList.tsx
│           └── PatientList.test.tsx    ← Component test
├── hooks/
│   ├── use-patients.ts
│   └── use-patients.test.ts           ← Hook test
├── lib/
│   └── utils/
│       ├── format-date.ts
│       └── format-date.test.ts        ← Unit test
tests/
└── e2e/
    ├── auth.spec.ts                   ← E2E test
    ├── patients.spec.ts
    └── appointments.spec.ts
```

---

# 3. E2E Test Example

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'doctor@hairscope.ai');
    await page.fill('[name="password"]', 'TestPass123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@email.com');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});
```

---

# 4. Component Test Example

```typescript
// src/components/modules/patients/PatientList.test.tsx
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import { PatientList } from './PatientList';
import { PATIENTS_QUERY } from '@/graphql/queries/patients';

const mocks = [
  {
    request: { query: PATIENTS_QUERY, variables: { first: 20 } },
    result: {
      data: {
        patients: {
          edges: [{ node: { id: '1', firstName: 'John', lastName: 'Doe' }, cursor: 'c1' }],
          pageInfo: { hasNextPage: false, endCursor: 'c1' },
          totalCount: 1,
        },
      },
    },
  },
];

test('renders patient list', async () => {
  render(
    <MockedProvider mocks={mocks}>
      <PatientList />
    </MockedProvider>,
  );

  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

---
