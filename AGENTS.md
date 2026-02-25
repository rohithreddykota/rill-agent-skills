# AGENTS.md

This repository packages modular agent skills for Rill.

## Repository Layout

- `skills/rilldata/`
  - `SKILL.md`: trigger description and rule routing
  - `rules/`: source-linked rule files
  - `AGENTS.md`: generated compiled guide
  - `metadata.json`: metadata and references
- `skills/rill-connector/`, `skills/rill-model/`, `skills/rill-metrics-view/`, `skills/rill-explore/`, `skills/rill-canvas/`
  - lightweight router skills
  - no duplicated rule content
  - reference subsets of `skills/rilldata/rules/*`
- `skills/rill-clickhouse/`
  - ClickHouse-focused router skill for Rill model diagnostics/refactoring and create-from-scratch model generation from source info
  - orchestrates `rilldata` and external `clickhouse-best-practices` guidance
- `packages/rilldata-build/`
  - `src/sync-rules-from-sources.mjs`: generate rules from Rill source docs
  - `src/validate.mjs`: validate rules and section mapping
  - `src/build.mjs`: compile `AGENTS.md`

## Maintenance Workflow

1. Sync from canonical sources (`runtime/ai/instructions/data` and `docs/reference/project-files`).
2. Validate all rules.
3. Build compiled `AGENTS.md`.
4. Review generated diffs for accuracy before publishing.
