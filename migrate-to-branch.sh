#!/usr/bin/env bash
#
# Corrected migration script: Create feature/pluggable-orchestrator branch
# This version properly handles the fact that the patch file did not exist
# at the base commit.
#
set -euo pipefail

echo "=== GSD-2 Pluggable Orchestrator Migration (Corrected) ==="
echo ""

if [ ! -f ".git/config" ]; then
  echo "ERROR: Run this script from the root of the gsd-2 clone."
  exit 1
fi

echo "Step 1: Fetching latest refs..."
git fetch origin --tags --force

echo ""
echo "Step 2: Creating feature/pluggable-orchestrator branch from base commit..."
git checkout -B feature/pluggable-orchestrator ea46bc0b1d53c9d067f213be9448198d56d55b76

echo ""
echo "Step 3: Looking for the patch file..."

# Try multiple possible locations (current dir + patches/ folder)
if [ -f "pluggable-orchestrator.patch" ]; then
  PATCH_FILE="pluggable-orchestrator.patch"
elif [ -f "patches/pluggable-orchestrator.patch" ]; then
  PATCH_FILE="patches/pluggable-orchestrator.patch"
elif [ -f "../pluggable-orchestrator.patch" ]; then
  PATCH_FILE="../pluggable-orchestrator.patch"
else
  echo "ERROR: Cannot find pluggable-orchestrator.patch"
  echo ""
  echo "Please make sure the patch file exists in one of these locations:"
  echo "  - ./pluggable-orchestrator.patch"
  echo "  - ./patches/pluggable-orchestrator.patch"
  echo ""
  echo "Then re-run this script."
  exit 1
fi

echo "Found patch at: $PATCH_FILE"
echo ""
echo "Step 4: Applying the patch..."

git am "$PATCH_FILE"

echo ""
echo "Step 5: Pushing the new feature branch..."
git push -u origin feature/pluggable-orchestrator

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "  1. git checkout sync"
echo "  2. rm -f patches/pluggable-orchestrator.patch"
echo "  3. Add patches/README.md (from previous instructions)"
echo "  4. Deploy the new workflow files"
