# File Storage

> Covers: Google Cloud Storage integration, file upload/download, signed URLs, bucket organization, image processing, and file lifecycle management.

---

# 1. GCS Configuration

## 1.1 Service Account

GCS access SHALL use a service account key file:

```typescript
import { Storage } from '@google-cloud/storage';

@Module({
  providers: [
    {
      provide: 'GCS_CLIENT',
      useFactory: (config: ConfigService) => {
        return new Storage({
          projectId: config.get('GCP_PROJECT_ID'),
          keyFilename: config.get('GCS_KEY_FILE'),
        });
      },
      inject: [ConfigService],
    },
    GcsStorageService,
  ],
  exports: [GcsStorageService],
})
export class StorageModule {}
```

## 1.2 Bucket Strategy

A single bucket SHALL be used per environment with path-based organization:

| Environment | Bucket |
|-------------|--------|
| Development | `hairscope-dev-files` |
| Staging | `hairscope-staging-files` |
| Production | `hairscope-prod-files` |

---

# 2. Path Organization

Files SHALL be organized by tenant and category:

```text
{organizationId}/{clinicId}/{category}/{entityId}/{filename}
```

Categories:

| Category | Content |
|----------|---------|
| `sessions` | Session images (scalp photos) |
| `reports` | Generated PDF reports |
| `treatment-plans` | Signed treatment plan PDFs |
| `prescriptions` | Signed prescription PDFs |
| `invoices` | Generated invoice PDFs |
| `avatars` | Staff and patient profile photos |
| `documents` | Miscellaneous uploaded documents |

Example path:

```text
org_abc123/clinic_xyz/sessions/session_001/scalp-top-01.jpg
```

---

# 3. Storage Service

## 3.1 Upload

```typescript
@Injectable()
export class GcsStorageService {
  private bucket: Bucket;

  constructor(
    @Inject('GCS_CLIENT') private readonly storage: Storage,
    private readonly config: ConfigService,
  ) {
    this.bucket = this.storage.bucket(this.config.get('GCS_BUCKET'));
  }

  async upload(
    filePath: string,
    content: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<string> {
    const file = this.bucket.file(filePath);

    await file.save(content, {
      contentType,
      metadata: {
        ...metadata,
        uploadedAt: new Date().toISOString(),
      },
      resumable: content.length > 5 * 1024 * 1024, // Resumable for > 5MB
    });

    return filePath;
  }

  async uploadStream(
    filePath: string,
    stream: Readable,
    contentType: string,
  ): Promise<string> {
    const file = this.bucket.file(filePath);
    const writeStream = file.createWriteStream({ contentType, resumable: true });

    await new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream).on('finish', resolve).on('error', reject);
    });

    return filePath;
  }
}
```

## 3.2 Download

```typescript
async download(filePath: string): Promise<Buffer> {
  const file = this.bucket.file(filePath);
  const [content] = await file.download();
  return content;
}

async getReadStream(filePath: string): Promise<Readable> {
  const file = this.bucket.file(filePath);
  return file.createReadStream();
}
```

## 3.3 Signed URLs

Signed URLs SHALL be used for client-side access:

```typescript
async getSignedUrl(filePath: string, expiresInMinutes = 60): Promise<string> {
  const file = this.bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  });

  return url;
}

async getUploadSignedUrl(filePath: string, contentType: string): Promise<string> {
  const file = this.bucket.file(filePath);

  const [url] = await file.getSignedUrl({
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });

  return url;
}
```

## 3.4 Delete

```typescript
async delete(filePath: string): Promise<void> {
  const file = this.bucket.file(filePath);
  await file.delete({ ignoreNotFound: true });
}

async deletePrefix(prefix: string): Promise<void> {
  await this.bucket.deleteFiles({ prefix });
}
```

---

# 4. File Upload Controller

## 4.1 Multipart Upload

```typescript
@Controller('files')
@UseGuards(AuthGuard, TenantGuard)
export class FileUploadController {
  constructor(private readonly fileService: FileService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (req, file, cb) => {
      const allowed = /^(image\/(jpeg|png|webp)|application\/pdf)$/;
      cb(null, allowed.test(file.mimetype));
    },
  }))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('category') category: FileCategory,
    @Body('entityId') entityId: string,
    @CurrentUser() user: TenantContext,
  ): Promise<FileUploadResponse> {
    return this.fileService.upload(file, category, entityId, user);
  }
}
```

## 4.2 File Service

```typescript
@Injectable()
export class FileService {
  constructor(
    private readonly storageService: GcsStorageService,
    private readonly fileMetadataRepo: FileMetadataRepository,
  ) {}

  async upload(
    file: Express.Multer.File,
    category: FileCategory,
    entityId: string,
    context: TenantContext,
  ): Promise<FileUploadResponse> {
    const fileName = `${randomUUID()}-${file.originalname}`;
    const filePath = `${context.organizationId}/${context.clinicId}/${category}/${entityId}/${fileName}`;

    await this.storageService.upload(filePath, file.buffer, file.mimetype);

    const metadata = await this.fileMetadataRepo.create({
      filePath,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category,
      entityId,
      organizationId: context.organizationId,
      clinicId: context.clinicId,
      uploadedBy: context.staffId,
    });

    const url = await this.storageService.getSignedUrl(filePath);

    return { fileId: metadata.id, url };
  }
}
```

---

# 5. File Metadata Schema

```typescript
const FileMetadataSchema = new Schema({
  filePath: { type: String, required: true, unique: true },
  originalName: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  category: {
    type: String,
    enum: ['sessions', 'reports', 'treatment-plans', 'prescriptions', 'invoices', 'avatars', 'documents'],
    required: true,
  },
  entityId: { type: String, required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, required: true, index: true },
  clinicId: { type: Schema.Types.ObjectId, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});

FileMetadataSchema.index({ organizationId: 1, clinicId: 1, category: 1 });
FileMetadataSchema.index({ entityId: 1, category: 1 });
```

---

# 6. Tenant Isolation

All file operations SHALL enforce tenant isolation:

- Upload paths SHALL include `organizationId` and `clinicId`
- Download/signed URL requests SHALL verify the requesting staff belongs to the same organization
- Bulk delete SHALL only operate within a tenant prefix

```typescript
async getFileUrl(fileId: string, context: TenantContext): Promise<string> {
  const metadata = await this.fileMetadataRepo.findById(fileId);

  if (!metadata || metadata.organizationId.toString() !== context.organizationId) {
    throw new FileNotFoundError();
  }

  return this.storageService.getSignedUrl(metadata.filePath);
}
```

---

# 7. Lifecycle Rules

GCS lifecycle rules SHALL be configured per category:

| Category | Retention | Action |
|----------|-----------|--------|
| `sessions` | Indefinite | No auto-delete |
| `reports` | Indefinite | No auto-delete |
| `treatment-plans` | Indefinite | No auto-delete |
| `prescriptions` | Indefinite | No auto-delete |
| `invoices` | Indefinite | No auto-delete |
| `avatars` | Indefinite | No auto-delete |
| `documents` | Indefinite | No auto-delete |

Clinical data SHALL NOT be auto-deleted.

GDPR erasure requests SHALL be handled through the application layer, not GCS lifecycle rules.

---
