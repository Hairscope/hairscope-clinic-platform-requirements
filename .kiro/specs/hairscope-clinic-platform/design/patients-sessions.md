# Patients & Sessions - Design

> **Version:** 1.0.0 | **Status:** Draft | **Branch:** designs
> **Requirements:** `requirements/modules/patients.md`, `requirements/modules/sessions.md`

---

## 1. Overview

Patients and Sessions are the core clinical entities. Sessions are a sub-resource of Patients and cannot exist without a Patient. The `patients` permission module covers both.

**Key design decisions:**
- `globalPatientId` links the same physical person across clinics/orgs for the Hairscope Care App
- Sessions are extensible by `sessionType` - one active DRAFT per patient per type per clinic
- AI analysis is async via the Transactional Outbox Pattern
- Annotations track AI vs HUMAN source in backend; no visual differentiation in UI
- Treatment Progress Graph shows COMPLETED sessions only

---

## 2. Data Models

### 2.1 Patient

```javascript
const GlobalPatientSchema = new Schema({
  _id: { type: String, default: () => uuidv4() }, // this IS the globalPatientId
  emails: [{ type: String, lowercase: true }],     // all known emails across clinics
  phones: [{ type: String }]                       // all known phones across clinics
}, { timestamps: true });

GlobalPatientSchema.index({ emails: 1 });
GlobalPatientSchema.index({ phones: 1 });

const PatientSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  organizationId: { type: String, required: true, ref: 'Organization' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  globalPatientId: { type: String, required: true, ref: 'GlobalPatient' },
  createdBy: { type: String, required: true, ref: 'Staff' },

  // Required fields
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  genderAssignedAtBirth: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
    required: true
  },

  // Optional fields
  dateOfBirth: { type: Date, default: null },
  age: { type: Number, default: null },           // auto-calculated if DOB provided
  externalPatientId: { type: String, default: '' }, // clinic-assigned alphanumeric

  // GDPR erasure state
  isErased: { type: Boolean, default: false },
  erasedAt: { type: Date, default: null },
  erasedBy: { type: String, default: null, ref: 'Staff' }
}, { timestamps: true });

// Per-clinic uniqueness on email and phone
PatientSchema.index({ clinicId: 1, email: 1 }, { unique: true });
PatientSchema.index({ clinicId: 1, phone: 1 }, { unique: true });
PatientSchema.index({ clinicId: 1, organizationId: 1 });
PatientSchema.index({ globalPatientId: 1 });
```

### 2.2 Medical Document

```javascript
const MedicalDocumentSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  patientId: { type: String, required: true, ref: 'Patient' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  uploadedBy: { type: String, required: true, ref: 'Staff' }, // attribution
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['image/jpeg', 'image/png', 'application/pdf'] },
  fileSizeBytes: { type: Number, required: true }
}, { timestamps: true });

MedicalDocumentSchema.index({ patientId: 1, clinicId: 1 });
```

### 2.3 Session

```javascript
const SessionSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  patientId: { type: String, required: true, ref: 'Patient' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  createdBy: { type: String, required: true, ref: 'Staff' },   // attribution
  assignedTo: { type: String, ref: 'Staff' },                  // responsibility

  sessionType: {
    type: String,
    enum: ['HAIR_ANALYSIS', 'SKIN_TREATMENT', 'HAIR_REMOVAL',
           'SCALP_TREATMENT', 'LASER_TREATMENT', 'CONSULTATION'],
    required: true
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SAVED', 'COMPLETED', 'DELETED'],
    default: 'DRAFT'
  },

  // Linked appointment (optional - session can be created independently)
  appointmentId: { type: String, default: null, ref: 'Appointment' },

  // Doctor's note (plain text)
  doctorsNote: { type: String, default: '' },

  // Questionnaire answers (stored as array for flexibility across session types)
  questionnaireAnswers: [{
    questionId: String,
    category: String,
    value: String,
    tags: [String]
  }],

  // Calculated scores (computed server-side, stored for report generation)
  rootCause: { type: String, default: null },
  stressScore: { type: Number, default: null },

  // AI analysis state
  aiAnalysisStatus: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },
  aiAnalysisCompletedAt: { type: Date, default: null },

  // Report
  reportUrl: { type: String, default: null },
  reportGeneratedAt: { type: Date, default: null },

  // Timestamps
  savedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

// One active DRAFT per patient per sessionType per clinic
SessionSchema.index(
  { patientId: 1, clinicId: 1, sessionType: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'DRAFT' }
  }
);
SessionSchema.index({ clinicId: 1, organizationId: 1, status: 1 });
SessionSchema.index({ patientId: 1, status: 1 });
```

### 2.4 Image Data (Global + Trichoscopy)

```javascript
const ImageDataSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  sessionId: { type: String, required: true, ref: 'Session' },
  patientId: { type: String, required: true, ref: 'Patient' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  organizationId: { type: String, required: true, ref: 'Organization' },
  createdBy: { type: String, required: true, ref: 'Staff' },

  imageType: { type: String, enum: ['GLOBAL', 'TRICHOSCOPY'], required: true },
  imageUrl: { type: String, required: true },
  sequence: { type: Number, default: 0 },

  // Global image fields
  globalPosition: {
    type: String,
    enum: ['ANTERIOR', 'FRONTAL', 'RIGHT_LATERAL', 'LEFT_LATERAL', 'POSTERIOR',
           'LEFT_TEMPORAL', 'RIGHT_TEMPORAL', 'SUPERIOR', 'TOP_OF_THE_HEAD', 'VERTEX'],
    default: null
  },

  // Trichoscopy image fields
  trichoscopyPosition: {
    type: String,
    enum: ['P1_FRONTAL', 'P2_LEFT_TEMPORAL', 'P3_RIGHT_TEMPORAL',
           'P4_TOP_OF_HEAD', 'P5_CROWN', 'P6_OCCIPITAL', 'ADDITIONAL'],
    default: null
  },
  headDiagram: { type: String, enum: ['FRONT', 'LEFT', 'RIGHT', 'BACK'], default: null },
  positionX: { type: Number, default: null }, // (x,y) tap point on head diagram
  positionY: { type: Number, default: null },

  // Image adjustments (persisted per image)
  brightness: { type: Number, default: 50 }, // 0-100
  contrast: { type: Number, default: 50 },   // 0-100

  // AI analysis results
  hairLossStage: { type: String, default: null },  // global images only
  hairCount: { type: Number, default: null },       // trichoscopy only
  density: { type: Number, default: null },
  thickness: { type: Number, default: null },
  coveragePercent: { type: Number, default: null }
}, { timestamps: true });

ImageDataSchema.index({ sessionId: 1, imageType: 1 });
ImageDataSchema.index({ sessionId: 1, trichoscopyPosition: 1 });
```

### 2.5 Annotation (Follicle / Strand)

```javascript
const AnnotationSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  imageDataId: { type: String, required: true, ref: 'ImageData' },
  sessionId: { type: String, required: true, ref: 'Session' },
  clinicId: { type: String, required: true, ref: 'Clinic' },

  annotationType: { type: String, enum: ['FOLLICLE', 'STRAND'], required: true },
  source: { type: String, enum: ['AI', 'HUMAN'], required: true },

  // Follicle: circle at (x, y)
  x: { type: Number, default: null },
  y: { type: Number, default: null },

  // Strand: 3-point rectangle
  p1x: { type: Number, default: null }, // root
  p1y: { type: Number, default: null },
  p2x: { type: Number, default: null }, // direction
  p2y: { type: Number, default: null },
  p3x: { type: Number, default: null }, // thickness
  p3y: { type: Number, default: null },

  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
}, { timestamps: true });

AnnotationSchema.index({ imageDataId: 1, isDeleted: 1 });
AnnotationSchema.index({ sessionId: 1, source: 1 });
```

### 2.6 Product Recommendation (Session-level)

```javascript
const SessionProductSchema = new Schema({
  _id: { type: String, default: () => uuidv4() },
  sessionId: { type: String, required: true, ref: 'Session' },
  productId: { type: String, required: true, ref: 'Product' },
  clinicId: { type: String, required: true, ref: 'Clinic' },
  routine: { type: String, default: '' }, // usage schedule
  addedBy: { type: String, required: true, ref: 'Staff' }
}, { timestamps: true });

SessionProductSchema.index({ sessionId: 1 });
```

---

## 3. Key Flows

### 3.1 globalPatientId Assignment (Atomic)

```javascript
async function assignGlobalPatientId(email, phone) {
  // Atomic upsert - prevents race conditions on concurrent patient creation
  const globalPatient = await GlobalPatient.findOneAndUpdate(
    { $or: [{ emails: email }, { phones: phone }] },
    {
      $addToSet: {
        emails: email,
        phones: phone
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return globalPatient._id; // this is the globalPatientId
}
```

### 3.2 Session Save Flow

```javascript
async function saveSession(sessionId, ctx) {
  const session = await Session.findById(sessionId);

  // Validate: exactly 6 mandatory trichoscopy positions present
  const trichoscopyImages = await ImageData.find({
    sessionId, imageType: 'TRICHOSCOPY', isDeleted: false
  });
  const mandatoryPositions = ['P1_FRONTAL', 'P2_LEFT_TEMPORAL', 'P3_RIGHT_TEMPORAL',
                               'P4_TOP_OF_HEAD', 'P5_CROWN', 'P6_OCCIPITAL'];
  const presentPositions = trichoscopyImages.map(i => i.trichoscopyPosition);
  const missingPositions = mandatoryPositions.filter(p => !presentPositions.includes(p));
  if (missingPositions.length > 0) throw new Error('TRICHOSCOPY_MANDATORY_POSITION_MISSING');

  // Validate: at least one FRONTAL global image
  const frontalImage = await ImageData.findOne({
    sessionId, imageType: 'GLOBAL', globalPosition: 'FRONTAL'
  });
  if (!frontalImage) throw new Error('FRONTAL_IMAGE_REQUIRED');

  // Atomic: update session + write audit log + write outbox event
  await mongoose.startSession().then(async (dbSession) => {
    await dbSession.withTransaction(async () => {
      await Session.findByIdAndUpdate(sessionId,
        { status: 'SAVED', savedAt: new Date() },
        { session: dbSession }
      );
      await AuditLog.create([{ action: 'SESSION_SAVED', resourceId: sessionId, ... }],
        { session: dbSession }
      );
      await OutboxEvent.create([{
        eventType: 'SessionSaved',
        aggregateType: 'SESSION',
        aggregateId: sessionId,
        payload: { sessionId, patientId: session.patientId, clinicId: session.clinicId }
      }], { session: dbSession });
    });
  });
}
```

### 3.3 AI Analysis Completion Flow

```javascript
// Triggered by AIAnalysisCompleted event (consumed from event bus)
async function handleAIAnalysisCompleted(event) {
  const { sessionId, results } = event.payload;

  await mongoose.startSession().then(async (dbSession) => {
    await dbSession.withTransaction(async () => {
      // Update image data with AI results
      for (const result of results.trichoscopyImages) {
        await ImageData.findByIdAndUpdate(result.imageId, {
          hairCount: result.hairCount,
          density: result.density,
          thickness: result.thickness
        }, { session: dbSession });
      }

      // Update session status to COMPLETED
      await Session.findByIdAndUpdate(sessionId,
        { status: 'COMPLETED', aiAnalysisStatus: 'COMPLETED', completedAt: new Date() },
        { session: dbSession }
      );

      // Write audit log
      await AuditLog.create([{ action: 'SESSION_COMPLETED', resourceId: sessionId, ... }],
        { session: dbSession }
      );

      // Emit SessionCompleted via outbox
      await OutboxEvent.create([{
        eventType: 'SessionCompleted',
        aggregateType: 'SESSION',
        aggregateId: sessionId,
        payload: { sessionId, patientId: ..., clinicId: ..., appointmentId: ... }
      }], { session: dbSession });
    });
  });
}
```

---

## 4. GraphQL Schema (Patients & Sessions)

### 4.1 Types

```graphql
type Patient {
  id: UUID!
  clinicId: UUID!
  organizationId: UUID!
  firstName: String!
  lastName: String!
  email: String!
  phone: String!
  genderAssignedAtBirth: GenderAssignedAtBirth!
  dateOfBirth: DateTime
  age: Int
  externalPatientId: String
  isErased: Boolean!
  sessions(sessionType: SessionType, status: SessionStatus, first: Int, after: String): SessionConnection!
  medicalDocuments: [MedicalDocument!]!
  treatmentProgressGraph(sessionType: SessionType): TreatmentProgressGraph!
  createdAt: DateTime!
  updatedAt: DateTime!
  # globalPatientId is NOT exposed to staff - Hairscope Care App only
}

type PatientConnection {
  edges: [PatientEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PatientEdge {
  cursor: String!
  node: Patient!
}

type MedicalDocument {
  id: UUID!
  patientId: UUID!
  title: String!
  description: String
  fileUrl: URL!
  fileType: String!
  fileSizeBytes: Int!
  uploadedBy: UUID!
  createdAt: DateTime!
}

type TreatmentProgressGraph {
  sessionType: SessionType!
  dataPoints: [ProgressDataPoint!]!
}

type ProgressDataPoint {
  sessionId: UUID!
  date: DateTime!
  hairCount: Float
  thickness: Float
  coverage: Float
}

type Session {
  id: UUID!
  patientId: UUID!
  clinicId: UUID!
  sessionType: SessionType!
  status: SessionStatus!
  appointmentId: UUID
  doctorsNote: String
  rootCause: String
  stressScore: Float
  aiAnalysisStatus: AsyncOperationStatus!
  reportUrl: URL
  globalImages: [ImageData!]!
  trichoscopyImages: [ImageData!]!
  questionnaireAnswers: [QuestionnaireAnswer!]!
  productRecommendations: [SessionProduct!]!
  savedAt: DateTime
  completedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type SessionConnection {
  edges: [SessionEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type SessionEdge {
  cursor: String!
  node: Session!
}

type ImageData {
  id: UUID!
  sessionId: UUID!
  imageType: String!
  imageUrl: URL!
  globalPosition: GlobalImagePosition
  trichoscopyPosition: TrichoscopyPosition
  headDiagram: HeadDiagram
  positionX: Float
  positionY: Float
  brightness: Int!
  contrast: Int!
  hairLossStage: String
  hairCount: Float
  density: Float
  thickness: Float
  coveragePercent: Float
  annotations: [Annotation!]!
}

type Annotation {
  id: UUID!
  annotationType: AnnotationType!
  source: AnnotationSource!
  x: Float
  y: Float
  p1x: Float
  p1y: Float
  p2x: Float
  p2y: Float
  p3x: Float
  p3y: Float
}

type QuestionnaireAnswer {
  questionId: String!
  category: QuestionnaireCategory!
  value: String!
  tags: [String!]!
}

type SessionProduct {
  id: UUID!
  product: Product!
  routine: String
}
```

### 4.2 Queries

```graphql
type Query {
  patient(id: UUID!): Patient
  patients(
    search: String
    first: Int
    after: String
  ): PatientConnection!

  session(id: UUID!): Session
  sessions(
    patientId: UUID!
    sessionType: SessionType
    status: SessionStatus
    first: Int
    after: String
  ): SessionConnection!

  imageData(id: UUID!): ImageData
  annotations(imageDataId: UUID!): [Annotation!]!

  asyncOperation(id: UUID!): AsyncOperation
}
```

### 4.3 Mutations

```graphql
type Mutation {
  # Patient
  createPatient(input: CreatePatientInput!): Patient!
  updatePatient(id: UUID!, input: UpdatePatientInput!): Patient!
  gdprErasePatient(patientId: UUID!, confirmed: Boolean!): Boolean!

  # Medical Documents
  uploadMedicalDocument(patientId: UUID!, input: MedicalDocumentInput!): MedicalDocument!
  deleteMedicalDocument(id: UUID!): Boolean!

  # Session lifecycle
  createSession(patientId: UUID!, sessionType: SessionType!, appointmentId: UUID): Session!
  saveSession(id: UUID!): Session!
  deleteSession(id: UUID!): Boolean!

  # Session content (editable on COMPLETED sessions too)
  updateDoctorsNote(sessionId: UUID!, note: String!): Session!
  updateQuestionnaireAnswers(sessionId: UUID!, answers: [QuestionnaireAnswerInput!]!): Session!
  addProductRecommendation(sessionId: UUID!, productId: UUID!, routine: String): SessionProduct!
  removeProductRecommendation(sessionProductId: UUID!): Boolean!

  # Images
  addGlobalImage(sessionId: UUID!, position: GlobalImagePosition!, fileId: UUID!): ImageData!
  addTrichoscopyImage(
    sessionId: UUID!
    position: TrichoscopyPosition!
    headDiagram: HeadDiagram!
    positionX: Float!
    positionY: Float!
    fileId: UUID!
  ): ImageData!

  # Annotations
  addFollicle(imageDataId: UUID!, x: Float!, y: Float!): Annotation!
  addStrand(imageDataId: UUID!, p1x: Float!, p1y: Float!, p2x: Float!, p2y: Float!, p3x: Float!, p3y: Float!): Annotation!
  deleteAnnotation(id: UUID!): Boolean!
  saveAnnotationEdits(imageDataId: UUID!): Session! # triggers report regeneration

  # Image adjustments
  updateImageAdjustments(imageDataId: UUID!, brightness: Int!, contrast: Int!): ImageData!

  # AI analysis
  resubmitImageForAnalysis(imageDataId: UUID!): AsyncOperation!

  # Report
  shareReport(sessionId: UUID!, channel: String!, recipientEmail: String): Boolean!
}
```

---

## 5. Access Control

| Operation | Allowed |
|-----------|---------|
| `createPatient`, `updatePatient` | Staff with `patients.create` / `patients.edit` |
| `gdprErasePatient` | Clinic_Admin, Organization_Admin only |
| `createSession`, `saveSession`, `deleteSession` | Staff with `patients.create` / `patients.delete` |
| `updateDoctorsNote`, `updateQuestionnaireAnswers` | Staff with `patients.edit` (DRAFT or COMPLETED) |
| `addProductRecommendation` | Staff with `patients.edit` |
| `addGlobalImage`, `addTrichoscopyImage` | Staff with `patients.create` (DRAFT only) |
| `addFollicle`, `addStrand`, `deleteAnnotation` | Staff with `patients.edit` (COMPLETED only) |
| `patients` query | Staff with `patients.view` (own clinic only) |
| Organization_Admin | No access to any patient/session operations |

---

## 6. Invariant Enforcement

| Invariant | Enforcement |
|-----------|-------------|
| GI-6: globalPatientId atomic | `findOneAndUpdate` with upsert on GlobalPatient collection |
| GI-7: One DRAFT per patient per sessionType per clinic | Partial unique index on Session collection |
| GI-11/12: Per-clinic email/phone uniqueness | Compound unique index on Patient collection |
| GI-13: SAVED/COMPLETED sessions not deletable | `deleteSession` resolver checks status before write |
| GI-15: Min 6 mandatory trichoscopy positions | `saveSession` resolver validates before status change |
| GI-16: Min 1 FRONTAL global image | `saveSession` resolver validates before status change |
| GI-17: Patients not deletable | No `deletePatient` mutation exposed |
| GI-19: Progress graph = COMPLETED only | `treatmentProgressGraph` query filters `status = COMPLETED` |
