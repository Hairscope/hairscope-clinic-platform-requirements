# Clinic Web App — Project Setup

> Covers: Repository structure, configuration, environment variables, and local development flow.

---

# 1. Prerequisites

- Bun 1.x (primary runtime and package manager)
- Node.js 24 LTS (fallback)
- Backend API running locally (port 4000)

---

# 2. Project Structure

```
hairscope-clinic-web/
├── package.json
├── bun.lock
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
├── .env.local
├── public/
│   ├── locales/            → Translation JSON files
│   └── assets/             → Static assets (logos, icons)
├── src/
│   ├── app/                → Next.js App Router
│   ├── components/         → UI components
│   ├── lib/                → Libraries and utilities
│   ├── stores/             → Zustand stores
│   ├── hooks/              → Custom hooks
│   ├── graphql/            → GraphQL operations
│   ├── types/              → TypeScript types
│   ├── constants/          → Constants
│   ├── i18n/               → i18n config
│   └── middleware.ts       → Auth + i18n middleware
├── .eslintrc.js
├── .prettierrc
└── Dockerfile
```

---

# 3. Environment Variables

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/graphql
NEXT_PUBLIC_WS_URL=ws://localhost:4000/graphql

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Auth (server-side only)
AUTH_COOKIE_NAME=hairscope_session
AUTH_COOKIE_DOMAIN=localhost

# i18n
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

---

# 4. Local Development Flow

```text
1. Clone repository
2. bun install
3. Ensure backend is running (bun dev in hairscope-backend)
4. Copy .env.example → .env.local
5. bun dev (starts on port 3000)
```

---

# 5. TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES2022"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/stores/*": ["./src/stores/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/graphql/*": ["./src/graphql/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

# 6. Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

---

# 7. Code Quality

ESLint SHALL enforce Next.js recommended rules plus TypeScript strict checks.

Prettier SHALL enforce:
- Single quotes
- Trailing commas
- 2-space indentation
- 100 char line width
- Tailwind class sorting (via prettier-plugin-tailwindcss)

---
