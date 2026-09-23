---
inclusion: auto
description: "Documentation workflow rules for the Hairscope platform - branch discipline, deployment, versioning, and Nextra sync"
---

# Documentation Workflow Rules

## Branch Discipline

| Branch | Allowed Changes |
|--------|----------------|
| `doc/requirements` | `.kiro/specs/.../requirements/` + `docs/pages/internal/requirements/` |
| `doc/designs` | `.kiro/specs/.../designs/` + `docs/pages/internal/designs/` |
| `doc/implementations` | `.kiro/specs/.../implementations/` + `docs/pages/internal/implementations/` |
| `doc/public` | `docs/pages/guides/`, `docs/pages/features/`, `docs/pages/developer/`, `docs/pages/faq.mdx` |
| `doc-deploy` | Merges only — NEVER direct edits |

Cross-cutting files (`versions.json`, `theme.config.tsx`, `next.config.mjs`, `_meta.ts`, `VersionDropdown.tsx`) are changed on whichever branch triggers the need.

**When switching to a `doc/*` branch, always merge `doc-deploy` into it first to stay in sync.**

**If the user asks to edit a document that belongs to a different branch, remind them and ask to switch.**

## Deployment Rules

1. **NEVER push to `doc-deploy` without explicit user confirmation.** Always summarize changes and ask before merging.
2. After making changes on a working branch, push to that branch first.
3. **Update the group's changelog before deploying.** Every version bump must have a corresponding changelog entry.
4. **Changelogs describe what changed between published versions only.** Do not include internal discussions, reverted drafts, or changes that were never deployed. If something was changed and then reverted before deployment, it never happened from the reader's perspective.
5. Present a summary of what's ready to deploy.
6. Wait for explicit "deploy", "confirm", or equivalent before merging to `doc-deploy`.

## Versioning Algorithm

Format: `v{Major}.{Minor}.{Patch}`

| Level | Who Decides | Trigger |
|-------|-------------|---------|
| **Patch** | Automatic (no question) | Merge to `doc-deploy` with content changes |
| **No bump** | Automatic | Cosmetic-only changes (typos, formatting, links, styling) |
| **Minor** | Agent suggests, user confirms | New documents, new sections, structural rewrites, significant additions |
| **Major** | User decides | Breaking changes, new module groups, architectural rethink |

Each doc group has independent versioning: requirements, designs, implementations, guides, features, developer.

## Version Tagging

Tags follow the pattern: `{group}-v{version}` (e.g., `requirements-v1.1.2`, `designs-v1.0.1`)

## Nextra Sync Flow

Source `.md` files live in `.kiro/specs/hairscope-clinic-platform/{group}/`. They are copied to `docs/pages/internal/{group}/` as `.mdx` for Nextra rendering.

**Always sync source → Nextra after editing source files.**

## Spec-First Rule

**NEVER write directly to `docs/pages/` files.** All content MUST be authored in the spec source first:

1. Write/edit the `.md` file in `.kiro/specs/hairscope-clinic-platform/{group}/`
2. Copy the source file to `docs/pages/internal/{group}/` as `.mdx`
3. Update `_meta.ts` if adding a new page

The spec source is the single source of truth. Nextra `.mdx` files are derived copies.

## Before Editing Requirements

Always read design documents first as they may be more updated.

## When Confused

Ask the user before making changes.
