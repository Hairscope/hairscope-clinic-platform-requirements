# Agent Instructions — hairscope-clinic-platform-requirements

## Branch discipline

This repo has several long-lived branches that are **not** ordinary feature
branches. Treat every branch as a deploy/publish target unless you have
verified otherwise — check `.github/workflows/` for a trigger on that branch
name before assuming it's safe to commit to directly.

- **`doc-deploy`** — pushing here triggers `.github/workflows/deploy-docs.yml`:
  it builds a Docker image from `./docs` and deploys it straight to the
  production GCP VM, restarting the live container. **Never commit directly
  to `doc-deploy`.** It only receives merge commits from the `doc/*` branches
  (e.g. `doc/designs`, `doc/implementations`) — it is a merge target, not a
  place to author changes.
- **`doc/designs`**, **`doc/implementations`**, **`doc/clinic-web`**,
  **`doc/public`**, **`doc/requirements`** — these are the actual authoring
  branches for the docs site. Documentation changes belong on one of these
  (or a new branch based off one of these), then get merged into
  `doc-deploy` deliberately, by a human, when ready to publish.
- **`main`** — never commit directly here either, same as any other repo.

## Before pushing anything in this repo

1. Run `git branch --show-current` and don't just trust it — check whether
   that branch name matches a workflow trigger in `.github/workflows/*.yml`.
2. If the current branch is a deploy/publish target (`doc-deploy`, `main`,
   or anything else with a push-triggered workflow), create a new branch
   first (e.g. `docs/<short-description>`) and push there instead.
3. For documentation-only changes, branch off the relevant `doc/*` branch
   (e.g. `doc/implementations` for anything under `docs/pages/internal/`),
   not off `doc-deploy`.
4. Only push directly to `doc-deploy` if the user explicitly asks to deploy
   the docs site right now — treat that as a high-risk, production-affecting
   action requiring explicit confirmation, per standard safety rules.

## Incident log

- 2026-09-22: A production-readiness-checklist update was committed and
  pushed directly to `doc-deploy` by mistake (the branch was already
  checked out locally; its deploy-trigger nature wasn't checked first). No
  content in that commit affects the deployed docs site's actual build
  (`dev-docs/` is outside `./docs`, the deploy context), so it was left in
  place rather than force-pushed away. This file exists so that doesn't
  happen again, and so a future push to `doc-deploy` is always a deliberate,
  confirmed action, not an accident of whatever branch happened to be
  checked out.
