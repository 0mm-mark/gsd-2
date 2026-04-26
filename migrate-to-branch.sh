#!/usr/bin/env bash
#
# One-time migration script: static patch → feature/pluggable-orchestrator branch
# Run this locally from a clean clone of the repo.
#
set -euo pipefail

echo "=== GSD-2 Pluggable Orchestrator Migration ==="
echo ""

# 1. Make sure we are in the repo root
if [ ! -f ".git/config" ]; then
  echo "ERROR: Run this script from the root of the gsd-2 clone."
  exit 1
fi

echo "Step 1: Fetching latest refs..."
git fetch origin --tags --force

echo ""
echo "Step 2: Creating feature/pluggable-orchestrator branch from the patch base commit..."
git checkout -B feature/pluggable-orchestrator ea46bc0b1d53c9d067f213be9448198d56d55b76

echo ""
echo "Step 3: Applying the original patch (should be clean on this base)..."
if [ -f "patches/pluggable-orchestrator.patch" ]; then
  PATCH_FILE="patches/pluggable-orchestrator.patch"
elif [ -f "../patches/pluggable-orchestrator.patch" ]; then
  PATCH_FILE="../patches/pluggable-orchestrator.patch"
else
  echo "ERROR: Cannot find pluggable-orchestrator.patch"
  echo "Please place it in the repo root or run from the correct directory."
  exit 1
fi

git am "$PATCH_FILE"

echo ""
echo "Step 4: Pushing the new permanent feature branch..."
git push -u origin feature/pluggable-orchestrator

echo ""
echo "✅ Migration of feature branch complete!"
echo ""
echo "Next steps:"
echo "  1. Switch back to sync branch: git checkout sync"
echo "  2. Delete the old patch file and add patches/README.md (see MIGRATION_INSTRUCTIONS.md)"
echo "  3. Deploy the new workflow YAML"
echo ""
echo "All done. You are now on the sustainable branch-based architecture."
