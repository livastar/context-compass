# Paid skill visuals

One page per paid skill. Each page shows what the skill does, how it acts, one sample run, and the result you should get.

Prices and listings as observed on 24 November 2026. The pictures use the Context Compass logo palette.

| Skill | Price | What you get | Visuals | Whiteboard |
| --- | --- | --- | --- | --- |
| [Context Compass](https://www.agensi.io/skills/context-compass-repo-prep-proof-driven-changes) | $9 | Trace each requested behavior to proof before you edit. | [Open](context-compass/README.md) | [Board](https://claude.ai/artifact/Q7ox87aqjVyuTiKhb9VoHJ) |
| [Evidence QA v1](https://www.agensi.io/skills/evidence-qa-v1-conversation-reviews-with-checked-quotes) | $59 | Score conversations on your rubric, with every quote checked. | [Open](evidence-qa/README.md) | [Board](https://claude.ai/artifact/FdG5MfNhevoTqK2Xk5jaqU) |
| [Quality Department](https://www.agensi.io/skills/quality-department-idea-to-production-qa) | $69 | A go or no-go you can defend, criterion by criterion. | [Open](quality-department/README.md) | [Board](https://claude.ai/artifact/Mow3RdjkNwkwm3GQxm3QE7) |
| [Skill Release Handoff](https://www.agensi.io/skills/skill-release-handoff-check-the-zip-you-send) | $19 | Check the exact ZIP the recipient gets, not the folder. | [Open](skill-release-handoff/README.md) | [Board](https://claude.ai/artifact/5UzpJe5khngdCnYwPKxHQD) |
| [UI Recheck](https://www.agensi.io/skills/ui-recheck-before-after) | $19 | Same states, same widths, before and after, measured. | [Open](ui-recheck/README.md) | [Board](https://claude.ai/artifact/NCJv8SEHefzp6b3yH3uVGJ) |
| [Campaign Export Handoff](https://www.agensi.io/skills/campaign-export-handoff) | $29 | Which placement ships, who fixes what, what needs re-measuring. | [Open](campaign-export-handoff/README.md) | [Board](https://claude.ai/artifact/45oYpTyoCB4AXbL6AGTvEB) |

## How these are built

`skills.json` holds the facts for each skill. The `drawing.svg` files are drawn by hand. Everything else is generated:

```bash
npm run build:visuals
```

The whiteboards are private Claude whiteboards built from the same facts. They add an interactive sample run. The owner controls who can open them.

Animations stop when the reader asks for reduced motion.

## Upload-ready formats

Agensi's screenshot uploader rejects SVG. PNG, JPEG, GIF, WebP, MP4 and WebM versions of every visual are in [`assets/visuals/`](../../assets/visuals/README.md). Rebuild them with `npm run export:visuals`.
