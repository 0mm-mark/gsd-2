# Migration to Branch-Based Pluggable Orchestrator (Long-term Best Practice)

**Goal**: Replace the static `pluggable-orchestrator.patch` with a proper Git branch `feature/pluggable-orchestrator`.  
All future updates to the pluggable feature happen on that branch. The workflow jobs will **merge** from it (much more robust than `git am`).

This follows the exact architecture recommended in the diagnosis.

---

## Step 1: One-time Migration (Run Locally)

```bash
# === 1. Clone fresh if you don't have it ===
git clone https://github.com/0mm-mark/gsd-2.git
cd gsd-2

# === 2. Create the feature branch from the commit the original patch was based on ===
# The patch header shows base commit: ea46bc0b1d53c9d067f213be9448198d56d55b76
git fetch origin
git checkout -b feature/pluggable-orchestrator ea46bc0b1d53c9d067f213be9448198d56d55b76

# === 3. Apply the original patch (it will apply cleanly on this old base) ===
git am /path/to/attachments/pluggable-orchestrator.patch

# If you see any conflicts here (unlikely), resolve them with:
# git mergetool   or   git add <file> && git am --continue

# === 4. Push the new permanent feature branch ===
git push -u origin feature/pluggable-orchestrator

echo "✅ feature/pluggable-orchestrator branch created and pushed."
```

---

## Step 2: Clean up the `sync` branch (remove the big patch file)

```bash
git checkout sync

# Remove the static patch (we no longer need it)
rm -f patches/pluggable-orchestrator.patch

# Keep mcp.json + add the new README explaining the branch-based flow
cat > patches/README.md << 'EOF'
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

Every time the main workflow runs (hourly, on push to `sync`, after Upstream Synchronize, or manual):

1. It checks out the `sync` branch (this directory).
2. It fetches the latest `feature/pluggable-orchestrator` branch.
3. It **merges** that branch into:
   - `main`
   - `pluggable-latest`
   - New `vX.Y.Ze` tags
4. Conflicts in `src/experimental/*`, `auto.ts`, `preferences-types.ts`, `auto-loop.test.ts`, and `.mcp.json` are **automatically resolved** in favor of the feature branch.
5. Everything is pushed safely with `--force-with-lease`.

---

## How to Make Changes to the Pluggable Feature

```bash
git checkout feature/pluggable-orchestrator
# make your changes...
git add .
git commit -m "feat: ..."
git push origin feature/pluggable-orchestrator
```

The workflows will automatically pick up your changes.

---

**This architecture is the recommended long-term pattern.**
EOF

git add -A
git commit -m "chore: migrate pluggable-orchestrator to branch-based feature (remove static patch)"
git push origin sync
```

---

## Step 3: Deploy the Main Patching Workflow

```bash
# Copy the updated main workflow into your repo
cp /home/workdir/artifacts/patch-fix/upstream-patch-main-and-tag.yml \
   .github/workflows/upstream-patch-main-and-tag.yml

git add .github/workflows/upstream-patch-main-and-tag.yml
git commit -m "ci: switch to branch-based pluggable merge (long-term best practice)"
git push origin sync
```

---

## Step 4: Add the Daily Auto-Rebase Workflow (Strongly Recommended)

This new workflow keeps `feature/pluggable-orchestrator` automatically rebased onto latest `main` every day.  
It dramatically reduces future merge conflicts in the main patching jobs.

```bash
# Copy the rebase workflow
cp /home/workdir/artifacts/patch-fix/rebase-pluggable-feature.yml \
   .github/workflows/rebase-pluggable-feature.yml

git add .github/workflows/rebase-pluggable-feature.yml
git commit -m "ci: add daily auto-rebase for feature/pluggable-orchestrator"
git push origin sync
```

---

## Step 5: Verify Everything Works

1. Go to **Actions** tab.
2. Manually trigger **“Upstream Patch Main and Tag”** (workflow_dispatch).
3. All jobs should succeed with **“Clean merge completed”** or **“Auto-resolved X conflict(s)”**.
4. (Optional) Manually trigger **“Rebase Pluggable Feature Branch”** to test the daily rebase.

---

## Future Maintenance

When upstream changes cause a rebase conflict, the **Rebase Pluggable Feature** workflow will:
- Automatically create a clear GitHub Issue with exact fix commands.
- Leave the branch in a working state (no broken force-push).

You only need to resolve the conflict once per incident — then everything stays green.

---

**You are now running the complete, production-grade, low-maintenance architecture.**

No more static patches. Automatic daily rebasing. Smart conflict resolution. Future-proof.
