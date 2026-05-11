# Context Compass

Context Compass is a local-first Codex plugin that maps project context before work begins. It reads the files a careful agent should care about: instructions, docs, plugin metadata, package scripts, code and test layout, git signals, TODOs, and portfolio-style knowledge bases. It then returns a concise context map plus ranked next best actions with evidence.

## Why It Exists

This project started from DS Light work with Codex: a repeated need to understand not just what files exist, but what tone the project is written in, what proof exists, what context is stale, and what action would be grounded instead of reactive.

The plugin is personal in origin and generic in use. Anyone can install it, point it at a repository, and use it to orient before acting.

## What It Produces

The default output is a Markdown report with:

- project intention
- context sources
- instruction, memory, and docs map
- code and test hygiene
- recent change signals
- risks and missing proof
- ranked next best actions

Every recommendation cites file evidence.

## Install For Local Development

```bash
npm install
npm run check
```

Run the scanner:

```bash
npm exec tsx src/context-compass.ts .
```

Run JSON mode:

```bash
npm exec tsx src/context-compass.ts . --json
```

Run explicit verification mode:

```bash
npm exec tsx src/context-compass.ts . --verify
```

Default scans are read-only and do not use network access. `--verify` is the only mode that runs discovered quality scripts.

## Codex Plugin Layout

This repository is structured as a marketplace package:

```text
.agents/plugins/marketplace.json
plugins/context-compass/.codex-plugin/plugin.json
plugins/context-compass/skills/context-compass/SKILL.md
plugins/context-compass/scripts/context-compass.mjs
```

After `npm run build`, the bundled runtime is copied into `plugins/context-compass/scripts/context-compass.mjs` so the plugin can run without TypeScript tooling.

## Public Contributor

- Contributor: DS Light / Stanislav Ivanov
- Website: https://ivanostanis.com
- Observatory: https://livastar.observer
- LinkedIn: https://www.linkedin.com/in/ivanostanis

## Quality Bar

Context Compass is a lean beta, not a rough beta. The surface area is intentionally small, but quality is non-negotiable:

- strict TypeScript
- lint, typecheck, tests, build, and metadata checks
- fixture-based scanner tests
- Markdown output checks
- marketplace metadata validation
- local-first privacy boundary

See [docs/acceptance-criteria.md](docs/acceptance-criteria.md) and [docs/marketplace-submission.md](docs/marketplace-submission.md).
