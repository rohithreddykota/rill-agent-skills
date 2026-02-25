# Rill Skill

This skill provides modular, source-linked guidance for Rill development and project-file authoring.

## Coverage

- Runtime authoring instructions from `runtime/ai/instructions/data` (8 core docs)
- Full `docs.rilldata.com/reference/project-files` reference set
- Generated `AGENTS.md` compiled from modular `rules/*.md`

## Structure

- `SKILL.md`: concise entry-point and routing logic
- `rules/`: modular rule files sourced from Rill docs and runtime instructions
- `AGENTS.md`: generated compiled reference
- `metadata.json`: versioning and references

## Build and Validate

From repository root:

```bash
node packages/rilldata-build/src/sync-rules-from-sources.mjs --rill-repo /path/to/rill/repo --skill-dir skills/rilldata
node packages/rilldata-build/src/validate.mjs --skill-dir skills/rilldata
node packages/rilldata-build/src/build.mjs --skill-dir skills/rilldata
```

## Source of Truth

Canonical sources are `docs.rilldata.com/reference/project-files` and the Rill repo runtime instructions.
Each rule file contains `sourcePath` and `sourceUrl` frontmatter fields.
