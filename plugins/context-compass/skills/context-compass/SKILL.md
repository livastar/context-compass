---
name: context-compass
description: Map and reason over local Codex project context before acting. Use when the user asks to visualize, inspect, audit, orient around, or choose next steps from repository context, instructions, docs, plugin metadata, memory surfaces, code/test hygiene, recent commits, TODOs, stale plans, or quality gates.
---

# Context Compass

Use this skill to orient before changing a project. Prefer evidence from local files over assumptions.

## Workflow

1. Run the scanner from the project root or a target path:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/context-compass.mjs" <target-root>
```

2. Read the Markdown report sections in order:
   - project intention
   - context sources
   - instruction, memory, and docs map
   - code and test hygiene
   - recent change signals
   - risks and missing proof
   - ranked next best actions

3. Treat recommendations as evidence-backed direction, not authority. If repo instructions or current user intent disagree with the report, follow the stronger source and mention the conflict.

## Verification Mode

Default scans are local, read-only, and do not call external services. Use `--verify` only when the user explicitly wants available quality commands to run:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/context-compass.mjs" <target-root> --verify
```

## JSON Mode

Use JSON when another script or agent needs structured input:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/context-compass.mjs" <target-root> --json
```

## Boundaries

- Do not read secrets intentionally.
- Do not use network access by default.
- Do not scan mem0 or cloud memory unless the user explicitly asks and the local governance permits it.
- Cite concrete file evidence when recommending a next action.
