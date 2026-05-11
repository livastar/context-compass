# Acceptance Criteria

## Scanner

- Given a plain repo, Context Compass detects README and agent instruction files.
- Given a Codex marketplace repo, it detects marketplace and plugin manifests.
- Given a ds-light-style repo, it treats `knowledge-base/` as first-class context.
- Given a code repo, it reports code files, test files, quality scripts, TODO/FIXME markers, and missing proof risks.
- Given any supported repo, it emits ranked next best actions with evidence.

## Output

- Markdown output contains all required sections.
- JSON output is complete enough for another agent or script to consume.
- Recommendations include evidence paths.
- Default scans do not run project commands.
- `--verify` mode is explicit and reports command results.

## Marketplace Beta

- Plugin metadata contains no TODO placeholders.
- Marketplace metadata points to `./plugins/context-compass`.
- The bundled runtime exists after `npm run build`.
- `npm run check` passes before submission.
- Public docs explain privacy, contributor identity, and beta limits.
