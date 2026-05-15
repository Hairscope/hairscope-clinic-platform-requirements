# Clinic Web App — GraphQL Client

> Covers: Apollo Client setup, link chain, cache configuration, subscriptions, and code generation.

---

# 1. Apollo Client Setup

```typescript
// src/lib/apollo/client.ts
import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { createUploadLink } from 'apollo-upload-client';
import { errorLink } from './error-link';
import { authLink } from './auth-link';

const httpLink = createUploadLink({
  uri: process.env.NEXT_PUBLIC_API_URL,
  credentials: 'include',
});

const wsLink = typeof window !== 'undefined'
  ? new GraphQLWsLink(
      createClient({
        url: process.env.NEXT_PUBLIC_WS_URL!,
      }),
    )
  : null;

const splitLink = typeof window !== 'undefined' && wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      httpLink,
    )
  : httpLink;

export const apolloClient = new ApolloClient({
  link: errorLink.concat(authLink.concat(splitLink)),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          patients: relayStylePagination(),
          appointments: relayStylePagination(),
          leads: relayStylePagination(),
          sessions: relayStylePagination(),
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

---

# 2. Apollo Provider

```typescript
// src/lib/apollo/provider.tsx
'use client';

import { ApolloProvider } from '@apollo/client';
import { apolloClient } from './client';

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}
```

Registered in the root layout:

```typescript
// src/app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApolloWrapper>{children}</ApolloWrapper>
      </body>
    </html>
  );
}
```

---

# 3. GraphQL Operations Structure

```
src/graphql/
├── queries/
│   ├── patients.graphql
│   ├── sessions.graphql
│   ├── appointments.graphql
│   ├── leads.graphql
│   ├── catalog.graphql
│   ├── billing.graphql
│   └── staff.graphql
├── mutations/
│   ├── patients.graphql
│   ├── sessions.graphql
│   ├── appointments.graphql
│   ├── leads.graphql
│   └── billing.graphql
└── subscriptions/
    ├── appointments.graphql
    └── sessions.graphql
```

---

# 4. Query Example

```graphql
# src/graphql/queries/patients.graphql
query Patients($first: Int!, $after: String) {
  patients(first: $first, after: $after) {
    edges {
      node {
        id
        firstName
        lastName
        email
        phone
        age
        createdAt
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

---

# 5. Subscription Example

```graphql
# src/graphql/subscriptions/appointments.graphql
subscription AppointmentStatusChanged {
  appointmentStatusChanged {
    id
    status
    slotStart
    slotEnd
    patientName
  }
}
```

---

# 6. Custom Hooks

Each module SHALL have custom hooks wrapping Apollo operations:

```typescript
// src/hooks/use-patients.ts
import { useQuery } from '@apollo/client';
import { PATIENTS_QUERY } from '@/graphql/queries/patients';

export function usePatients(variables: { first: number; after?: string }) {
  return useQuery(PATIENTS_QUERY, { variables });
}
```

---
