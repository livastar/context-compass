# Marketplace Submission Checklist

## Current Status

Context Compass is prepared as a public Codex marketplace package through the `livastar/context-compass` GitHub repository. The final official curated Plugin Directory submission route must be checked against current Codex marketplace instructions before publication.

## Before Submission

- Run `npm ci`.
- Run `npm run check`.
- Confirm `plugins/context-compass/scripts/context-compass.mjs` is up to date.
- Confirm `plugins/context-compass/.codex-plugin/plugin.json` contains no placeholders.
- Confirm `.agents/plugins/marketplace.json` installs `context-compass` from `./plugins/context-compass`.
- Confirm local install works with `codex plugin marketplace add livastar/context-compass`, then `codex` and `/plugins`.
- Run the scanner against this repo and at least one external fixture repo.
- Review public links:
  - `https://ivanostanis.com`
  - `https://livastar.observer`
  - `https://www.linkedin.com/in/ivanostanis`

## Submission Notes

- Present it as a local-first context orientation plugin.
- State that default scans are read-only and do not call network services.
- State that `--verify` is explicit and runs local project quality scripts only when requested.
- Avoid claims about hidden Codex token internals. The plugin maps inspectable project context.
