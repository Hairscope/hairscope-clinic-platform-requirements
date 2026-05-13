# PDF Generation

> Covers: Typst self-hosted setup, template structure, data binding, compilation pipeline, and document types (reports, treatment plans, prescriptions, invoices).

---

# 1. Typst Setup

## 1.1 Self-Hosted Binary

Typst SHALL be hosted locally on the server as a CLI binary.

The binary SHALL be included in the Docker image for the Report Generation worker:

```dockerfile
# Dockerfile.worker-report
FROM node:20-slim AS base

# Install Typst binary
RUN curl -fsSL https://typst.community/typst-install/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=worker-report

CMD ["node", "packages/worker-report/dist/main.js"]
```

## 1.2 Template Directory

Templates SHALL be stored in the repository and mounted into the worker container:

```text
typst/
├── templates/
│   ├── session-report.typ
│   ├── treatment-plan.typ
│   ├── prescription.typ
│   ├── invoice.typ
│   └── partials/
│       ├── header.typ
│       ├── footer.typ
│       ├── clinic-info.typ
│       ├── patient-info.typ
│       └── signature-block.typ
├── fonts/
│   └── (custom fonts if needed)
└── assets/
    └── (logos, icons)
```

---

# 2. Typst Compiler Service

## 2.1 Implementation

```typescript
@Injectable()
export class TypstCompiler {
  private readonly templateDir: string;

  constructor(private readonly config: ConfigService) {
    this.templateDir = this.config.get('TYPST_TEMPLATE_DIR', 'typst/templates');
  }

  async compile(templateName: string, data: Record<string, any>): Promise<Buffer> {
    const templatePath = path.join(this.templateDir, `${templateName}.typ`);
    const tmpDir = path.join(os.tmpdir(), randomUUID());
    await fs.mkdir(tmpDir, { recursive: true });

    try {
      // Write data as JSON for Typst to read
      const dataPath = path.join(tmpDir, 'data.json');
      await fs.writeFile(dataPath, JSON.stringify(data));

      // Write a wrapper that imports the template with data
      const entryPath = path.join(tmpDir, 'entry.typ');
      const entryContent = `
#import "${templatePath}": *
#let data = json("data.json")
#render(data)
`;
      await fs.writeFile(entryPath, entryContent);

      // Compile
      const outputPath = path.join(tmpDir, 'output.pdf');
      await execAsync(`typst compile "${entryPath}" "${outputPath}"`, {
        cwd: tmpDir,
        timeout: 30000, // 30s timeout
      });

      return await fs.readFile(outputPath);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
```

## 2.2 Error Handling

```typescript
async compile(templateName: string, data: Record<string, any>): Promise<Buffer> {
  // ... setup ...

  try {
    const { stdout, stderr } = await execAsync(
      `typst compile "${entryPath}" "${outputPath}"`,
      { cwd: tmpDir, timeout: 30000 },
    );

    if (stderr) {
      this.logger.warn(`Typst warnings for ${templateName}: ${stderr}`);
    }

    const exists = await fs.access(outputPath).then(() => true).catch(() => false);
    if (!exists) {
      throw new PdfCompilationError(templateName, stderr || 'No output produced');
    }

    return await fs.readFile(outputPath);
  } catch (error) {
    if (error.killed) {
      throw new PdfCompilationError(templateName, 'Compilation timed out');
    }
    throw new PdfCompilationError(templateName, error.message);
  }
}
```

---

# 3. Document Types

## 3.1 Session Report

Generated on `SessionCompleted` event.

Data structure:

```typescript
interface SessionReportData {
  clinic: {
    name: string;
    address: string;
    phone: string;
    logo?: string;
  };
  patient: {
    name: string;
    age: number;
    gender: string;
    patientId: string;
  };
  session: {
    date: string;
    type: string;
    doctor: string;
    observations: string;
    images: Array<{ url: string; region: string; caption?: string }>;
  };
  analysis?: {
    findings: string[];
    severity: string;
    recommendations: string[];
  };
  generatedAt: string;
}
```

## 3.2 Treatment Plan

Generated on `TreatmentPlanSigned` event.

Data structure:

```typescript
interface TreatmentPlanData {
  clinic: ClinicInfo;
  patient: PatientInfo;
  doctor: { name: string; designation: string };
  plan: {
    diagnosis: string;
    goals: string[];
    routines: Array<{
      itemName: string;
      type: string;
      dosage?: string;
      frequency?: string;
      duration?: string;
      timeSlots?: string[];
      instructions?: string;
    }>;
    kits: Array<{
      name: string;
      items: string[];
    }>;
    nextReviewDate?: string;
  };
  signature: {
    doctorName: string;
    signedAt: string;
  };
  editHistory?: Array<{
    field: string;
    previousValue: string;
    newValue: string;
    editedAt: string;
    editedBy: string;
  }>;
  generatedAt: string;
}
```

## 3.3 Prescription

Generated on `PrescriptionSigned` event.

Data structure:

```typescript
interface PrescriptionData {
  clinic: ClinicInfo;
  patient: PatientInfo;
  doctor: { name: string; designation: string; registrationNo: string };
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    timeSlots: string[];
    instructions?: string;
  }>;
  notes?: string;
  signature: {
    doctorName: string;
    signedAt: string;
  };
  generatedAt: string;
}
```

## 3.4 Invoice

Generated on `InvoiceFinalized` event.

Data structure:

```typescript
interface InvoiceData {
  clinic: ClinicInfo;
  patient: PatientInfo;
  invoice: {
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    lineItems: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    amountPaid: number;
    balance: number;
    status: string;
  };
  payments: Array<{
    date: string;
    method: string;
    amount: number;
    reference?: string;
  }>;
  generatedAt: string;
}
```

---

# 4. Template Example

## 4.1 Session Report Template

```typst
// session-report.typ

#let render(data) = {
  // Page setup
  set page(paper: "a4", margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm))
  set text(font: "Inter", size: 10pt)

  // Header
  include "partials/header.typ"
  clinic-header(data.clinic)

  // Title
  align(center)[
    #text(size: 16pt, weight: "bold")[Clinical Trichoscopy Report]
  ]

  v(1em)

  // Patient info
  include "partials/patient-info.typ"
  patient-block(data.patient)

  v(1em)

  // Session details
  table(
    columns: (1fr, 1fr),
    [*Date:* #data.session.date],
    [*Doctor:* #data.session.doctor],
    [*Session Type:* #data.session.type],
    [],
  )

  v(1em)

  // Observations
  [== Observations]
  data.session.observations

  // Images grid
  if data.session.images.len() > 0 {
    v(1em)
    [== Scalp Images]
    grid(
      columns: 2,
      gutter: 1em,
      ..data.session.images.map(img => {
        figure(
          image(img.url, width: 100%),
          caption: [#img.region #if img.caption != none { [ — #img.caption] }],
        )
      })
    )
  }

  // AI Analysis
  if data.analysis != none {
    v(1em)
    [== Analysis]
    [*Severity:* #data.analysis.severity]
    [*Findings:*]
    list(..data.analysis.findings)
    [*Recommendations:*]
    list(..data.analysis.recommendations)
  }

  // Footer
  include "partials/footer.typ"
  report-footer(data.generatedAt)
}
```

---

# 5. Report Data Loader

The data loader fetches data from module repositories for PDF rendering:

```typescript
@Injectable()
export class ReportDataLoader {
  constructor(
    private readonly patientRepo: PatientRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly clinicRepo: ClinicRepository,
    private readonly staffRepo: StaffRepository,
    private readonly catalogRepo: CatalogRepository,
    private readonly billingRepo: BillingRepository,
    private readonly storageService: GcsStorageService,
  ) {}

  async load(
    eventType: string,
    entityId: string,
    context: { organizationId: string; clinicId: string },
  ): Promise<Record<string, any>> {
    switch (eventType) {
      case 'SessionCompleted':
        return this.loadSessionReportData(entityId, context);
      case 'TreatmentPlanSigned':
        return this.loadTreatmentPlanData(entityId, context);
      case 'PrescriptionSigned':
        return this.loadPrescriptionData(entityId, context);
      case 'InvoiceFinalized':
        return this.loadInvoiceData(entityId, context);
      default:
        throw new UnsupportedReportTypeError(eventType);
    }
  }

  private async loadSessionReportData(sessionId: string, context: TenantContext) {
    const session = await this.sessionRepo.findById(sessionId, context);
    const patient = await this.patientRepo.findById(session.patientId, context);
    const clinic = await this.clinicRepo.findById(context.clinicId, context);
    const doctor = await this.staffRepo.findById(session.doctorId, context);

    // Generate signed URLs for session images
    const images = await Promise.all(
      session.images.map(async (img) => ({
        url: await this.storageService.getSignedUrl(img.filePath, 60),
        region: img.region,
        caption: img.caption,
      })),
    );

    return {
      clinic: { name: clinic.name, address: clinic.address, phone: clinic.phone },
      patient: { name: `${patient.firstName} ${patient.lastName}`, age: patient.age, gender: patient.gender, patientId: patient.id },
      session: { date: session.completedAt, type: session.sessionType, doctor: doctor.fullName, observations: session.observations, images },
      analysis: session.aiAnalysis,
      generatedAt: new Date().toISOString(),
    };
  }
}
```

---

# 6. Generation Queue

Report generation jobs SHALL be processed via BullMQ:

```typescript
BullModule.registerQueue({
  name: 'report-generation',
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
```

Job priority:

| Document Type | Priority |
|---------------|----------|
| Prescription | 1 (highest) |
| Treatment Plan | 2 |
| Invoice | 3 |
| Session Report | 4 |

---

# 7. Output Storage

Generated PDFs SHALL be uploaded to GCS and the URL stored on the source entity:

```typescript
async storeAndLink(
  pdfBuffer: Buffer,
  entityId: string,
  category: string,
  context: TenantContext,
): Promise<string> {
  const fileName = `${context.organizationId}/${context.clinicId}/${category}/${entityId}/${Date.now()}.pdf`;
  await this.storageService.upload(fileName, pdfBuffer, 'application/pdf');
  const url = await this.storageService.getSignedUrl(fileName);
  return url;
}
```

---
