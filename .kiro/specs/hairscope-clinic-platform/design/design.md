# Hairscope Clinic Platform - Design System

> **Version:** 1.0.0
> **Status:** Draft
> **Branch:** designs
> **Source:** Extracted from `hairscope` frontend (Next.js 14 + SCSS)

This document defines the design system for the Hairscope Clinic Platform - the colors, typography, spacing, components, and UI patterns used across the web app, and to be aligned with the mobile apps.

---

## 1. Color Palette

All colors are defined as CSS custom properties in `:root` and referenced via SCSS variables.

### Primary Brand Colors

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| `$primary-light` | `--primary-light` | `#19878e` | Hover states, active links, scrollbar thumb |
| `$primary` | `--primary` | `#184f54` | Primary buttons, key UI elements |
| `$primary-dark` | `--primary-dark` | `#064348` | Page background, dark surfaces |
| `$secondary` | `--secondary` | `#0b2327` | Deepest dark, sidebar, overlays |

### Neutral Colors

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| `$black` | `--black` | `#222222` | Text on light backgrounds |
| `$white` | `--white` | `#fafafa` | Text on dark backgrounds, card surfaces |
| `$pure-black` | `--pure-black` | `#000000` | Absolute black |

### Skin & Hair Tones (Clinical UI)

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| `$light-skin-1` | `--light-skin-1` | `#f7e6df` | Background gradients, warm tones |
| `$light-skin-2` | `--light-skin-2` | `#f7d8c4` | Gradient start, warm accents |
| `$dark-skin` | `--dark-skin` | `#dfac98` | Mid-tone skin reference |
| `$light-hair` | `--light-hair` | `#957c65` | Hair color reference |
| `$light-hair-2` | `--light-hair-2` | `#9c754e` | Secondary hair tone |
| `$dark-hair` | `--dark-hair` | `#3a2c24` | Dark hair reference |

### Text Colors

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| `$text-primary` | `--text-primary` | `#696969` | Body text, labels |
| `$text-secondary` | `--text-secondary` | `#d5bfb6` | Placeholder text, muted labels |

### Status / Alert Colors

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| `$green` | `--green` | `#87ff5b` | Success, healthy hair score |
| `$yellow` | `--yellow` | `#ffcf20` | Warning, moderate hair score |
| `$orange` | `--orange` | `#ff9320` | Caution, elevated concern |
| `$red` | `--red` | `#ea3700` | Error, critical hair score |

### Hair Score Color Coding

Used in `HairAnalysisCard` and `ColorCodes` components:

```
#87ff5b  Green  - Healthy / Good density
#ffcf20  Yellow - Moderate / Thinning
#ff9320  Orange - Concerning / Significant loss
#ea3700  Red    - Critical / Severe loss
```

### Gradients

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `$gradient-1` | `--gradient-1` | `linear-gradient(180deg, #f7d8c4 0%, #67b5d6 100%)` | Hero sections |
| `$boxbg` | `--boxbg` | `linear-gradient(180deg, rgba(3,146,150,0.2) 0%, rgba(255,255,255,0.2) 100%)` | Card backgrounds |
| `$bggrad` | `--bggrad` | `linear-gradient(180deg, #f7d8c4 0%, #67b5d6 100%)` | Page background gradient |

---

## 2. Typography

### Font Family

```css
font-family: 'Open Sans', sans-serif;
```

### Type Scale

| Element | Size (desktop) | Size (mobile ≤640px) | Weight |
|---------|---------------|---------------------|--------|
| `h1` | 48px | 44px | Default |
| `h2` | 36px | 32px | Default |
| `h3` | 24px | 20px | Default |
| `h4` | 20px | 16px | Default |
| `h5` | 16px | 14px | 600 |
| `h6` | 12px | 10px | 400 |
| `p` | 18px | 16px | 400, line-height: 1.5em |

---

## 3. Spacing & Layout

### Layout Constants

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| `$header-height` | `--header-height` | `60px` | Top navigation bar height |
| `$border-radius` | `--border-radius` | `15px` | Default card/button border radius |
| `$sidebarWidth` | `--sidebar-width` | `100px` | Left sidebar width |

### Breakpoints

| Name | Variable | Value | Usage |
|------|----------|-------|-------|
| `xs` | `$xs` | `400px` | Extra small devices |
| `sm` | `$sm` | `640px` | Small / mobile |
| `md` | `$md` | `768px` | Tablet |
| `lg` | `$lg` | `1024px` | Desktop |
| `xl` | `$xl` | `1280px` | Large desktop |

### SCSS Breakpoint Mixins

```scss
@include xs { /* max-width: 400px */ }
@include sm { /* max-width: 640px */ }
@include md { /* max-width: 768px */ }
@include lg { /* max-width: 1024px */ }
@include xl { /* max-width: 1280px */ }
```

---

## 4. Component Library

Components are located in `src/common/` and `src/lib/`. Below is the inventory with usage notes.

### 4.1 Layout Components

| Component | Path | Description |
|-----------|------|-------------|
| `Sidebar` | `common/Sidebar` | Left navigation sidebar (100px wide) |
| `LeftBoxLayout` | `common/LeftBoxLayout` | Two-column layout with left panel |
| `SideBySideBoxes` | `common/SideBySideBoxes` | Side-by-side comparison layout |
| `Containers` | `common/Containers` | Generic container wrappers |
| `TabContainer` | `common/TabContainer` | Tabbed content container |

### 4.2 Form Components

| Component | Path | Description |
|-----------|------|-------------|
| `FormComponents` | `common/FormComponents` | Input, Select, Textarea wrappers |
| `Button` | `common/Button` | Primary, secondary, ghost button variants |
| `Checkbox` | `common/Checkbox` | Styled checkbox |
| `SearchBar` | `common/SearchBar` | Search input with icon |
| `CategoryToggle` | `common/CategoryToggle` | Toggle between categories |
| `ReminderInputGroup` | `common/ReminderInputGroup` | Reminder time/type input group |

### 4.3 Data Display

| Component | Path | Description |
|-----------|------|-------------|
| `Table` | `common/Table` | Data table with sorting |
| `HairTable` | `common/HairTable` | Hair analysis data table |
| `HairGraph` | `common/HairGraph` | Treatment progress graph (Recharts) |
| `HairAnalysisCard` | `common/HairAnalysisCard` | Session analysis summary card |
| `ColorCodes` | `common/ColorCodes` | Hair score color legend |
| `IconText` | `common/IconText` | Icon + text combination |
| `Title` | `common/Title` | Section title component |

### 4.4 Clinical / Image Components

| Component | Path | Description |
|-----------|------|-------------|
| `TrichoscopyImage` | `common/TrichoscopyImage` | Trichoscopy image viewer with annotations |
| `EditAnalysisImage` | `common/EditAnalysisImage` | Annotation editing canvas (follicles + strands) |
| `HairRoot` | `common/HairRoot` | Follicle (root point) rendering |
| `HairStrand` | `common/HairStrand` | Hair strand (3-point rectangle) rendering |
| `HeadImage` | `common/HeadImage` | Head diagram for position marking |
| `GalleryImage` | `common/GalleryImage` | Image gallery viewer |
| `ImagePreview` | `common/ImagePreview` | Single image preview |
| `ImageScale` | `common/ImageScale` | Image scale/measurement overlay |
| `BarControler` | `common/BarControler` | Brightness/contrast slider controls |
| `CameraCapture` | `common/CameraCapture` | Camera capture interface |
| `AddToReportBtn` | `common/AddToReportBtn` | Add image/section to report button |

### 4.5 Utility / Overlay Components

| Component | Path | Description |
|-----------|------|-------------|
| `Loading` | `common/Loading` | Loading spinner |
| `Skeleton` | `common/Skeleton` | Skeleton loading placeholder |
| `NotesContainer` | `common/NotesContainer` | Notes/comments container |
| `PatientNameHeader` | `common/PatientNameHeader` | Patient name + info header bar |
| `PlanExpired` | `common/PlanExpired` | Plan expired overlay/banner |
| `ClinicDetailsMissing` | `common/ClinicDetailsMissing` | Clinic setup incomplete warning |
| `OtpVerificationModal` | `common/OtpVerificationModal` | OTP verification modal |
| `QuestionsForm` | `common/QuestionsForm` | Session questionnaire form |

### 4.6 Library Components (Third-party wrappers)

| Component | Path | Library | Description |
|-----------|------|---------|-------------|
| `ZoomWrapper` | `lib/ZoomWrapper` | `react-zoom-pan-pinch` | Zoom/pan wrapper for images |
| `RoiBox` | `lib/RoiBox` | Custom | Region of interest selection box |
| `ImageCropper` | `lib/ImageCropper` | `react-advanced-cropper` | Image crop interface |
| `ImageUploadWithCropper` | `lib/ImageUploadWithCropper` | Combined | Upload + crop flow |
| `PopUpModal` | `lib/PopUpModal` | `reactjs-popup` | Modal dialog |
| `DatePickerWrapper` | `lib/DatePickerWrapper` | `react-datepicker` | Date picker |
| `FileViewer` | `lib/FileViewer` | `@cyntler/react-doc-viewer` | PDF/image document viewer |
| `RichText` | `lib/RichText` | `@tiptap` | Rich text editor (Tiptap) |
| `Lightbox` | `lib/Lightbox.js` | `yet-another-react-lightbox` | Full-screen image lightbox |
| `Toast` | `lib/Toast.js` | `sonner` | Toast notifications |
| `PageProgressBar` | `lib/PageProgressBar.js` | `next-nprogress-bar` | Page load progress bar |

---

## 5. Key Third-Party Libraries

| Library | Version | Usage |
|---------|---------|-------|
| `next` | ^14.2.31 | Framework (App Router) |
| `@apollo/client` | ^3.10.3 | GraphQL client |
| `zustand` | ^4.4.5 | State management |
| `recharts` | ^2.12.7 | Charts (treatment progress graph) |
| `react-big-calendar` | ^1.19.4 | Appointments calendar view |
| `@tiptap/*` | ^3.x | Rich text editor (doctor notes) |
| `react-zoom-pan-pinch` | ^3.4.4 | Trichoscopy image zoom/pan |
| `react-advanced-cropper` | 0.20.0 | Image cropping |
| `react-phone-number-input` | ^3.3.7 | Phone number input with country code |
| `react-select` | ^5.8.0 | Searchable dropdowns |
| `react-datepicker` | ^8.7.0 | Date/time picker |
| `sonner` | ^1.4.41 | Toast notifications |
| `next-intl` | ^3.14.1 | i18n (8 languages) |
| `zod` | ^3.23.8 | Schema validation |
| `sass` | ^1.89.2 | SCSS compilation |

---

## 6. State Management (Zustand Stores)

| Store | File | Manages |
|-------|------|---------|
| `user` | `stores/user.js` | Authenticated staff member |
| `session` | `stores/session.js` | Current analysis session |
| `analysis` | `stores/analysis.js` | AI analysis data |
| `clinicData` | `stores/clinicData.js` | Clinic profile |
| `compare` | `stores/compare.js` | Session comparison state |
| `globalImagesAnalysis` | `stores/globalImagesAnalysis.js` | Global image AI results |
| `hairCoverage` | `stores/hairCoverage.js` | Hair coverage metrics |
| `reportData` | `stores/reportData.js` | Report generation state |
| `patientDocs` | `stores/patientDocs.js` | Patient medical documents |
| `appoinment` | `stores/appoinment.js` | Appointment state |
| `accessToken` | `stores/accessToken.js` | Auth token management |
| `featureFlag` | `stores/featureFlag.js` | Feature flags / plan gates |
| `liveView` | `stores/liveView.js` | Live camera view state |
| `zoomData` | `stores/zoomData.js` | Image zoom/pan state |
| `customTreatmentData` | `stores/customTreatmentData.js` | Custom treatment data |

---

## 7. Internationalization

The platform supports 8 languages via `next-intl`:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `es` | Spanish |
| `it` | Italian |
| `nl` | Dutch |
| `fr` | French |
| `ru` | Russian |
| `ar` | Arabic (RTL supported) |
| `de` | German |

RTL support is implemented via `[dir="rtl"]` CSS selector with logical properties.

---

## 8. CSS Architecture

```
src/styles/
  globals.scss          - CSS custom properties (:root), base styles, typography
  variables.scss        - SCSS variables referencing CSS custom properties + mixins + breakpoints
  variables.module.scss - CSS module exports for use in JS/TS
  _keyframe-animations.scss - Animation keyframes
  _variables-tiptap.scss    - Tiptap editor theme variables
```

### SCSS Utility Mixins

```scss
@mixin flexCenter()   // display:flex; justify-content:center; align-items:center
@mixin flexAround()   // display:flex; justify-content:space-around; align-items:center
@mixin leftToRightUnderlineOnHover($color) // animated underline on hover
```

### Utility Classes

```scss
.w-{1-100}  // width: 1% to 100%
.h-{1-100}  // height: 1% to 100%
.disabled   // opacity: 0.7; cursor: not-allowed
```

---

## 9. Background & Visual Style

The platform uses a **dark teal/forest green** color scheme with warm skin/hair tone accents:

- **Page background**: `#064348` (primary-dark) with a background image (`/images/MainBG.png`)
- **Cards/surfaces**: Semi-transparent white (`rgba(255,255,255,0.2)`) over the dark background
- **Scrollbar**: Dark background (`#222222`) with teal thumb (`#19878e`)
- **Border radius**: `15px` default (rounded, modern feel)
- **Font**: Open Sans (clean, medical-grade readability)

This creates a professional, clinical aesthetic that feels modern without being sterile.
