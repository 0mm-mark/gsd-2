// Project/App: GSD-2
// File Purpose: Tests for telemetry counters guarding legacy compatibility cleanup.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  getLegacyTelemetry,
  incrementLegacyTelemetry,
  listLegacyTelemetryCounters,
  resetLegacyTelemetry,
} from "../legacy-telemetry.ts";
import { closeDatabase } from "../gsd-db.ts";
import { deriveState, invalidateStateCache } from "../state.ts";

test("legacy telemetry exposes every Phase 8 cleanup counter", () => {
  resetLegacyTelemetry();

  assert.deepEqual(listLegacyTelemetryCounters(), [
    "legacy.markdownFallbackUsed",
    "legacy.workflowEngineUsed",
    "legacy.uokFallbackUsed",
    "legacy.mcpAliasUsed",
    "legacy.componentFormatUsed",
    "legacy.providerDefaultUsed",
  ]);
  assert.equal(getLegacyTelemetry()["legacy.markdownFallbackUsed"], 0);
});

test("legacy telemetry increments positive finite amounts only", () => {
  resetLegacyTelemetry();

  incrementLegacyTelemetry("legacy.workflowEngineUsed");
  incrementLegacyTelemetry("legacy.workflowEngineUsed", 2);
  incrementLegacyTelemetry("legacy.workflowEngineUsed", 0);
  incrementLegacyTelemetry("legacy.workflowEngineUsed", Number.NaN);

  assert.equal(getLegacyTelemetry()["legacy.workflowEngineUsed"], 3);
});

test("deriveState increments markdown fallback telemetry on explicit legacy fallback", async () => {
  const base = mkdtempSync(join(tmpdir(), "gsd-legacy-telemetry-"));
  const originalFallback = process.env.GSD_ALLOW_MARKDOWN_DERIVE_FALLBACK;
  try {
    closeDatabase();
    resetLegacyTelemetry();
    invalidateStateCache();
    process.env.GSD_ALLOW_MARKDOWN_DERIVE_FALLBACK = "1";
    mkdirSync(join(base, ".gsd", "milestones", "M001"), { recursive: true });
    writeFileSync(join(base, ".gsd", "milestones", "M001", "M001-CONTEXT.md"), "# M001: Legacy\n");

    const state = await deriveState(base);

    assert.equal(state.activeMilestone?.id, "M001");
    assert.equal(getLegacyTelemetry()["legacy.markdownFallbackUsed"], 1);
  } finally {
    invalidateStateCache();
    resetLegacyTelemetry();
    if (originalFallback === undefined) delete process.env.GSD_ALLOW_MARKDOWN_DERIVE_FALLBACK;
    else process.env.GSD_ALLOW_MARKDOWN_DERIVE_FALLBACK = originalFallback;
    rmSync(base, { recursive: true, force: true });
  }
});
