# Contributing

Context Compass accepts contributions that make project orientation more truthful, local, and useful.

## Ground Rules

- Keep scans local-first by default.
- Do not add network calls to default behavior.
- Cite evidence for every recommendation.
- Add or update fixtures before changing scanner behavior.
- Keep the output compact enough for Codex context.
- Prefer a smaller proven feature over a larger unproven claim.

## Required Checks

```bash
npm run check
```

The check chain runs typecheck, lint, tests, build, and plugin metadata validation.

## Adding A Signal

1. Add a fixture that demonstrates the signal.
2. Add a failing test that proves the expected report behavior.
3. Implement the smallest scanner change.
4. Update docs only if the public behavior changed.
5. Run `npm run check`.
