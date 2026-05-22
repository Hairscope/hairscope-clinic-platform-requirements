# Versioning

> Covers: Semantic versioning strategy, branch-based release flow, automated version bumps, changelog generation, and tag conventions for both backend and frontend repositories.

---

# 1. Versioning Standard

Both `hairscope-backend` and `hairscope-clinic-web` follow **Semantic Versioning 2.0.0** (SemVer):

```
v{MAJOR}.{MINOR}.{PATCH}
```

| Level | Trigger | Example |
|-------|---------|---------|
| **MAJOR** | Breaking API changes, incompatible schema migrations, major architectural shifts | `v1.0.0` → `v2.0.0` |
| **MINOR** | New features, new modules, new endpoints, backward-compatible additions | `v1.0.0` → `v1.1.0` |
| **PATCH** | Bug fixes, performance improvements, security patches, dependency updates | `v1.1.0` → `v1.1.1` |

### Pre-release Identifiers

| Identifier | Use | Example |
|------------|-----|---------|
| `-alpha.N` | Early development, unstable | `v0.1.0-alpha.1` |
| `-beta.N` | Feature-complete but under testing | `v1.2.0-beta.1` |
| `-rc.N` | Release candidate, final validation | `v1.2.0-rc.1` |

---

# 2. Branch Strategy

```
feature/* ──→ dev ──→ staging ──→ main
hotfix/*  ──→ main (cherry-pick back to dev)
```

| Branch | Purpose | Deploys To | Version Suffix |
|--------|---------|------------|----------------|
| `feature/*` | Active development | Local only | None |
| `dev` | Integration branch | Development environment | `-dev.{build}` |
| `staging` | Pre-production validation | Staging environment | `-rc.{N}` |
| `main` | Production releases | Production environment | Stable (no suffix) |

---

# 3. Version Lifecycle

## 3.1 Development Phase

1. Developer creates `feature/{name}` from `dev`
2. Work is committed using Conventional Commits (see Section 5)
3. PR is opened against `dev`
4. On merge to `dev`, version is auto-bumped based on commit types:
   - `feat:` → minor bump
   - `fix:` → patch bump
   - `feat!:` or `BREAKING CHANGE:` → major bump
5. Dev build tagged as `v{X.Y.Z}-dev.{timestamp}`

## 3.2 Staging Phase

1. When `dev` is stable, PR is opened from `dev` → `staging`
2. On merge, version becomes `v{X.Y.Z}-rc.1`
3. If fixes are needed, they go through `dev` → `staging` again as `-rc.2`, `-rc.3`, etc.
4. QA validation happens on staging environment

## 3.3 Production Release

1. When staging is validated, PR is opened from `staging` → `main`
2. On merge, the stable version `v{X.Y.Z}` is tagged
3. GitHub Release is created with auto-generated changelog
4. Docker images are tagged with the version number
5. Deployment to production is triggered

## 3.4 Hotfix Flow

1. Create `hotfix/{name}` from `main`
2. Fix the issue, commit with `fix:` prefix
3. PR directly to `main` (bypasses staging for critical fixes)
4. On merge, patch version is bumped: `v{X.Y.Z+1}`
5. Cherry-pick the fix back to `dev` and `staging`

---

# 4. Version Storage

## 4.1 Backend (`hairscope-backend`)

Version is stored in `package.json` at the workspace root:

```json
{
  "name": "hairscope-backend",
  "version": "0.1.0"
}
```

Individual packages (`packages/api`, `packages/shared`) inherit the root version.

## 4.2 Frontend (`hairscope-clinic-web`)

Version is stored in `package.json`:

```json
{
  "name": "hairscope-clinic-web",
  "version": "0.1.0"
}
```

## 4.3 Version Exposure

Both apps SHALL expose their version at runtime:

**Backend** — via the `/health` endpoint:

```json
{
  "status": "ok",
  "version": "1.2.3",
  "environment": "production",
  "timestamp": "2026-05-22T10:00:00Z"
}
```

**Frontend** — via `next.config.ts` environment variable:

```typescript
// next.config.ts
import packageJson from './package.json';

const nextConfig = {
  env: {
    APP_VERSION: packageJson.version,
  },
};
```

Accessible in components as `process.env.APP_VERSION`.

---

# 5. Conventional Commits

All commits MUST follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type | Description | Version Impact |
|------|-------------|----------------|
| `feat` | New feature | Minor |
| `fix` | Bug fix | Patch |
| `docs` | Documentation only | None |
| `style` | Code style (formatting, semicolons) | None |
| `refactor` | Code change that neither fixes nor adds | None |
| `perf` | Performance improvement | Patch |
| `test` | Adding or fixing tests | None |
| `build` | Build system or dependencies | None |
| `ci` | CI/CD configuration | None |
| `chore` | Maintenance tasks | None |

### Breaking Changes

Append `!` after type or include `BREAKING CHANGE:` in footer:

```
feat!: remove legacy patient API endpoints

BREAKING CHANGE: /api/v1/patients has been removed. Use GraphQL queries instead.
```

### Scopes (Optional)

Use module names as scopes:

```
feat(patients): add bulk import endpoint
fix(billing): correct tax calculation for UAE VAT
refactor(auth): extract token service into shared package
```

---

# 6. Git Tags

## 6.1 Tag Format

```
v{MAJOR}.{MINOR}.{PATCH}
```

Examples: `v1.0.0`, `v1.2.3`, `v2.0.0-rc.1`

## 6.2 Tag Rules

- Tags are created ONLY on `main` branch merges (stable releases)
- Pre-release tags (`-rc.N`, `-dev.N`) are created on respective branches
- Tags are annotated (not lightweight):

```bash
git tag -a v1.2.0 -m "Release v1.2.0: Patient module + Appointment scheduling"
```

- Tags are pushed to remote:

```bash
git push origin v1.2.0
```

---

# 7. Changelog Generation

Each repository maintains a `CHANGELOG.md` at the root, auto-generated from conventional commits.

## 7.1 Format

```markdown
# Changelog

## [1.2.0] - 2026-05-22

### Added
- Patient bulk import via CSV upload (#45)
- Appointment recurring series support (#52)

### Fixed
- Tax calculation rounding error for UAE VAT (#48)
- Session timer not pausing on tab switch (#50)

### Changed
- Upgraded MongoDB driver to v6.5 (#51)

## [1.1.0] - 2026-05-15

### Added
- Lead scoring algorithm (#38)
- Staff availability calendar view (#40)
```

## 7.2 Automation

Changelog is generated during the release process using commit history between tags:

```bash
# Generate changelog entries between last tag and HEAD
git log v1.1.0..HEAD --pretty=format:"%s" --no-merges
```

The CI pipeline SHALL auto-generate the changelog section and include it in the GitHub Release.

---

# 8. CI/CD Version Automation

## 8.1 On Push to `dev`

```yaml
# Excerpt from CI workflow
- name: Determine version bump
  id: version
  run: |
    # Analyze commits since last tag
    COMMITS=$(git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"%s")
    if echo "$COMMITS" | grep -q "BREAKING CHANGE\|!:"; then
      echo "bump=major" >> $GITHUB_OUTPUT
    elif echo "$COMMITS" | grep -q "^feat"; then
      echo "bump=minor" >> $GITHUB_OUTPUT
    else
      echo "bump=patch" >> $GITHUB_OUTPUT
    fi

- name: Bump version
  run: |
    npm version ${{ steps.version.outputs.bump }} --no-git-tag-message
    git push origin dev
```

## 8.2 On Merge to `main`

```yaml
- name: Create release tag
  run: |
    VERSION=$(node -p "require('./package.json').version")
    git tag -a "v${VERSION}" -m "Release v${VERSION}"
    git push origin "v${VERSION}"

- name: Create GitHub Release
  uses: softprops/action-gh-release@v2
  with:
    tag_name: v${{ env.VERSION }}
    generate_release_notes: true
```

---

# 9. Docker Image Tagging

Docker images follow the version tags:

| Branch | Image Tag | Example |
|--------|-----------|---------|
| `dev` | `dev-{sha}` | `hairscope-api:dev-abc1234` |
| `staging` | `rc-{version}` | `hairscope-api:rc-1.2.0` |
| `main` | `{version}` + `latest` | `hairscope-api:1.2.0`, `hairscope-api:latest` |

```yaml
# Docker build tags
tags: |
  gcr.io/${{ secrets.GCP_PROJECT }}/hairscope-api:${{ env.VERSION }}
  gcr.io/${{ secrets.GCP_PROJECT }}/hairscope-api:latest
```

---

# 10. Version Compatibility Matrix

Backend and frontend versions are independent but must maintain API compatibility:

| Frontend | Backend | Status |
|----------|---------|--------|
| `v1.x` | `v1.x` | Compatible |
| `v1.x` | `v2.x` | May break (check migration guide) |
| `v2.x` | `v1.x` | Not supported |

### Compatibility Rules

1. Backend MUST maintain backward compatibility within the same major version
2. Deprecated endpoints MUST remain functional for at least one minor version cycle
3. Frontend MUST handle graceful degradation when backend returns unknown fields
4. GraphQL schema changes MUST be additive (new fields/types) within a major version

---

# 11. Initial Version

Both repositories start at `v0.1.0` during initial development:

- `v0.x.x` — Pre-release, API may change without major bump
- `v1.0.0` — First stable release (production-ready with core modules)

The transition from `v0.x` to `v1.0.0` happens when:
1. Authentication & Authorization module is complete
2. At least 3 core modules are production-ready (Patients, Appointments, Billing)
3. E2E test coverage exceeds 80% for critical paths
4. Security audit is passed
