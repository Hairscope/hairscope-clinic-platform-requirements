# Module 4: Sessions — Frontend Tasks

> Implementation tasks for the Sessions module frontend (trichoscopy sessions, image capture, AI analysis, annotations, questionnaires, recommendations, reports).

---

## Section 1: GraphQL Service Layer

**Branch:** `feature/sessions`

### Task 1: Session Service
- [ ] 1.1 Create `src/services/session.service.ts`
- [ ] 1.2 Add GET_SESSION query (full session detail by ID)
- [ ] 1.3 Add CREATE_SESSION mutation
- [ ] 1.4 Add SAVE_SESSION mutation (DRAFT -> SAVED)
- [ ] 1.5 Add DELETE_SESSION mutation (DRAFT only)
- [ ] 1.6 Add UPDATE_SESSION_QUESTIONNAIRE mutation
- [ ] 1.7 Add UPDATE_SESSION_RECOMMENDATIONS mutation
- [ ] 1.8 Add UPDATE_DOCTORS_NOTE mutation
- [ ] 1.9 Add SESSION_STATUS_SUBSCRIPTION subscription (`sessionStatusChanged`)

### Task 2: Image Service
- [ ] 2.1 Create `src/services/session-image.service.ts`
- [ ] 2.2 Add UPLOAD_GLOBAL_IMAGE mutation
- [ ] 2.3 Add UPLOAD_TRICHOSCOPY_IMAGE mutation
- [ ] 2.4 Add DELETE_IMAGE mutation
- [ ] 2.5 Add RESUBMIT_IMAGE_FOR_ANALYSIS mutation

### Task 3: Annotation Service
- [ ] 3.1 Create `src/services/annotation.service.ts`
- [ ] 3.2 Add GET_IMAGE_ANNOTATIONS query
- [ ] 3.3 Add SAVE_ANNOTATIONS mutation (follicles + strands batch)

### Task 4: Report Service
- [ ] 4.1 Create `src/services/report.service.ts`
- [ ] 4.2 Add GENERATE_REPORT mutation
- [ ] 4.3 Add GET_REPORT query (download URL)
- [ ] 4.4 Add SHARE_REPORT mutation (email, WhatsApp, shareable link)
- [ ] 4.5 Add GENERATE_TREATMENT_PLAN mutation
- [ ] 4.6 Add GENERATE_PRESCRIPTION mutation
- [ ] 4.7 Add GET_ASYNC_OPERATION_STATUS query

---

## Section 2: Custom Hooks

**Branch:** `feature/sessions`

### Task 5: Session Detail Hook
- [ ] 5.1 Create `src/hooks/useSession.ts`
- [ ] 5.2 Fetch session by ID with useQuery
- [ ] 5.3 Subscribe to status changes via subscription
- [ ] 5.4 Return `{ session, loading, error, refetch }`

### Task 6: Image Capture Hook
- [ ] 6.1 Create `src/hooks/useImageCapture.ts`
- [ ] 6.2 Manage upload state (progress, errors)
- [ ] 6.3 Handle global image positions (one per position)
- [ ] 6.4 Handle trichoscopy image positions (head diagram coordinates)
- [ ] 6.5 Return `{ uploadGlobal, uploadTrichoscopy, deleteImage, uploading }`

### Task 7: Annotation Editor Hook
- [ ] 7.1 Create `src/hooks/useAnnotationEditor.ts`
- [ ] 7.2 Manage follicles and strands state (add, delete)
- [ ] 7.3 Track active tool (follicle, strand, delete, pan)
- [ ] 7.4 Manage brightness/contrast settings
- [ ] 7.5 Return `{ annotations, activeTool, setTool, addFollicle, addStrand, deleteAnnotation, save, brightness, contrast }`

### Task 8: Questionnaire Hook
- [ ] 8.1 Create `src/hooks/useQuestionnaire.ts`
- [ ] 8.2 Fetch questionnaire categories and questions for session type
- [ ] 8.3 Manage answers state per category
- [ ] 8.4 Calculate root cause and stress score on completion
- [ ] 8.5 Return `{ categories, answers, setAnswer, rootCause, stressScore, save, loading }`

### Task 9: Session Recommendations Hook
- [ ] 9.1 Create `src/hooks/useSessionRecommendations.ts`
- [ ] 9.2 Manage recommended items list (catalog items + kits)
- [ ] 9.3 Support routine customization per item
- [ ] 9.4 Return `{ recommendations, addItem, removeItem, updateRoutine, save, loading }`

---

## Section 3: Pages

**Branch:** `feature/sessions`

### Task 10: Session Detail Page
- [ ] 10.1 Create `src/app/(dashboard)/patients/[id]/sessions/[sessionId]/page.tsx`
- [ ] 10.2 Session header: patient name, session type, status badge, date
- [ ] 10.3 Tab navigation: Images, Questionnaire, Recommendations, Report
- [ ] 10.4 Status-aware UI (DRAFT: editable, SAVED: waiting for AI, COMPLETED: view + edit recommendations)
- [ ] 10.5 Save Session button (DRAFT -> SAVED) with validation
- [ ] 10.6 Delete Session button (DRAFT only) with confirmation

### Task 11: Image Capture Tab
- [ ] 11.1 Create image capture section within session page
- [ ] 11.2 Global images grid with position labels
- [ ] 11.3 Trichoscopy images grid with head diagram position markers
- [ ] 11.4 Upload button per position (camera/file picker)
- [ ] 11.5 Mandatory position indicators (P1-P6 for hair analysis)
- [ ] 11.6 Image replace functionality (click existing to replace)

### Task 12: Annotation Edit Page
- [ ] 12.1 Create `src/app/(dashboard)/patients/[id]/sessions/[sessionId]/annotate/[imageId]/page.tsx`
- [ ] 12.2 Full-screen canvas with trichoscopy image
- [ ] 12.3 Toolbar: Follicle tool, Strand tool, Delete mode, Zoom, Pan
- [ ] 12.4 Brightness/contrast sliders
- [ ] 12.5 Save button (emits AnnotationEditSaved, navigates back)
- [ ] 12.6 Only accessible for COMPLETED sessions

### Task 13: Compare View Page
- [ ] 13.1 Create `src/app/(dashboard)/patients/[id]/sessions/compare/page.tsx`
- [ ] 13.2 Session selector (two sessions of same type)
- [ ] 13.3 Side-by-side image comparison (matched by position)
- [ ] 13.4 Metrics comparison table (hairCount, density, thickness)

---

## Section 4: Module Components

**Branch:** `feature/sessions`

### Task 14: Head Diagram Component
- [ ] 14.1 Create `src/components/modules/sessions/HeadDiagram.tsx`
- [ ] 14.2 SVG diagrams for FRONT, LEFT, RIGHT, BACK views
- [ ] 14.3 Click to place positional point (x, y coordinates)
- [ ] 14.4 Display existing position markers
- [ ] 14.5 Props: `diagram`, `positions`, `onPositionSelect`

### Task 15: Global Image Grid
- [ ] 15.1 Create `src/components/modules/sessions/GlobalImageGrid.tsx`
- [ ] 15.2 Grid of position slots (ANTERIOR, FRONTAL, etc.)
- [ ] 15.3 Empty slot with upload trigger
- [ ] 15.4 Filled slot with image thumbnail and position label
- [ ] 15.5 FRONTAL position marked as required

### Task 16: Trichoscopy Image Grid
- [ ] 16.1 Create `src/components/modules/sessions/TrichoscopyImageGrid.tsx`
- [ ] 16.2 Grid of captured trichoscopy images with position markers
- [ ] 16.3 Mandatory position checklist (P1-P6)
- [ ] 16.4 Upload trigger with head diagram position selector
- [ ] 16.5 AI analysis status indicator per image (pending, complete, failed)
- [ ] 16.6 Resubmit button for failed images

### Task 17: Annotation Canvas
- [ ] 17.1 Create `src/components/modules/sessions/AnnotationCanvas.tsx`
- [ ] 17.2 Canvas rendering with zoom/pan (mouse + touch)
- [ ] 17.3 Follicle tool: click to place circle
- [ ] 17.4 Strand tool: 3-point rectangle (root, direction, thickness)
- [ ] 17.5 Delete mode: click annotation to remove
- [ ] 17.6 Render all annotations (AI + human, no visual distinction)

### Task 18: Questionnaire Form
- [ ] 18.1 Create `src/components/modules/sessions/QuestionnaireForm.tsx`
- [ ] 18.2 Category tabs (Daily Habits, Medical Conditions, etc.)
- [ ] 18.3 5 questions per category with answer inputs
- [ ] 18.4 Stress Test section (separate ~10 questions)
- [ ] 18.5 Root Cause display (auto-calculated)
- [ ] 18.6 StressOMeter score display with visual indicator

### Task 19: Recommendations Panel
- [ ] 19.1 Create `src/components/modules/sessions/RecommendationsPanel.tsx`
- [ ] 19.2 Catalog item search/picker (services, medications, cosmetics, supplements, kits)
- [ ] 19.3 Added items list with routine editor per item
- [ ] 19.4 Routine customization: schedule, frequency, duration, dosage, instructions
- [ ] 19.5 Remove item button
- [ ] 19.6 Stress-related suggestions when StressOMeter threshold met

### Task 20: Routine Editor
- [ ] 20.1 Create `src/components/modules/sessions/RoutineEditor.tsx`
- [ ] 20.2 Product routine: dosage, schedule (TimeSlot multi-select), frequency, duration, instructions
- [ ] 20.3 Service routine: frequency, duration, totalSessions, instructions
- [ ] 20.4 TimeSlot picker (Morning/Noon/Afternoon/Evening/Night × Before/After Meal)
- [ ] 20.5 Props: `routine`, `catalogItemType`, `onChange`

### Task 21: Report Actions
- [ ] 21.1 Create `src/components/modules/sessions/ReportActions.tsx`
- [ ] 21.2 Download PDF button
- [ ] 21.3 Share via Email button
- [ ] 21.4 Share via WhatsApp button
- [ ] 21.5 Generate shareable link button
- [ ] 21.6 Generate Treatment Plan button (with signature check)
- [ ] 21.7 Generate Prescription button (medications only, with signature check)

### Task 22: Session Status Badge
- [ ] 22.1 Create `src/components/modules/sessions/SessionStatusBadge.tsx`
- [ ] 22.2 DRAFT=warning, SAVED=info (with spinner), COMPLETED=success
- [ ] 22.3 AI processing indicator for SAVED status

---

## Section 5: Integration

**Branch:** `feature/sessions`

### Task 23: Navigation
- [ ] 23.1 Link from patient detail page sessions tab to session detail
- [ ] 23.2 Create Session button on patient page (checks no active DRAFT exists)
- [ ] 23.3 Link from session detail to annotation edit page per image
- [ ] 23.4 Compare Sessions button on patient page (navigates to compare view)
