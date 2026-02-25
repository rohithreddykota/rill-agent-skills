# Rilldata Agent Skills

Installable, modular skills for AI agents working with Rill.

## Installation

Install from GitHub:

```bash
npx skills add rohithreddykota/rill-agent-skills
```

Then agents can use `rilldata` or the resource-specific router skills.
Project-level configuration guidance (`rill.yaml`) is part of `rilldata`.
ClickHouse model optimization workflows can use `rill-clickhouse` (requires the external ClickHouse skill pack).

## Included Skills

- `skills/rilldata`
  - Umbrella skill focused on Rill and project file authoring.
  - Built from canonical sources:
    - `runtime/ai/instructions/data` in `rilldata/rill`
    - `https://docs.rilldata.com/reference/project-files`
- `skills/rill-connector`
  - Router skill for connector-focused tasks.
- `skills/rill-model`
  - Router skill for model-focused tasks.
- `skills/rill-metrics-view`
  - Router skill for metrics-view-focused tasks.
- `skills/rill-explore`
  - Router skill for explore-dashboard-focused tasks.
- `skills/rill-canvas`
  - Router skill for canvas-dashboard/component-focused tasks.
- `skills/rill-clickhouse`
  - Router skill for analyzing/refactoring existing Rill models and creating new ClickHouse models from source inputs (for example S3 paths).
  - Orchestrates `rilldata` plus `clickhouse-best-practices` rules.
  - Uses a checklist-first, approval-gated workflow and creates connector artifacts only when required.
  - Requires `https://github.com/ClickHouse/agent-skills` to be installed.

## Structure

- `skills/rilldata/SKILL.md`: concise router for agents
- `skills/rilldata/rules/*.md`: modular rules with source links
- `skills/rilldata/AGENTS.md`: compiled reference guide
- `skills/rill-*/SKILL.md`: lightweight router skills that reference the shared canonical rules in `skills/rilldata/rules/*`
- `skills/rill-clickhouse/SKILL.md`: dual-mode ClickHouse-focused Rill model review/refactor and create-from-scratch workflow
- `packages/rilldata-build/`: sync/build/validate tooling
