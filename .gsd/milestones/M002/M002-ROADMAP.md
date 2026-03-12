# M002: Proactive Secret Management

**Vision:** Front-load API key collection during milestone planning so auto-mode runs uninterrupted. The LLM forecasts which secrets a milestone needs, generates step-by-step guidance for finding each key, and collects them all before execution begins.

## Success Criteria

- After milestone planning, a secrets manifest exists listing all predicted API keys with per-key step-by-step guidance
- Auto-mode pauses to collect uncollected secrets before dispatching the first slice
- The guided `/gsd` flow triggers the same collection after planning
- Keys already present in the environment are silently skipped
- The collection UX shows a summary of all needed keys before collecting them one-by-one
- `npm run build` passes
- `npm run test` passes (no new failures beyond pre-existing)

## Key Risks / Unknowns

- **Prompt compliance** — LLM must reliably produce a well-formatted secrets manifest during planning
- **State machine insertion** — Adding a new phase to `dispatchNextUnit` must not break existing flow

## Proof Strategy

- Prompt compliance → retire in S01 by proving the plan-milestone prompt produces a parseable manifest when the milestone involves external APIs
- State machine insertion → retire in S03 by proving auto-mode dispatches collect-secrets at the right time and proceeds normally after

## Verification Classes

- Contract verification: unit tests for manifest parser, build passes, existing tests pass
- Integration verification: auto-mode dispatches collect-secrets phase correctly, guided flow triggers collection
- Operational verification: none — dev-time workflow
- UAT / human verification: real milestone planning produces usable manifest, collection UX is clear

## Milestone Definition of Done

This milestone is complete only when all are true:

- Planning prompts instruct the LLM to forecast secrets and write a manifest
- The manifest file persists in `.gsd/milestones/M00x/` with per-key guidance
- `secure_env_collect` supports multi-line guidance beyond the single-line hint
- Auto-mode dispatches a collect-secrets phase between plan-milestone and first slice
- Guided `/gsd` flow triggers the same collection
- Existing keys are detected and silently skipped
- Destination is inferred from project context
- Success criteria are re-verified against live behavior
- `npm run build` passes
- `npm run test` passes

## Requirement Coverage

- Covers: R001, R002, R003, R004, R005, R006, R007, R008, R009, R010
- Partially covers: none
- Leaves for later: R011 (multi-milestone forecasting), R012 (rotation reminders)
- Orphan risks: none

## Slices

- [ ] **S01: Secret Forecasting & Manifest** `risk:medium` `depends:[]`
  > After this: running plan-milestone on a project involving external APIs produces a `.gsd/milestones/M00x/M00x-SECRETS.md` manifest file with predicted keys and step-by-step guidance for each. Verified by planning a test milestone and confirming the manifest is parseable.

- [ ] **S02: Enhanced Collection UX** `risk:medium` `depends:[S01]`
  > After this: `secure_env_collect` shows a summary screen of all needed keys with guidance before collecting, displays multi-line guidance per key during collection, detects and silently skips keys already in the environment, and infers the write destination from project context. Verified by running the enhanced tool with a test manifest.

- [ ] **S03: Auto-Mode & Guided Flow Integration** `risk:low` `depends:[S01,S02]`
  > After this: auto-mode dispatches a collect-secrets phase after plan-milestone and before the first slice. The guided `/gsd` flow triggers the same collection. Collected status is tracked in the manifest. Verified by running auto-mode through the plan → collect → execute transition.

- [ ] **S04: End-to-End Verification** `risk:low` `depends:[S03]`
  > After this: the full flow is verified end-to-end — a real milestone planning session that involves external APIs produces a manifest, triggers collection, and auto-mode proceeds to slice execution without blocking on secrets. All tests pass, build succeeds.

## Boundary Map

### S01 → S02

Produces:
- `types.ts` → `SecretsManifestEntry` interface (key, service, guidance, status, destination)
- `types.ts` → `SecretsManifest` interface (entries array, milestone, generated_at)
- `files.ts` → `parseSecretsManifest(content: string): SecretsManifest` parser
- `files.ts` → `formatSecretsManifest(manifest: SecretsManifest): string` writer
- `paths.ts` → `resolveMilestoneFile` recognizes `"SECRETS"` suffix
- `prompts/plan-milestone.md` → instructions to write `M00x-SECRETS.md` during planning
- `templates/secrets-manifest.md` → template for the manifest format

Consumes:
- nothing (first slice)

### S01 → S03

Produces:
- Same as S01 → S02 (manifest types, parser, paths)
- `files.ts` → `parseSecretsManifest` for reading manifest status

Consumes:
- nothing (first slice)

### S02 → S03

Produces:
- `get-secrets-from-user.ts` → enhanced `secure_env_collect` with `guidance` field on keys
- `get-secrets-from-user.ts` → summary screen TUI component before collection
- `get-secrets-from-user.ts` → `checkExistingEnvKeys(keys, envPath): string[]` helper
- `get-secrets-from-user.ts` → `detectDestination(basePath): "dotenv" | "vercel" | "convex"` helper

Consumes from S01:
- `types.ts` → `SecretsManifestEntry`, `SecretsManifest` interfaces
- `files.ts` → `parseSecretsManifest` to read the manifest
- `paths.ts` → `resolveMilestoneFile(base, mid, "SECRETS")` to find the manifest

### S03 → S04

Produces:
- `auto.ts` → collect-secrets unit type in `dispatchNextUnit`
- `auto.ts` → `buildCollectSecretsPrompt()` or direct TUI dispatch (no LLM session needed)
- `guided-flow.ts` → collection trigger after milestone planning
- `state.ts` → secrets collection status in derived state
- `files.ts` → `updateSecretsManifestStatus()` to mark keys as collected/skipped

Consumes from S01:
- `types.ts` → manifest types
- `files.ts` → manifest parser/writer
- `paths.ts` → SECRETS file resolution

Consumes from S02:
- `get-secrets-from-user.ts` → enhanced `secure_env_collect` with guidance and summary
- `get-secrets-from-user.ts` → `checkExistingEnvKeys`, `detectDestination`
