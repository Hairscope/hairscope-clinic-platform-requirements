# GraphQL

> Covers: Apollo Server setup, code-first schema, resolver patterns, pagination, error formatting, subscriptions, file uploads, rate limiting, and schema versioning.

---

# 1. Apollo Server Setup

## 1.1 Configuration

GraphQL SHALL be served via Apollo Server 4 through `@nestjs/graphql`:

```typescript
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      useFactory: (config: ConfigService) => ({
        autoSchemaFile: true,
        sortSchema: true,
        playground: config.get('NODE_ENV') !== 'production',
        introspection: config.get('NODE_ENV') !== 'production',
        context: ({ req, res }) => ({ req, res }),
        formatError: formatPlatformError,
        subscriptions: {
          'graphql-ws': {
            onConnect: (ctx) => validateSubscriptionAuth(ctx),
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## 1.2 Code-First Approach

Schema SHALL be generated from TypeScript decorators (code-first):

```typescript
@ObjectType()
export class Patient {
  @Field(() => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  email: string;

  @Field(() => PatientStatus)
  status: PatientStatus;

  @Field()
  createdAt: Date;
}
```

---

# 2. Schema Composition

Each module SHALL register its own types and resolvers.

The platform SHALL compose a unified schema at startup.

Module registration:

```typescript
// patients.module.ts
@Module({
  providers: [
    PatientResolver,
    // ... other providers
  ],
})
export class PatientsModule {}
```

NestJS auto-discovers all `@Resolver()` classes and merges them into the unified schema.

No manual schema stitching is required.

---

# 3. Resolver Pattern

## 3.1 Layering

Resolvers SHALL follow this call chain:

```text
Resolver → Application Service → Domain Service → Repository
```

Business logic SHALL NEVER exist in resolvers.

Resolvers are responsible for:

- Input validation (via class-validator)
- Calling the appropriate application service
- Returning the response type

## 3.2 Example

```typescript
@Resolver(() => Patient)
@UseGuards(AuthGuard, TenantGuard, PermissionGuard)
export class PatientResolver {
  constructor(private readonly patientService: PatientApplicationService) {}

  @RequirePermission('patients', 'view')
  @Query(() => PatientConnection)
  async patients(
    @Args() args: PaginationArgs,
    @CurrentUser() user: TenantContext,
  ): Promise<PatientConnection> {
    return this.patientService.findAll(args, user);
  }

  @RequirePermission('patients', 'create')
  @Mutation(() => Patient)
  async createPatient(
    @Args('input') input: CreatePatientInput,
    @CurrentUser() user: TenantContext,
  ): Promise<Patient> {
    return this.patientService.create(input, user);
  }
}
```

---

# 4. Pagination

## 4.1 Relay Cursor-Based Connections

All list queries SHALL use Relay-style cursor-based pagination:

```typescript
@ObjectType()
export class PageInfo {
  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;

  @Field(() => String, { nullable: true })
  startCursor: string | null;

  @Field(() => String, { nullable: true })
  endCursor: string | null;
}

@ObjectType()
export class PatientEdge {
  @Field(() => Patient)
  node: Patient;

  @Field()
  cursor: string;
}

@ObjectType()
export class PatientConnection {
  @Field(() => [PatientEdge])
  edges: PatientEdge[];

  @Field(() => PageInfo)
  pageInfo: PageInfo;

  @Field()
  totalCount: number;
}
```

## 4.2 Pagination Args

```typescript
@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 20 })
  @Min(1)
  @Max(100)
  first: number;

  @Field(() => String, { nullable: true })
  after?: string;

  @Field(() => String, { nullable: true })
  before?: string;
}
```

## 4.3 Cursor Encoding

Cursors SHALL be opaque base64-encoded strings:

```typescript
function encodeCursor(id: string, sortValue: any): string {
  return Buffer.from(JSON.stringify({ id, sortValue })).toString('base64url');
}

function decodeCursor(cursor: string): { id: string; sortValue: any } {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString());
}
```

---

# 5. Error Formatting

## 5.1 Error Response Shape

All errors SHALL be formatted as:

```typescript
interface FormattedError {
  code: string;
  field?: string;
  traceId: string;
  message: string;
}
```

## 5.2 Error Formatter

```typescript
function formatPlatformError(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
  const originalError = (error as any)?.extensions?.originalError;

  if (originalError instanceof PlatformError) {
    return {
      message: originalError.message,
      extensions: {
        code: originalError.code,
        field: originalError.field,
        traceId: generateTraceId(),
      },
    };
  }

  // Unknown errors — hide internals in production
  return {
    message: 'Internal server error',
    extensions: {
      code: 'INTERNAL_ERROR',
      traceId: generateTraceId(),
    },
  };
}
```

## 5.3 Error Codes

Error codes SHALL be uppercase snake_case strings matching the codes defined in requirements (e.g., `INVALID_CREDENTIALS`, `DUPLICATE_PATIENT_EMAIL`, `SLOT_CONFLICT`).

---

# 6. Subscriptions

## 6.1 Protocol

Subscriptions SHALL use the `graphql-ws` protocol (not the legacy `subscriptions-transport-ws`).

## 6.2 Scope

Subscriptions SHALL be scoped to the authenticated staff member's clinic.

## 6.3 Implementation

```typescript
@Resolver()
export class AppointmentSubscriptionResolver {
  @Subscription(() => Appointment, {
    filter: (payload, variables, context) => {
      // Only receive events for the staff's clinic
      return payload.appointmentUpdated.clinicId === context.req.identity.clinicId;
    },
  })
  appointmentUpdated() {
    return pubSub.asyncIterableIterator('APPOINTMENT_UPDATED');
  }
}
```

## 6.4 Use Cases

Subscriptions SHALL be used for:

- Real-time appointment status changes
- New lead notifications
- Session progress updates
- Notification delivery confirmations

---

# 7. File Uploads

## 7.1 Separate Endpoint

File uploads SHALL NOT use GraphQL mutations.

File uploads SHALL use a separate HTTP multipart endpoint:

```typescript
@Controller('files')
@UseGuards(AuthGuard, TenantGuard)
export class FileUploadController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: TenantContext,
    @Body('category') category: string,
  ): Promise<FileUploadResponse> {
    const result = await this.fileService.upload(file, category, user);
    return { fileId: result.id, url: result.url };
  }
}
```

## 7.2 Response

```typescript
interface FileUploadResponse {
  fileId: string;
  url: string;
}
```

The returned `fileId` MAY be referenced in subsequent GraphQL mutations (e.g., attaching an image to a session).

---

# 8. Rate Limiting

## 8.1 Limits

Rate limiting SHALL be applied at multiple levels:

| Scope | Limit | Window |
|-------|-------|--------|
| Per staff member | 1000 requests | 1 minute |
| Per clinic | 5000 requests | 1 minute |
| Per API key (external) | 100 requests | 1 minute |

## 8.2 Implementation

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

ThrottlerModule.forRoot({
  throttlers: [
    { name: 'short', ttl: 1000, limit: 20 },   // 20 req/sec burst
    { name: 'medium', ttl: 60000, limit: 1000 }, // 1000 req/min sustained
  ],
  storage: new ThrottlerStorageRedisService(redisClient),
})
```

Rate limit headers SHALL be included in responses:

```text
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1700000060
```

## 8.3 Exceeded Response

When rate limit is exceeded, the platform SHALL return HTTP 429 with:

```json
{
  "code": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Please retry after X seconds.",
  "retryAfter": 30
}
```

---

# 9. Schema Versioning

## 9.1 Response Header

Every GraphQL response SHALL include:

```text
X-Schema-Version: 2024.1
```

## 9.2 Versioning Strategy

Schema versioning SHALL follow calendar versioning: `YYYY.N` where N is the revision number.

Breaking changes SHALL increment the revision.

Additive changes (new fields, new types) do not require version bumps.

Deprecated fields SHALL be annotated with `@deprecated` directive and removal target version.

```typescript
@Field({ deprecationReason: 'Use fullName instead. Removal: 2025.1' })
name: string;
```

---
