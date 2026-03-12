# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | M001/S01 | arch | Exclusion filter for smart staging | Not file ownership tracking | Simpler, covers the use case | No |
| D002 | M001/S01 | pattern | Thin facade pattern for worktree.ts migration | Preserve all exports, delegate to GitServiceImpl | Backward compatibility without breaking consumers | No |
| D003 | M001/S01 | convention | Branch lifecycle after squash merge | Branches deleted after merge | Clean branch list, history preserved in squash commit | No |
| D004 | M001/S01 | arch | Snapshot storage mechanism | Hidden refs (refs/gsd/snapshots/) not checkpoint commits | Invisible to normal git log, recoverable when needed | No |
| D005 | M002 | arch | Secret guidance source | LLM-generated at planning time | No static database to maintain, adapts to any service | Yes — if accuracy becomes a problem |
| D006 | M002 | arch | Secret collection timing | Up-front during planning only | Solves the primary blocking problem; existing fallback behavior unchanged | Yes — if missed secrets are frequent |
| D007 | M002 | arch | Secret forecasting scope | Current milestone only | Later milestones may change; collect when planning each | Yes — if cross-milestone friction observed |
| D008 | M002 | arch | Existing key handling | Silent skip (no confirmation) | Less friction on repeated runs | Yes — if users want to rotate keys |
| D009 | M002 | arch | Destination detection | Infer from project context (vercel.json, convex/ dir) | User shouldn't specify — falls back to .env | No |
