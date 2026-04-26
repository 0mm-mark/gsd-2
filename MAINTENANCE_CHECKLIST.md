# Pluggable Orchestrator — Maintenance Checklist

**Last Updated:** April 26, 2026

This document explains how to maintain the branch-based pluggable orchestrator system going forward.

---

## 1. Daily / Regular Operation

The system runs **automatically** via GitHub Actions. No daily action is required.

**What runs automatically:**
- **"Upstream Patch Main and Tag"** — every hour + after Upstream Synchronize
- **"Rebase Pluggable Feature Branch"** — daily at 02:00 UTC

---

## 2. When Upstream Advances Significantly

If `main` has moved a lot and you want to manually ensure everything is up to date:

```bash
# 1. Update the feature branch
./rebase-pluggable-safely.sh

# 2. Trigger the main workflow manually (GitHub → Actions → Run workflow)
```

---

## 3. How to Update the Pluggable Feature

```bash
# 1. Switch to the feature branch
git checkout feature/pluggable-orchestrator

# 2. Make your changes (new orchestrators, bug fixes, etc.)
#    Add tests in src/experimental/

# 3. Commit and push
git add .
git commit -m "feat: add new experimental orchestrator XYZ"
git push origin feature/pluggable-orchestrator

# 4. The workflows will automatically pick up your changes
```

---

## 4. Key Commands Reference

| Task                              | Command |
|-----------------------------------|---------|
| Rebase feature branch safely      | `./rebase-pluggable-safely.sh` |
| Force update main                 | `git merge feature/pluggable-orchestrator --no-ff` |
| Check pluggable files on main     | `ls src/experimental/` |
| Check latest e-tag                | `git tag --sort=-v:refname \| grep 'e$' \| head -1` |
| Manually trigger workflows        | GitHub → Actions → "Run workflow" |

---

## 5. Troubleshooting

| Problem                              | Solution |
|--------------------------------------|----------|
| Workflow fails with merge conflict   | Run `./rebase-pluggable-safely.sh` first, then re-trigger workflow |
| `main` is missing `src/experimental/` | Run manual merge: `git merge feature/pluggable-orchestrator --no-ff` |
| Feature branch is behind             | `./rebase-pluggable-safely.sh` |
| Need to recover old patch file       | `git show origin/sync~1:patches/pluggable-orchestrator.patch > patches/pluggable-orchestrator.patch` |

---

## 6. Architecture Summary

- **`feature/pluggable-orchestrator`** — Single source of truth (edit here)
- **`main`** — Production branch (auto-updated via merge)
- **`pluggable-latest`** — Latest upstream tag + pluggable code
- **`vX.Y.Ze` tags** — Patched release tags
- **`experimental` branch** — Development branch (auto-synced)

