# Hairscope Clinic Platform - Design System

> **Version:** 1.0.0 | **Status:** Draft | **Branch:** designs

---

## Overview

Hairscope Clinic Platform is a **clinical-grade SaaS** for hair treatment clinics. The visual language is built on a **deep teal-forest canvas** (--primary-dark #064348) with warm skin and hair tone accents.

The base atmosphere is a **dark teal background** with semi-transparent white card surfaces layered over it, creating depth through translucency rather than shadows. Brand voltage comes from the **teal primary** (--primary-light #19878e) used on interactive elements, paired with warm skin-tone gradients for hero and report surfaces.

Type runs **Open Sans** throughout. Single font family, weight variation handles hierarchy (400 body, 600 headings).

**Key Characteristics:**
- Dark teal canvas (--primary-dark #064348) with semi-transparent white cards (gba(255,255,255,0.2))
- Teal primary action (--primary-light #19878e) on buttons, links, interactive elements
- Warm skin/hair tone gradients for clinical report surfaces
- Hair score color coding: green -> yellow -> orange -> red (healthy -> critical)
- Open Sans 400/600 - single family, no display/body split
- 15px border radius (--border-radius) - rounded, approachable
- 100px sidebar (--sidebar-width) - compact icon-only navigation


---

## Colors

All colors are CSS custom properties from globals.scss.

### Primary Brand

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| Primary Light | `--primary-light` | `#19878e` | Buttons, links, scrollbar thumb, active states, focus rings |
| Primary | `--primary` | `#184f54` | Primary surfaces, card headers |
| Primary Dark | `--primary-dark` | `#064348` | Page background, deepest surfaces |
| Secondary | `--secondary` | `#0b2327` | Sidebar, overlays, deepest dark |

### Neutral

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| Black | `--black` | `#222222` | Text on light surfaces |
| White | `--white` | `#fafafa` | Text on dark surfaces, card content |

### Skin & Hair Tones (Clinical Reference)

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| Light Skin 1 | `--light-skin-1` | `#f7e6df` | Warm background accents |
| Light Skin 2 | `--light-skin-2` | `#f7d8c4` | Gradient start, report headers |
| Dark Skin | `--dark-skin` | `#dfac98` | Mid-tone clinical reference |
| Light Hair | `--light-hair` | `#957c65` | Hair color reference |
| Light Hair 2 | `--light-hair-2` | `#9c754e` | Secondary hair tone |
| Dark Hair | `--dark-hair` | `#3a2c24` | Dark hair reference |

### Text

| Token | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| Text Primary | `--text-primary` | `#696969` | Body text, labels |
| Text Secondary | `--text-secondary` | `#d5bfb6` | Placeholder, muted labels |

### Hair Score Status Colors

Used in HairAnalysisCard, ColorCodes, HairGraph, and all clinical metric displays:

| Token | CSS Variable | Hex | Score | Meaning |
|-------|-------------|-----|-------|---------|
| Green | `--green` | `#87ff5b` | 75-100% | Healthy / Good density |
| Yellow | `--yellow` | `#ffcf20` | 50-74% | Moderate / Early thinning |
| Orange | `--orange` | `#ff9320` | 25-49% | Concerning / Significant loss |
| Red | `--red` | `#ea3700` | 0-24% | Critical / Severe loss |

### Gradients

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| Gradient 1 | `--gradient-1` | `linear-gradient(180deg, #f7d8c4 0%, #67b5d6 100%)` | Hero sections, report headers |
| Box BG | `--boxbg` | `linear-gradient(180deg, rgba(3,146,150,0.2) 0%, rgba(255,255,255,0.2) 100%)` | Card backgrounds |
| BG Grad | `--bggrad` | `linear-gradient(180deg, #f7d8c4 0%, #67b5d6 100%)` | Page background overlay |

### Card Surface

The primary card surface is semi-transparent white over the dark teal background:

`css
background: rgba(255, 255, 255, 0.2);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 15px;
`

---

## Typography

Font: **Open Sans** (single family throughout)

| Role | Size (desktop) | Size (mobile) | Weight | Usage |
|------|---------------|--------------|--------|-------|
| h1 | 48px | 44px | 400 | Page titles, hero headlines |
| h2 | 36px | 32px | 400 | Section headings |
| h3 | 24px | 20px | 400 | Card titles, sub-section heads |
| h4 | 20px | 16px | 400 | Feature labels, panel titles |
| h5 | 16px | 14px | 600 | List labels, emphasized UI text |
| h6 | 12px | 10px | 400 | Micro-labels, captions |
| Body | 18px | 16px | 400 | Running text, descriptions |
| Small | 14px | 13px | 400 | Meta text, dates, secondary info |
| Caption | 12px | 11px | 500 | Badges, tags, status labels |

Line height: 1.5em for body. No negative letter-spacing.

---

## Spacing & Layout

### Layout Constants

| Token | CSS Variable | Value | Usage |
|-------|-------------|-------|-------|
| Header Height | `--header-height` | `60px` | Top navigation bar |
| Border Radius | `--border-radius` | `15px` | Default card/button radius |
| Sidebar Width | `--sidebar-width` | `100px` | Left icon-only navigation |

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| xxs | 4px | Micro gaps, icon padding |
| xs | 8px | Tight component spacing |
| sm | 12px | Form field gaps |
| md | 16px | Default component padding |
| lg | 24px | Card internal padding |
| xl | 32px | Section internal padding |
| xxl | 48px | Between major components |
| section | 80px | Between page sections |

### Breakpoints

| Name | Value | Key Changes |
|------|-------|-------------|
| xs | 400px | Extra small mobile |
| sm | 640px | Mobile - single column, reduced type |
| md | 768px | Tablet - 2-column layouts |
| lg | 1024px | Desktop - full sidebar + content |
| xl | 1280px | Large desktop |

---

## Elevation & Depth

Depth comes from translucency and surface contrast, not shadows.

| Level | Treatment | Usage |
|-------|-----------|-------|
| Background | `--primary-dark` (#064348) solid | Page floor |
| Card surface | `rgba(255,255,255,0.2)` + backdrop-filter blur | All cards, panels |
| Elevated card | `rgba(255,255,255,0.3)` + stronger blur | Modals, dropdowns |
| Dark overlay | `rgba(0,0,0,0.5)` | Modal backdrops |
| Hairline | `rgba(255,255,255,0.1)` | Card borders, dividers |

---

## Shapes

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Small badges, micro elements |
| sm | 8px | Buttons, inputs, small cards |
| md | 12px | Feature cards, panels |
| lg | 15px | Default (`--border-radius`) - most cards |
| xl | 20px | Hero containers, large modals |
| pill | 9999px | Status badges, tags |
| full | 50% | Avatars, circular icon buttons |

---

## Components

### Navigation

**sidebar** - 100px wide icon-only left nav. Background `--secondary` (#0b2327). Active state: `--primary-light` (#19878e) accent. Collapses to bottom tab bar on mobile.

**top-nav** - 60px tall header. Background `--primary` (#184f54). Logo left, patient name center (on patient pages), avatar + notifications right.

### Buttons

**button-primary** - Background `--primary-light` (#19878e), text `--white`, 15px radius, 12px x 24px padding, 40px height, Open Sans 14px/600. Active: darkens to `--primary` (#184f54).

**button-secondary** - `rgba(255,255,255,0.15)` surface, `--white` text, 1px `rgba(255,255,255,0.3)` border.

**button-ghost** - No background, `--white` text. Tertiary actions, inline links.

**button-icon-circular** - 36px circular. `rgba(255,255,255,0.15)` background, `--white` icon. Camera, zoom, annotation tools.

**button-danger** - Background `--red` (#ea3700), `--white` text. Delete, remove, critical actions.

### Cards

**patient-card** - `rgba(255,255,255,0.2)` surface, 15px radius, 24px padding. Patient avatar, name, last session date, quick actions.

**session-card** - Analysis session summary. Same surface. Session date, status badge, hair score indicator, frontal image thumbnail.

**hair-analysis-card** - Trichoscopy result card. Dark surface (`--primary` #184f54), 15px radius. Trichoscopy image, hair count, density, thickness, hair score color indicator.

**stat-card** - Dashboard KPI card. Semi-transparent white, 15px radius, 24px padding. Metric value in h3, label in h6, trend indicator.

### Clinical Components

**trichoscopy-image** - Core clinical image viewer. Zoom/pan (react-zoom-pan-pinch), annotation overlay (follicles as circles, strands as 3-point rectangles), brightness/contrast controls, position marker.

**edit-analysis-image** - Annotation editing canvas. Three modes: Follicle (click to place circle), Strand (3-point rectangle), Delete (click to remove). No undo/redo.

**hair-root** - Individual follicle. Circle at (x, y). Color: `--primary-light` for AI-generated, `--white` for human-drawn (backend tracks source, UI does not differentiate).

**hair-strand** - Individual strand. 3-point rectangle: P1 (root), P2 (direction), P3 (thickness). Rendered at root position only.

**head-image** - Head diagram for trichoscopy position marking. 4 views: Front, Left, Right, Back. Single position marker per image.

**hair-graph** - Treatment progress graph (Recharts). Plots hairCount, thickness, coverage over COMPLETED sessions. Color-coded lines using hair score palette.

**bar-controler** - Brightness/contrast sliders. Range 0-100, default 50. Persisted per trichoscopy image.

**questions-form** - Session questionnaire. 5 categories x 5 questions + Stress questionnaire (~10 questions). Shows stress-o-meter score after submission.

### Status Badges

**status-badge** - Pill-shaped. Color by status:
- ACTIVE / NEW -> `--primary-light` (#19878e)
- COMPLETED -> `--green` (#87ff5b) with dark text
- PROGRESS / CONTACTED -> `--yellow` (#ffcf20) with dark text
- CANCEL / LOST -> `--red` (#ea3700)
- PENDING / QUALIFIED -> `--orange` (#ff9320) with dark text

**session-status-badge** - Session lifecycle:
- DRAFT -> `--text-secondary` (#d5bfb6)
- SAVED -> `--yellow` (#ffcf20) with dark text
- COMPLETED -> `--green` (#87ff5b) with dark text

---

## Do's and Don'ts

### Do
- Use dark teal canvas as the page floor. Never use pure white or cool gray as background.
- Use `--primary-light` (#19878e) for all primary interactive elements.
- Use semi-transparent white cards (`rgba(255,255,255,0.2)`) over the dark background.
- Use the hair score color palette (green/yellow/orange/red) consistently for all clinical metrics.
- Use 15px border radius as the default.
- Show actual product chrome (trichoscopy images, annotation canvas, hair graphs) in onboarding surfaces.

### Don't
- Don't use pure white or light gray as the page background.
- Don't use hair score colors for non-clinical status indicators - they carry specific clinical meaning.
- Don't add heavy drop shadows. Depth comes from translucency.
- Don't use skin/hair tone colors for UI elements - they are clinical reference tones.
- Don't use gradients as generic backgrounds - reserve for report headers and hero sections.

---

## Visual Style Summary

**Background:** `#064348` (primary-dark) with background image overlay
**Cards:** `rgba(255,255,255,0.2)` semi-transparent white
**Primary action:** `#19878e` (primary-light) teal
**Font:** Open Sans, 400/600 weight
**Radius:** 15px default
**Depth:** Translucency, not shadows
**Clinical palette:** Green (#87ff5b) / Yellow (#ffcf20) / Orange (#ff9320) / Red (#ea3700)
