---
name: graphify
description: Use when exploring, querying, or rebuilding the project knowledge graph — understanding architecture, finding connections between modules, or answering "how does X relate to Y" questions across the codebase. Also use when onboarding to an unfamiliar area or tracing dependencies.
---

# Graphify — Code Knowledge Graph

Turn the reconGG codebase into a queryable knowledge graph using
[Graphify](https://github.com/safishamsi/graphify). The graph maps code, docs,
schemas, and their relationships so you can answer architectural questions without
re-reading every file.

## Prerequisites

- Python 3.10+
- Install: `uv tool install graphifyy`
- One-time setup: `graphify install` then `graphify claude install`

## Output artifacts

| File | Purpose |
|------|---------|
| `graphify-out/graph.html` | Interactive browser visualization (node filtering + search) |
| `graphify-out/GRAPH_REPORT.md` | Key concepts, connections, suggested questions |
| `graphify-out/graph.json` | Complete graph data for querying without re-reading source |

## Core commands

| Command | When to use |
|---------|-------------|
| `/graphify .` | Build/rebuild the full project graph |
| `/graphify . --update` | Re-extract only changed files (fast incremental) |
| `/graphify query "question"` | Search the knowledge graph for architecture answers |
| `/graphify path "NodeA" "NodeB"` | Find shortest connection between two entities |
| `graphify export callflow-html` | Generate Mermaid architecture diagrams |
| `graphify hook install` | Auto-rebuild graph on git commits |

## When to use this skill

1. **Onboarding** — "How is the frontend connected to the API layer?"
2. **Dependency tracing** — "What depends on the Tournament model?"
3. **Architecture review** — "Show me the god nodes (most-connected concepts)."
4. **Cross-module discovery** — "What's the shortest path between auth and match-scoring?"
5. **Design rationale** — Surface `# NOTE:`, `# WHY:`, `# HACK:` comments linked to code.

## Workflow

1. **Build the graph** (if `graphify-out/graph.json` doesn't exist or is stale):
   ```bash
   graphify . --update
   ```
2. **Query first, read second** — before grepping or reading files to answer an
   architecture question, check the graph:
   ```bash
   graphify query "how does authentication flow work"
   ```
3. **Trace connections** when a change might have cross-module impact:
   ```bash
   graphify path "APISpec" "MatchCard"
   ```
4. **Review the report** — `graphify-out/GRAPH_REPORT.md` highlights surprising
   connections, god nodes, and community clusters.

## Configuration

- **`.graphifyignore`** — same syntax as `.gitignore`, controls what gets indexed.
  Exclude `node_modules/`, `dist/`, `.next/`, and other build artifacts.
- **`GRAPHIFY_MAX_WORKERS`** — parallel AST extraction threads.
- Code extraction is local (tree-sitter) — no API key needed for code-only graphs.
- Docs/images/PDFs use your configured AI backend (`ANTHROPIC_API_KEY`, etc.).

## Graph analysis features

- **God nodes** — most-connected concepts in the project.
- **Surprising connections** — unexpected cross-module links ranked by unexpectedness.
- **Confidence tags** — relationships marked `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`.
- **Community detection** — Leiden algorithm clusters related code automatically.

## Team usage

- Commit `graphify-out/graph.json` to git for shared access.
- `graphify hook install` auto-rebuilds AST-only graphs on commit (no API cost).
- Merge driver prevents conflict markers in `graph.json`.

## Domain note

reconGG is a VALORANT esports analytics platform. The graph is especially useful for
tracing how tournament/match/team/player data flows from `API-SPEC.md` through backend
endpoints into frontend components — use `graphify path` to map these connections.
