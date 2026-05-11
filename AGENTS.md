# Agent Instructions

Context Compass is a public Codex plugin project.

## Before Editing

- Read `README.md`, `docs/acceptance-criteria.md`, and this file.
- Treat `plugins/context-compass/.codex-plugin/plugin.json` and `.agents/plugins/marketplace.json` as public marketplace surfaces.
- Keep `plugins/context-compass/scripts/context-compass.mjs` generated from `npm run build`.

## Quality

- Use test-first changes for scanner behavior.
- Run `npm run check` before claiming completion.
- Keep default behavior local-only and read-only.
- Use `--verify` only for explicit quality command execution.

## Privacy

- Do not intentionally read secrets.
- Do not add default network calls.
- Do not scan mem0 or cloud memory unless the user explicitly asks and the active governance allows it.
