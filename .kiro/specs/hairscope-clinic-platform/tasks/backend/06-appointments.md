# Module 6: Appointments — Backend Tasks

**Branch:** `feature/appointments-module`

### Task 1: Appointment Schema and Repository
- 1.1–1.3 Create schema and repository with unit tests

### Task 2: Appointment Error Codes
- 2.1–2.2 Add error codes and domain errors

### Task 3: Appointment Service
- 3.1–3.5 Implement book, reschedule (delete current → create new, linked via `rescheduledFrom`; still emits `AppointmentRescheduled`), cancel, complete, markNoShow
- 3.6 Write unit tests
- 3.7 Write property test: valid status transitions

### Task 4: Slot Availability Service
- 4.1–4.3 Implement slot checking with unit tests

### Task 5: Smart Scheduling Service
- 5.1–5.3 Implement least-busy assignment with unit tests

### Task 6: Appointment Resolver
- 6.1–6.4 Create resolver, DTOs, integration tests

### Task 7: Appointments Module Registration
- 7.1–7.4 Create module, wire into AppModule, barrel export
