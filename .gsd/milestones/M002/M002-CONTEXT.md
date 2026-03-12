# M002: Proactive Secret Management — Context

**Gathered:** 2026-03-12
**Status:** Ready for planning

## Project Description

Add proactive secret forecasting and guided collection to GSD's milestone planning phase. When a milestone is planned, the LLM analyzes what external services and API keys will be needed, writes a secrets manifest with step-by-step guidance for each key, and collects them all before auto-mode begins execution.

## Why This Milestone

Auto-mode's value proposition is autonomous execution — plan it, walk away, come back to finished work. But if a task at S02/T03 needs a Stripe API key, auto-mode blocks and sits there for hours waiting. The user comes back expecting progress and finds a prompt asking for a key. This milestone eliminates that failure mode by front-loading secret collection into the planning phase.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Describe a project during `/gsd` discuss that involves external APIs (Stripe, Supabase, OpenAI, etc.) and see a secrets manifest produced during planning with step-by-step guidance for each key
- See a summary screen listing all needed keys with guidance, then enter them one-by-one with detailed instructions showing where to find each key
- Run `/gsd auto` and have it collect any uncollected secrets before starting slice execution, so auto-mode runs uninterrupted

### Entry point / environment

- Entry point: `/gsd` wizard and `/gsd auto` CLI commands
- Environment: local dev terminal (pi TUI)
- Live dependencies involved: `secure_env_collect` tool, .env files, optionally Vercel/Convex CLIs

## Completion Class

- Contract complete means: planning prompts produce secrets manifests, the manifest parser works, the collection TUI shows guidance and skips existing keys, and auto-mode dispatches collection at the right time
- Integration complete means: a real `/gsd auto` run with a milestone that needs API keys triggers collection before slice execution
- Operational complete means: none — this is a dev-time workflow, not a running service

## Final Integrated Acceptance

To call this milestone complete, we must prove:

- A milestone planning run that involves external APIs produces a parseable secrets manifest with per-key guidance
- Auto-mode detects the manifest and pauses for collection before dispatching the first slice
- Keys already in the environment are silently skipped
- The guided `/gsd` flow triggers the same collection
- `npm run build` passes
- `npm run test` passes (no new failures beyond pre-existing ones)

## Risks and Unknowns

- **Prompt compliance** — The LLM must reliably produce a well-formatted secrets manifest during planning. If the format is inconsistent, the parser won't find the keys. Mitigated by clear prompt instructions and a forgiving parser.
- **Guidance accuracy** — LLM-generated guidance for finding API keys (dashboard URLs, navigation steps) may be outdated or wrong. This is best-effort and explicitly accepted by the user.
- **State machine insertion** — Adding a new phase to `dispatchNextUnit` in `auto.ts` must not break the existing phase flow. The insertion point is between `plan-milestone` completion and the first slice dispatch.

## Existing Codebase / Prior Art

- `src/resources/extensions/get-secrets-from-user.ts` — The existing `secure_env_collect` tool. Has paged masked TUI input, writes to .env/Vercel/Convex. Currently has a single-line `hint` field per key. Needs a `guidance` field for multi-line instructions and a summary screen.
- `src/resources/extensions/gsd/auto.ts` — The auto-mode state machine. `dispatchNextUnit()` determines next unit type from derived state. New `collect-secrets` unit type inserts between plan-milestone and first slice.
- `src/resources/extensions/gsd/guided-flow.ts` — The `/gsd` wizard. `showSmartEntry()` handles all entry paths. Needs to trigger secret collection after milestone planning.
- `src/resources/extensions/gsd/prompts/plan-milestone.md` — The planning prompt template. Needs instructions to forecast secrets and write the manifest.
- `src/resources/extensions/gsd/state.ts` — State derivation from disk files. May need to expose whether a secrets manifest exists and whether collection is complete.
- `src/resources/extensions/gsd/files.ts` — File parsing utilities. Needs a secrets manifest parser.
- `src/resources/extensions/gsd/types.ts` — Core type definitions. Needs types for secrets manifest entries.
- `src/resources/extensions/gsd/paths.ts` — Path resolution. Needs a `resolveMilestoneFile` entry for SECRETS files.

> See `.gsd/DECISIONS.md` for all architectural and pattern decisions — it is an append-only register; read it during planning, append to it during execution.

## Relevant Requirements

- R001 — Secret forecasting during milestone planning (core capability)
- R002 — Secrets manifest file persisted in .gsd/ (continuity)
- R003 — LLM-generated step-by-step guidance per key (primary user loop)
- R004 — Summary screen before collection (primary user loop)
- R005 — Existing key detection and silent skip (primary user loop)
- R006 — Smart destination detection (integration)
- R007 — Auto-mode integration (core capability)
- R008 — Guided /gsd wizard integration (core capability)
- R009 — Planning prompts instruct LLM to forecast secrets (integration)
- R010 — secure_env_collect enhanced with guidance field (primary user loop)

## Scope

### In Scope

- Secret forecasting during plan-milestone phase
- Secrets manifest file format and parser
- Enhanced secure_env_collect with guidance and summary screen
- Existing key detection (.env and process.env)
- Smart destination detection from project context
- Auto-mode collect-secrets phase insertion
- Guided flow collection trigger
- Manifest status tracking (collected/pending/skipped)

### Out of Scope / Non-Goals

- Multi-milestone secret forecasting (deferred — R011)
- Secret rotation reminders (deferred — R012)
- Curated service knowledge base (out of scope — R013)
- Just-in-time collection enhancement (out of scope — R014)
- Modifying how secure_env_collect writes to Vercel/Convex (existing behavior preserved)

## Technical Constraints

- Must not break existing auto-mode phase flow — new phase inserts cleanly
- `secure_env_collect` changes must be backward compatible — existing callers unaffected
- Secrets manifest must be parseable by simple regex/string parsing (consistent with files.ts patterns)
- The discuss prompt (GSD-WORKFLOW.md) already handles milestone planning for guided flow — secret forecasting instructions go in plan-milestone.md which runs in auto-mode after discuss completes

## Integration Points

- `secure_env_collect` tool — Enhanced with guidance field and summary screen
- `dispatchNextUnit()` in auto.ts — New collect-secrets unit type
- `plan-milestone.md` prompt — Instructions to forecast secrets
- `guided-flow.ts` — Collection trigger after planning
- `state.ts` / `files.ts` — Manifest parsing and state derivation
- `.env` file / process.env — Existing key detection

## Open Questions

- **Manifest format** — Markdown with structured sections (consistent with other .gsd files) vs. YAML/JSON. Leaning toward markdown with parseable structure, matching the roadmap/plan pattern.
- **Destination inference heuristics** — How aggressively to detect Vercel/Convex vs. defaulting to .env. Leaning toward simple file-presence checks (vercel.json → Vercel, convex/ dir → Convex).
