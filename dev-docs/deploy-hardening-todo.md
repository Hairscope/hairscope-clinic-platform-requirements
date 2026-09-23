# Deploy Hardening — To Do

> Status: Draft · Created 2026-09-23, after a real `hairscope-admin` `dev`
> deploy failure (see incident below). Applies to **all three deploy
> pipelines** — `hairscope-admin`, `hairscope-backend`, `hairscope-clinic-web`
> — not just the repo where the failure happened, since all three share the
> same `deploy.yml` shape (gcloud SSH → docker compose pull/up on a shared
> GCE VM).

## Incident that triggered this list

`hairscope-admin`'s `dev` deploy (run `35769883994`, 2026-09-22) failed at
the `docker compose pull` step:

```
failed to extract layer (sha256:519a6398...) to overlayfs ...:
failed to Lchown ".../app/node_modules/@img/sharp-libvips-linuxmusl-x64/lib/libvips-cpp.so.8.17.3"
for UID 0, GID 0: lchown ...: no such file or directory
Error: Process completed with exit code 1.
```

Root cause: a corrupted/stale containerd overlayfs snapshot on the shared
dev/staging VM — not a disk-space issue (105G free at the time), not an app
or workflow bug. Manual fix: re-running `docker compose pull <service>`
against the same VM succeeded cleanly (fresh pull extracts into a new
snapshot, bypassing the bad one). The deploy silently left `dev` running
yesterday's image with no failure visible anywhere except GitHub Actions —
nobody would have known without manually checking.

## To do

### 1. Self-healing retry around `docker compose pull` in every `deploy.yml`

If the pull fails once, prune dangling images/layers and retry once before
failing the job:

```yaml
- name: Pull and start (api runs prisma migrate deploy on boot)
  run: gcloud compute ssh ... --command="cd /opt/<app>/${ENV_NAME} && \
    (sudo docker compose -p <app>-${ENV_NAME} pull || (sudo docker system prune -f && sudo docker compose -p <app>-${ENV_NAME} pull)) && \
    sudo docker compose -p <app>-${ENV_NAME} up -d --remove-orphans"
```

Apply to every `deploy-dev` / `deploy-staging` / `deploy-production` job in:
- `hairscope-admin/.github/workflows/deploy.yml`
- `hairscope-backend/.github/workflows/deploy.yml`
- `hairscope-clinic-web/.github/workflows/deploy.yml`

### 2. Periodic proactive `docker system prune` on the shared VM(s)

Dev and staging share one Docker daemon per app across all three repos, so
dangling layers accumulate across every deploy of every app. A daily/weekly
cron on each VM (`hairscope-europe-west3-c` dev/staging VM, and the separate
production VM) reduces the surface for this class of corruption and keeps
disk headroom healthy independent of any single deploy.

This is an infrastructure change outside version control (a cron job on the
VM itself, not a file in any repo) — needs to be set up directly on each VM,
with the exact schedule/command agreed before doing it.

### 3. Post-deploy health check in every `deploy.yml`

Currently a deploy job's SSH command exiting 0 is treated as success even if
the container then crash-loops or the new code never actually takes effect
(this is exactly how the incident's underlying DB-migration/route issue
stayed invisible until manually tested). Add a health-check step right after
`up -d`, with a short retry loop, so a deploy that "succeeded" but didn't
actually take effect fails the GitHub Actions run instead of failing silently:

```yaml
- name: Verify deployment is healthy
  run: |
    for i in {1..10}; do
      if curl -fsS https://<env-host>/<health-path>; then exit 0; fi
      sleep 5
    done
    echo "Health check failed after retries" >&2
    exit 1
```

Needs a real `/health` (or equivalent lightweight) endpoint per app if one
doesn't already exist — check each repo before assuming one's there.

### 4. Slack notifications on deploy failure (and ideally success)

Add a Slack webhook step at the end of each `deploy.yml` job (or as a
separate job that runs on failure) so a failed deploy is visible immediately
without anyone needing to check GitHub Actions manually. Needs:
- A Slack incoming webhook URL (per-environment or one shared channel —
  decide which).
- Store the webhook URL as a GitHub Environment secret (`SLACK_WEBHOOK_URL`),
  same per-environment-secret convention already used for everything else in
  these `deploy.yml` files.
- Minimal version: notify on failure only. Stretch: also post a short
  success message (env, image tag, commit) so deploys are visible as a feed,
  not just failures.

## Scope note

All four items apply uniformly across `hairscope-admin`, `hairscope-backend`,
and `hairscope-clinic-web` — implement once, verify the pattern works for
one app first (suggest `hairscope-admin`, since it's the one with a real
incident to test against), then port the same shape to the other two.
