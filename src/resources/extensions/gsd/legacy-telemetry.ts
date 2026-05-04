// Project/App: GSD-2
// File Purpose: Runtime counters for telemetry-gated legacy compatibility paths.

export type LegacyTelemetryCounter =
  | "legacy.markdownFallbackUsed"
  | "legacy.workflowEngineUsed"
  | "legacy.uokFallbackUsed"
  | "legacy.mcpAliasUsed"
  | "legacy.componentFormatUsed"
  | "legacy.providerDefaultUsed";

export type LegacyTelemetrySnapshot = Record<LegacyTelemetryCounter, number>;

const COUNTERS: LegacyTelemetryCounter[] = [
  "legacy.markdownFallbackUsed",
  "legacy.workflowEngineUsed",
  "legacy.uokFallbackUsed",
  "legacy.mcpAliasUsed",
  "legacy.componentFormatUsed",
  "legacy.providerDefaultUsed",
];

const values: LegacyTelemetrySnapshot = Object.fromEntries(
  COUNTERS.map((counter) => [counter, 0]),
) as LegacyTelemetrySnapshot;

export function incrementLegacyTelemetry(counter: LegacyTelemetryCounter, amount = 1): void {
  if (!Number.isFinite(amount) || amount <= 0) return;
  values[counter] += amount;
}

export function getLegacyTelemetry(): LegacyTelemetrySnapshot {
  return { ...values };
}

export function resetLegacyTelemetry(): void {
  for (const counter of COUNTERS) {
    values[counter] = 0;
  }
}

export function listLegacyTelemetryCounters(): LegacyTelemetryCounter[] {
  return [...COUNTERS];
}
