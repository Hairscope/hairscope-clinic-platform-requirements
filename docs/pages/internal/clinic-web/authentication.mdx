# Clinic Web App — Authentication

> Covers: Login flow, token management, session persistence, refresh mechanism, and logout.

---

# 1. Auth Flow Overview

```text
1. User submits login form
2. Server Action calls backend login mutation
3. Backend returns { accessToken, refreshToken }
4. Server Action sets httpOnly cookies
5. Client receives success → redirects to dashboard
6. All subsequent API calls include cookies automatically
7. Apollo Client attaches accessToken from cookie via middleware
```

---

# 2. Server Actions

## 2.1 Login Action

```typescript
// src/lib/actions/auth.actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          accessToken
          refreshToken
        }
      }`,
      variables: { email, password },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    return { error: errors[0].extensions.code };
  }

  const cookieStore = await cookies();

  cookieStore.set('accessToken', data.login.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  cookieStore.set('refreshToken', data.login.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  redirect('/dashboard');
}
```

## 2.2 Refresh Action

```typescript
export async function refreshAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    redirect('/login');
  }

  const response = await fetch(process.env.NEXT_PUBLIC_API_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `mutation Refresh($refreshToken: String!) {
        refresh(refreshToken: $refreshToken) {
          accessToken
          refreshToken
        }
      }`,
      variables: { refreshToken },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    cookieStore.delete('accessToken');
    cookieStore.delete('refreshToken');
    redirect('/login');
  }

  cookieStore.set('accessToken', data.refresh.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  cookieStore.set('refreshToken', data.refresh.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return data.refresh.accessToken;
}
```

## 2.3 Logout Action

```typescript
export async function logoutAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  if (accessToken) {
    await fetch(process.env.NEXT_PUBLIC_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        query: `mutation { logout }`,
      }),
    });
  }

  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  redirect('/login');
}
```

---

# 3. Middleware

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/login', '/forgot-password', '/reset-password', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('accessToken')?.value;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!accessToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

# 4. Apollo Client Auth Link

```typescript
// src/lib/apollo/auth-link.ts
import { setContext } from '@apollo/client/link/context';

export const authLink = setContext(async (_, { headers }) => {
  // On client side, cookies are sent automatically
  // This link is for adding any additional headers if needed
  return {
    headers: {
      ...headers,
    },
  };
});
```

For client-side Apollo, the httpOnly cookie is sent automatically with `credentials: 'include'` on the HTTP link.

---

# 5. Token Refresh on 401

```typescript
// src/lib/apollo/error-link.ts
import { onError } from '@apollo/client/link/error';
import { refreshAction } from '@/lib/actions/auth.actions';

export const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHENTICATED')) {
    // Trigger server-side refresh
    return fromPromise(refreshAction()).flatMap(() => forward(operation));
  }
});
```

---
