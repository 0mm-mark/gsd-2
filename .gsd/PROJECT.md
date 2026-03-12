# Project

## What This Is

GSD (Get Shit Done) is a CLI coding agent harness built on pi. It provides a structured planning methodology — milestones, slices, tasks — with auto-mode that executes work autonomously via fresh LLM sessions per unit of work. Ships as the `gsd-pi` npm package.

## Core Value

Autonomous multi-session execution: the agent plans, executes, verifies, and advances through an entire milestone without human intervention, resuming cleanly from crashes and compaction.

## Current State

M001 complete — centralized all git mechanics into a deterministic `GitServiceImpl` class. Smart staging, conventional commit inference, merge guards, hidden snapshot refs, auto-push, and rich commit messages. All git operations route through the service; no raw git commands in LLM-facing prompts.

The extension has a full auto-mode state machine (`auto.ts`), guided wizard flow (`guided-flow.ts`), prompt-based unit dispatch, crash recovery, metrics tracking, and a TUI dashboard overlay.

## Architecture / Key Patterns

- **Extension architecture:** GSD is a pi extension in `src/resources/extensions/gsd/`. Registers tools, hooks (`agent_end`), and commands (`/gsd`, `/gsd auto`).
- **Auto-mode state machine:** `auto.ts` derives state from disk files, determines next unit type, creates fresh LLM sessions with focused prompts. Unit types: research-milestone, plan-milestone, research-slice, plan-slice, execute-task, complete-slice, complete-milestone, reassess-roadmap, replan-slice, run-uat.
- **Prompt injection:** Each unit type has a `.md` prompt template in `prompts/`. Variables are interpolated by `prompt-loader.ts`.
- **State derivation:** `state.ts` reads roadmap/plan files to determine phase and active work item. State is derived, not stored.
- **Git service:** `git-service.ts` owns all git mechanics. `worktree.ts` is a thin facade for backward compatibility.
- **Secret collection:** `get-secrets-from-user.ts` provides `secure_env_collect` tool with paged masked TUI input. Currently reactive (collects when asked), not proactive.

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract, requirement status, and coverage mapping.

## Milestone Sequence

- [x] M001: Deterministic GitService — Centralized all git mechanics into a single typed service
- [ ] M002: Proactive Secret Management — Front-load API key collection during milestone planning so auto-mode runs uninterrupted
