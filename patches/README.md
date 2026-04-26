# Patches Directory (Legacy – Read Me First)

**Important:** The large `pluggable-orchestrator.patch` file has been **retired**.

The pluggable orchestrator feature now lives as a **proper Git branch**:

**`feature/pluggable-orchestrator`**

This is the single source of truth for all pluggable-orchestrator changes going forward.

---

## Why We Moved to a Branch (Best Practice)

| Old Way (Static Patch)          | New Way (Git Branch)                     |
|--------------------------------|------------------------------------------|
| `git am` on a `.patch` file    | `git merge` from `feature/...` branch    |
| Frequent "patch failed" errors | Clean merges + smart auto-resolution     |
| Hard to maintain over time     | Easy to rebase when upstream changes     |
| No history of changes          | Full commit history + easy code review   |

---

## How the Workflow Now Works

Every time this workflow runs (hourly, on push to `sync`, after Upstream Synchronize, or manual):

1. It checks out the `sync` branch (this directory).
2. It fetches the latest `feature/pluggable-orchestrator` branch.
3. It **merges** that branch into:
   - `main`
   - `pluggable-latest` (tracks latest upstream tag + pluggable)
   - New `vX.Y.Ze` tags
4. Conflicts in `src/experimental/*`, `auto.ts`, `preferences-types.ts`, `auto-loop.test.ts`, and `.mcp.json` are **automatically resolved** in favor of the feature branch ("always wins" policy).
5. Everything is pushed with `--force-with-lease` for safety.

---

## How to Make Changes to the Pluggable Feature

```bash
# 1. Switch to the feature branch
git checkout feature/pluggable-orchestrator

# 2. Make your changes (new orchestrators, bug fixes, etc.)
#    Add tests in src/experimental/

# 3. Commit and push
git add .
git commit -m "feat: add new experimental orchestrator XYZ"
git push origin feature/pluggable-orchestrator

# 4. The workflow will automatically pick up your changes
#    on the next scheduled run (or trigger it manually)
```

---

## When Upstream Changes Cause Merge Conflicts

The workflow will fail with a clear error message listing the conflicted files.

**To fix:**

```bash
git checkout feature/pluggable-orchestrator
git fetch origin
git rebase origin/main          # or the latest tag you care about
# resolve any conflicts
git push --force-with-lease origin feature/pluggable-orchestrator
```

Then re-run the workflow — it will succeed.

---

## Files That Used to Be in This Directory

- `pluggable-orchestrator.patch` → **Deleted** (replaced by the branch)
- `mcp.json` → Still here (used by other workflows if needed)

---

**This architecture is the recommended long-term pattern** for maintaining experimental features on top of a fast-moving upstream project.

It eliminates the class of failures we saw with static patches and gives us a clean, sustainable workflow for the future.
