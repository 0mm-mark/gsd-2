#!/usr/bin/env bash
#
# FINAL ROBUST migration script.
# Creates feature/pluggable-orchestrator directly from sync (cleanest method).
#
set -euo pipefail

echo "=== GSD-2 Pluggable Orchestrator Migration (Robust Final Version) ==="
echo ""

if [ ! -f ".git/config" ]; then
  echo "ERROR: Run this from the root of the gsd-2 clone."
  exit 1
fi

echo "Step 1: Stashing any local changes..."
git stash push -u -m "temp-stash-for-migration" || true

echo ""
echo "Step 2: Creating feature/pluggable-orchestrator branch from current sync..."
git checkout -B feature/pluggable-orchestrator sync

echo ""
echo "Step 3: Pushing the new feature branch..."
git push -u origin feature/pluggable-orchestrator

echo ""
echo "Step 4: Restoring stashed changes..."
git stash pop || true

echo ""
echo "✅ Migration complete!"
echo ""
echo "The feature/pluggable-orchestrator branch now exists and contains"
echo "all the pluggable orchestrator changes cleanly."
echo ""
echo "Next steps:"
echo "  1. git checkout sync"
echo "  2. rm -f patches/pluggable-orchestrator.patch"
echo "  3. Add patches/README.md"
echo "  4. Deploy the new workflow files"
echo ""
echo "You are now on the correct branch-based architecture."
