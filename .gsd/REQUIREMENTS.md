# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R001 — Secret forecasting during milestone planning
- Class: core-capability
- Status: active
- Description: During milestone planning, the LLM analyzes the roadmap's slices and boundary map to predict which external services and API keys will be needed across the milestone. Produces a structured secrets manifest.
- Why it matters: Without forecasting, auto-mode blocks hours into execution when it encounters a missing API key, wasting the user's time.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S03
- Validation: unmapped
- Notes: Forecasting is LLM-generated at planning time, not from a static database.

### R002 — Secrets manifest file persisted in .gsd/
- Class: continuity
- Status: active
- Description: A secrets manifest file in `.gsd/milestones/M00x/M00x-SECRETS.md` tracks what keys are needed, what's been collected, per-key guidance, and collection status.
- Why it matters: Enables referencing later (onboarding, new slices adding requirements), and lets auto-mode know what's already been collected.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02, M002/S03
- Validation: unmapped
- Notes: File format must be parseable by the auto-mode state machine.

### R003 — LLM-generated step-by-step guidance per key
- Class: primary-user-loop
- Status: active
- Description: Each forecasted secret includes LLM-generated guidance: the service name, dashboard URL, numbered navigation steps to find the key, and what the key format looks like.
- Why it matters: Current `secure_env_collect` just shows the key name and an optional format hint. Users shouldn't have to search for where to find a key.
- Source: user
- Primary owning slice: M002/S01
- Supporting slices: M002/S02
- Validation: unmapped
- Notes: Guidance quality depends on LLM knowledge of common services. Accuracy is best-effort.

### R004 — Summary screen before collection
- Class: primary-user-loop
- Status: active
- Description: Before collecting secrets one-by-one, show a summary screen listing all needed keys with their guidance. User sees the full picture before entering any values.
- Why it matters: Collecting 5-8 keys blind is disorienting. A summary lets the user prepare (open dashboards, etc.) before the collection loop starts.
- Source: user
- Primary owning slice: M002/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Summary screen is a TUI custom component, not just text output.

### R005 — Existing key detection and silent skip
- Class: primary-user-loop
- Status: active
- Description: Before collecting, check the environment and .env file for each needed key. Keys that already exist are silently skipped — no prompt, no confirmation.
- Why it matters: Reduces friction on repeated runs or when some keys are already configured.
- Source: user
- Primary owning slice: M002/S02
- Supporting slices: M002/S03
- Validation: unmapped
- Notes: Check both process.env and .env file contents.

### R006 — Smart destination detection
- Class: integration
- Status: active
- Description: Automatically detect whether secrets should be written to .env, Vercel, or Convex based on project context (presence of vercel.json, convex/, etc.).
- Why it matters: User shouldn't have to specify destination — it should be inferred from the project.
- Source: inferred
- Primary owning slice: M002/S02
- Supporting slices: M002/S03
- Validation: unmapped
- Notes: Falls back to .env if no specific platform detected.

### R007 — Auto-mode integration
- Class: core-capability
- Status: active
- Description: Auto-mode dispatches a `collect-secrets` phase after `plan-milestone` completes and before the first slice begins execution. If a secrets manifest exists with uncollected keys, auto-mode pauses for collection.
- Why it matters: This is the primary insertion point that prevents auto-mode from blocking on missing secrets hours into execution.
- Source: user
- Primary owning slice: M002/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Must integrate with existing dispatchNextUnit state machine in auto.ts.

### R008 — Guided /gsd wizard integration
- Class: core-capability
- Status: active
- Description: The guided `/gsd` flow triggers the same secret collection after milestone planning, providing a consistent experience regardless of entry point.
- Why it matters: Users who use `/gsd` instead of `/gsd auto` should get the same proactive secret collection.
- Source: user
- Primary owning slice: M002/S03
- Supporting slices: none
- Validation: unmapped
- Notes: Hooks into guided-flow.ts.

### R009 — Planning prompts instruct LLM to forecast secrets
- Class: integration
- Status: active
- Description: The plan-milestone prompt template instructs the LLM to analyze slices for external service dependencies and write a secrets manifest as part of milestone planning output.
- Why it matters: Without prompt instructions, the LLM won't know to forecast secrets during planning.
- Source: inferred
- Primary owning slice: M002/S01
- Supporting slices: none
- Validation: unmapped
- Notes: Modifies plan-milestone.md and possibly the discuss prompt.

### R010 — secure_env_collect enhanced with guidance field
- Class: primary-user-loop
- Status: active
- Description: The `secure_env_collect` tool's key schema gains a `guidance` field (multi-line string or array of strings) beyond the existing single-line `hint`. The TUI displays this guidance prominently during collection.
- Why it matters: Current `hint` is a single format string like "starts with sk-". Step-by-step guidance needs more space.
- Source: inferred
- Primary owning slice: M002/S02
- Supporting slices: none
- Validation: unmapped
- Notes: Backward compatible — existing `hint` still works. `guidance` is additive.

## Validated

(None yet — M002 has not started execution.)

## Deferred

### R011 — Multi-milestone secret forecasting
- Class: core-capability
- Status: deferred
- Description: Forecast secrets across all milestones in a multi-milestone project, not just the current one.
- Why it matters: Could prevent even more blocking, but later milestones may change significantly.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: User explicitly chose current-milestone only. Revisit if multi-milestone friction observed.

### R012 — Secret rotation/refresh reminders
- Class: operability
- Status: deferred
- Description: Track key expiry or staleness and remind the user to refresh secrets.
- Why it matters: Keys expire. Stale keys cause confusing failures.
- Source: research
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Low priority — solve the blocking problem first.

## Out of Scope

### R013 — Curated service knowledge base
- Class: constraint
- Status: out-of-scope
- Description: A hand-maintained registry of common services (Stripe, OpenAI, Supabase, etc.) with baked-in guidance.
- Why it matters: Prevents scope confusion — guidance comes from LLM generation, not a database to maintain.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: User explicitly chose LLM-generated over curated.

### R014 — Just-in-time collection enhancement
- Class: constraint
- Status: out-of-scope
- Description: Enhancing the reactive just-in-time secret collection experience when a task discovers it needs a key mid-execution.
- Why it matters: Prevents scope confusion — the goal is front-loading, not improving the fallback path.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: User explicitly chose up-front only. Existing fallback behavior remains as-is.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | active | M002/S01 | M002/S03 | unmapped |
| R002 | continuity | active | M002/S01 | M002/S02, M002/S03 | unmapped |
| R003 | primary-user-loop | active | M002/S01 | M002/S02 | unmapped |
| R004 | primary-user-loop | active | M002/S02 | none | unmapped |
| R005 | primary-user-loop | active | M002/S02 | none | unmapped |
| R006 | integration | active | M002/S02 | M002/S03 | unmapped |
| R007 | core-capability | active | M002/S03 | none | unmapped |
| R008 | core-capability | active | M002/S03 | none | unmapped |
| R009 | integration | active | M002/S01 | none | unmapped |
| R010 | primary-user-loop | active | M002/S02 | none | unmapped |
| R011 | core-capability | deferred | none | none | unmapped |
| R012 | operability | deferred | none | none | unmapped |
| R013 | constraint | out-of-scope | none | none | n/a |
| R014 | constraint | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 10
- Mapped to slices: 10
- Validated: 0
- Unmapped active requirements: 0
