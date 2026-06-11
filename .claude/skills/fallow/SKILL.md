---
name: fallow
description: Use when writing, editing, or reviewing TypeScript/JavaScript code — run fallow to catch dead code, duplication, complexity hotspots, circular dependencies, and architecture violations before committing. Also use for PR audits and codebase health checks.
---

# Fallow — Codebase Intelligence

[Fallow](https://github.com/fallow-rs/fallow) is a deterministic static analysis engine
(Rust, no AI) for TypeScript and JavaScript. It finds dead code, duplication, complexity
hotspots, circular deps, and architecture boundary violations — fast.

## Prerequisites

```bash
# Install in the frontend workspace
cd frontend && npm install --save-dev fallow
```

## When to run Fallow

Run Fallow **before considering any TS/JS task done**:

- After writing or editing components, pages, hooks, or utilities.
- Before committing — catch dead exports, unused files, new duplication.
- During PR review — `fallow audit` gives a pass/warn/fail verdict.
- When refactoring — find safe deletion targets and complexity hotspots.
- Periodically — `fallow health --score` for overall codebase grade.

## Core commands

Run from the `frontend/` directory:

| Command | Purpose |
|---------|---------|
| `npx fallow` | Full codebase analysis |
| `npx fallow audit` | PR gate on changed files (pass/warn/fail) |
| `npx fallow audit --format json` | Machine-readable output for automated fixes |
| `npx fallow health --score` | Health score (0–100) with refactor targets |
| `npx fallow dead-code` | Find unused files, exports, deps, types |
| `npx fallow dupes` | Find duplicated code blocks |
| `npx fallow security` | Security candidates |
| `npx fallow fix --dry-run` | Preview automatic cleanup |
| `npx fallow watch` | Re-analyze on file changes |

## Development workflow

1. **Write/edit code** as needed for the task.
2. **Run `npx fallow audit`** from `frontend/` to check your changes.
3. **Fix findings** — prioritize errors, then warnings:
   - Remove dead exports and unused files.
   - Extract duplicated blocks into shared utilities.
   - Simplify functions exceeding complexity thresholds.
   - Break circular dependency chains.
4. **Re-run** until clean, then commit.

For JSON output with actionable fix suggestions:
```bash
npx fallow audit --format json
```

Each finding includes an `actions` array and `auto_fixable` flag.

## Configuration

Create `frontend/.fallowrc.json` if custom rules are needed:

```json
{
  "ignorePatterns": ["**/*.generated.ts"],
  "rules": {
    "unused-files": "error",
    "unused-exports": "warn"
  },
  "health": {
    "maxCyclomatic": 20,
    "maxCognitive": 15
  }
}
```

## Suppression (when needed)

```typescript
// fallow-ignore-next-line unused-export
export const keepForExternalUse = 1;
```

JSDoc tags `@public`, `@internal`, `@expected-unused` also work.

## Duplication modes

| Mode | What it catches |
|------|----------------|
| `strict` | Exact token matches |
| `mild` (default) | AST-level similarity |
| `weak` | Different literals, same structure |
| `semantic` | Renamed variables, same logic |

## Domain note

reconGG's frontend is a Next.js + TypeScript app. Fallow's Next.js plugin auto-detects
page routes, API routes, and config files so they aren't flagged as dead code. Run Fallow
from `frontend/` to get framework-aware results.
