# Clinic Web App — Implementation Documents

> Scope: Next.js frontend implementation for the Hairscope Clinic Web App. Covers tech stack, project setup, authentication, GraphQL client, state management, routing, testing, and deployment.

---

## Documents

| # | Document | Covers |
|---|----------|--------|
| 01 | [Tech Stack](./01-tech-stack.md) | Next.js 16, Tailwind, Apollo Client, Zustand, shadcn/ui |
| 02 | [Project Setup](./02-project-setup.md) | Repository structure, configs, environment variables |
| 03 | [Authentication](./03-authentication.md) | Server Actions, cookies, refresh, middleware |
| 04 | [GraphQL Client](./04-graphql-client.md) | Apollo Client, link chain, subscriptions, cache |
| 05 | [State Management](./05-state-management.md) | Zustand stores, Apollo cache strategy |
| 06 | [Routing & Layouts](./06-routing-layouts.md) | App Router, route groups, role-based navigation |
| 07 | [Testing](./07-testing.md) | Vitest, Playwright, component tests |
| 08 | [Deployment](./08-deployment.md) | Docker, CI/CD, environments |

---

## Tech Summary

| Concern | Technology |
|---------|-----------|
| Framework | Next.js 16 (App Router + Server Actions) |
| Language | TypeScript 6.x (strict) |
| GraphQL | Apollo Client 3.x |
| State | Zustand 5.x |
| Styling | Tailwind CSS 4.x + shadcn/ui |
| Validation | Zod 3.x |
| i18n | next-intl 3.x |
| Testing | Vitest + Playwright |
| Runtime | Bun 1.x |

---
