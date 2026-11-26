# Visuals in upload-ready formats

The SVG and animated SVG files in `docs/skill-visuals/` were rejected by the Agensi screenshot uploader (`image/svg+xml is not supported`). These are the same pictures as PNG, JPEG, GIF, WebP, MP4 and WebM.

The originals stay in `docs/skill-visuals/`. Nothing here has been uploaded anywhere.

## Which formats are confirmed

| Format | Status |
| --- | --- |
| SVG | Confirmed **rejected** by the screenshot gallery uploader. It can still be shown from an external URL inside the skill description. |
| PNG | Assumed accepted. Agensi does not list accepted formats. Safest static choice. |
| JPEG | Assumed accepted. Same reason. |
| GIF | Assumed accepted. Not confirmed that the gallery keeps it animated. |
| Animated WebP, MP4, WebM | **Untested.** Provided as extra options only. |

What Agensi documents (`/docs/submit-on-the-website`, read 26 November 2026): logo square, 512 x 512 recommended, up to 5 MB; up to 6 screenshots of 10 MB each; a demo video is a YouTube or Loom link, not a file. Screenshot formats and dimensions are not documented.

Because of the 6-screenshot cap, each skill has exactly six numbered PNGs plus a square logo. Every file stays well under 1 MB (static), 5 MB (GIF, WebP) and 10 MB (video).

## How these were made

```bash
npm run export:visuals              # all skills, about 80 seconds each
npm run export:visuals -- ui-recheck   # one skill
npm run check:visuals               # validate files and rewrite this README
```

- Chrome opens each SVG, pauses every CSS animation, and sets it to an exact time for every frame. No screen recording.
- Frames are 1280 x 720 (16:9). Each card is centred on the same navy as the card, so the bars read as part of the picture.
- Animations run at 10 frames per second and loop forever. The flow GIF is the real 9.6 s loop (8 s for Quality Department). The run GIF plays the 13.5 s sample at 1.5x speed so it loops in 9 s.
- Text uses the system font stack from the SVG, so no font or network download is needed. A different operating system may render slightly different letter shapes.
- Dev tools only: `playwright-core` (uses the installed Google Chrome), `sharp`, `ffmpeg-static`.

## Files

### Context Compass

Source: [`docs/skill-visuals/context-compass`](../../docs/skill-visuals/context-compass/README.md)

| File | Format | Size (px) | Weight | Meant for |
| --- | --- | --- | --- | --- |
| `logo-512.png` | PNG | 512 x 512 | 21 KB | Logo (square, 512 x 512) |
| `01-flow-overview.png` | PNG | 1280 x 720 | 97 KB | Screenshot 1 (hero) |
| `02-flow-middle.png` | PNG | 1280 x 720 | 98 KB | Screenshot 2 |
| `03-run-early.png` | PNG | 1280 x 720 | 51 KB | Screenshot 3 |
| `04-run-middle.png` | PNG | 1280 x 720 | 66 KB | Screenshot 4 |
| `05-run-complete.png` | PNG | 1280 x 720 | 80 KB | Screenshot 5 |
| `06-result.png` | PNG | 1280 x 720 | 82 KB | Screenshot 6 |
| `01-flow-overview.jpg` | JPG | 1280 x 720 | 80 KB | Screenshot 1, JPEG alternative |
| `flow.gif` | GIF | 1280 x 720 | 180 KB | Animated screenshot or skill description (GIF) (96 frames, 9.6 s, loop forever) |
| `run.gif` | GIF | 1280 x 720 | 155 KB | Animated screenshot or skill description (GIF) (24 frames, 9.0 s, loop forever) |
| `flow.webp` | WEBP | 1280 x 720 | 245 KB | Untested option (animated WebP) (96 frames, 9.6 s, loop forever) |
| `run.webp` | WEBP | 1280 x 720 | 115 KB | Untested option (animated WebP) (24 frames, 9.0 s, loop forever) |
| `flow.mp4` | MP4 | 1280 x 720 | 148 KB | Untested option (MP4) (9.6 s) |
| `run.mp4` | MP4 | 1280 x 720 | 114 KB | Untested option (MP4) (9.0 s) |
| `flow.webm` | WEBM | 1280 x 720 | 198 KB | Untested option (WebM) (9.6 s) |
| `run.webm` | WEBM | 1280 x 720 | 160 KB | Untested option (WebM) (9.0 s) |

### Evidence QA v1

Source: [`docs/skill-visuals/evidence-qa`](../../docs/skill-visuals/evidence-qa/README.md)

| File | Format | Size (px) | Weight | Meant for |
| --- | --- | --- | --- | --- |
| `logo-512.png` | PNG | 512 x 512 | 10 KB | Logo (square, 512 x 512) |
| `01-flow-overview.png` | PNG | 1280 x 720 | 103 KB | Screenshot 1 (hero) |
| `02-flow-middle.png` | PNG | 1280 x 720 | 104 KB | Screenshot 2 |
| `03-run-early.png` | PNG | 1280 x 720 | 43 KB | Screenshot 3 |
| `04-run-middle.png` | PNG | 1280 x 720 | 58 KB | Screenshot 4 |
| `05-run-complete.png` | PNG | 1280 x 720 | 71 KB | Screenshot 5 |
| `06-result.png` | PNG | 1280 x 720 | 77 KB | Screenshot 6 |
| `01-flow-overview.jpg` | JPG | 1280 x 720 | 83 KB | Screenshot 1, JPEG alternative |
| `flow.gif` | GIF | 1280 x 720 | 186 KB | Animated screenshot or skill description (GIF) (96 frames, 9.6 s, loop forever) |
| `run.gif` | GIF | 1280 x 720 | 139 KB | Animated screenshot or skill description (GIF) (24 frames, 9.0 s, loop forever) |
| `flow.webp` | WEBP | 1280 x 720 | 246 KB | Untested option (animated WebP) (96 frames, 9.6 s, loop forever) |
| `run.webp` | WEBP | 1280 x 720 | 102 KB | Untested option (animated WebP) (24 frames, 9.0 s, loop forever) |
| `flow.mp4` | MP4 | 1280 x 720 | 150 KB | Untested option (MP4) (9.6 s) |
| `run.mp4` | MP4 | 1280 x 720 | 105 KB | Untested option (MP4) (9.0 s) |
| `flow.webm` | WEBM | 1280 x 720 | 203 KB | Untested option (WebM) (9.6 s) |
| `run.webm` | WEBM | 1280 x 720 | 140 KB | Untested option (WebM) (9.0 s) |

### Quality Department

Source: [`docs/skill-visuals/quality-department`](../../docs/skill-visuals/quality-department/README.md)

| File | Format | Size (px) | Weight | Meant for |
| --- | --- | --- | --- | --- |
| `logo-512.png` | PNG | 512 x 512 | 8 KB | Logo (square, 512 x 512) |
| `01-flow-overview.png` | PNG | 1280 x 720 | 101 KB | Screenshot 1 (hero) |
| `02-flow-middle.png` | PNG | 1280 x 720 | 102 KB | Screenshot 2 |
| `03-run-early.png` | PNG | 1280 x 720 | 47 KB | Screenshot 3 |
| `04-run-middle.png` | PNG | 1280 x 720 | 65 KB | Screenshot 4 |
| `05-run-complete.png` | PNG | 1280 x 720 | 78 KB | Screenshot 5 |
| `06-result.png` | PNG | 1280 x 720 | 79 KB | Screenshot 6 |
| `01-flow-overview.jpg` | JPG | 1280 x 720 | 84 KB | Screenshot 1, JPEG alternative |
| `flow.gif` | GIF | 1280 x 720 | 166 KB | Animated screenshot or skill description (GIF) (80 frames, 8.0 s, loop forever) |
| `run.gif` | GIF | 1280 x 720 | 149 KB | Animated screenshot or skill description (GIF) (24 frames, 9.0 s, loop forever) |
| `flow.webp` | WEBP | 1280 x 720 | 217 KB | Untested option (animated WebP) (80 frames, 8.0 s, loop forever) |
| `run.webp` | WEBP | 1280 x 720 | 111 KB | Untested option (animated WebP) (24 frames, 9.0 s, loop forever) |
| `flow.mp4` | MP4 | 1280 x 720 | 96 KB | Untested option (MP4) (8.0 s) |
| `run.mp4` | MP4 | 1280 x 720 | 109 KB | Untested option (MP4) (9.0 s) |
| `flow.webm` | WEBM | 1280 x 720 | 145 KB | Untested option (WebM) (8.0 s) |
| `run.webm` | WEBM | 1280 x 720 | 151 KB | Untested option (WebM) (9.0 s) |

### Skill Release Handoff

Source: [`docs/skill-visuals/skill-release-handoff`](../../docs/skill-visuals/skill-release-handoff/README.md)

| File | Format | Size (px) | Weight | Meant for |
| --- | --- | --- | --- | --- |
| `logo-512.png` | PNG | 512 x 512 | 7 KB | Logo (square, 512 x 512) |
| `01-flow-overview.png` | PNG | 1280 x 720 | 100 KB | Screenshot 1 (hero) |
| `02-flow-middle.png` | PNG | 1280 x 720 | 101 KB | Screenshot 2 |
| `03-run-early.png` | PNG | 1280 x 720 | 45 KB | Screenshot 3 |
| `04-run-middle.png` | PNG | 1280 x 720 | 60 KB | Screenshot 4 |
| `05-run-complete.png` | PNG | 1280 x 720 | 73 KB | Screenshot 5 |
| `06-result.png` | PNG | 1280 x 720 | 70 KB | Screenshot 6 |
| `01-flow-overview.jpg` | JPG | 1280 x 720 | 82 KB | Screenshot 1, JPEG alternative |
| `flow.gif` | GIF | 1280 x 720 | 190 KB | Animated screenshot or skill description (GIF) (96 frames, 9.6 s, loop forever) |
| `run.gif` | GIF | 1280 x 720 | 138 KB | Animated screenshot or skill description (GIF) (24 frames, 9.0 s, loop forever) |
| `flow.webp` | WEBP | 1280 x 720 | 246 KB | Untested option (animated WebP) (96 frames, 9.6 s, loop forever) |
| `run.webp` | WEBP | 1280 x 720 | 102 KB | Untested option (animated WebP) (24 frames, 9.0 s, loop forever) |
| `flow.mp4` | MP4 | 1280 x 720 | 148 KB | Untested option (MP4) (9.6 s) |
| `run.mp4` | MP4 | 1280 x 720 | 105 KB | Untested option (MP4) (9.0 s) |
| `flow.webm` | WEBM | 1280 x 720 | 201 KB | Untested option (WebM) (9.6 s) |
| `run.webm` | WEBM | 1280 x 720 | 145 KB | Untested option (WebM) (9.0 s) |

### UI Recheck

Source: [`docs/skill-visuals/ui-recheck`](../../docs/skill-visuals/ui-recheck/README.md)

| File | Format | Size (px) | Weight | Meant for |
| --- | --- | --- | --- | --- |
| `logo-512.png` | PNG | 512 x 512 | 5 KB | Logo (square, 512 x 512) |
| `01-flow-overview.png` | PNG | 1280 x 720 | 100 KB | Screenshot 1 (hero) |
| `02-flow-middle.png` | PNG | 1280 x 720 | 100 KB | Screenshot 2 |
| `03-run-early.png` | PNG | 1280 x 720 | 46 KB | Screenshot 3 |
| `04-run-middle.png` | PNG | 1280 x 720 | 64 KB | Screenshot 4 |
| `05-run-complete.png` | PNG | 1280 x 720 | 75 KB | Screenshot 5 |
| `06-result.png` | PNG | 1280 x 720 | 69 KB | Screenshot 6 |
| `01-flow-overview.jpg` | JPG | 1280 x 720 | 83 KB | Screenshot 1, JPEG alternative |
| `flow.gif` | GIF | 1280 x 720 | 175 KB | Animated screenshot or skill description (GIF) (96 frames, 9.6 s, loop forever) |
| `run.gif` | GIF | 1280 x 720 | 143 KB | Animated screenshot or skill description (GIF) (24 frames, 9.0 s, loop forever) |
| `flow.webp` | WEBP | 1280 x 720 | 251 KB | Untested option (animated WebP) (96 frames, 9.6 s, loop forever) |
| `run.webp` | WEBP | 1280 x 720 | 103 KB | Untested option (animated WebP) (24 frames, 9.0 s, loop forever) |
| `flow.mp4` | MP4 | 1280 x 720 | 150 KB | Untested option (MP4) (9.6 s) |
| `run.mp4` | MP4 | 1280 x 720 | 104 KB | Untested option (MP4) (9.0 s) |
| `flow.webm` | WEBM | 1280 x 720 | 204 KB | Untested option (WebM) (9.6 s) |
| `run.webm` | WEBM | 1280 x 720 | 144 KB | Untested option (WebM) (9.0 s) |

### Campaign Export Handoff

Source: [`docs/skill-visuals/campaign-export-handoff`](../../docs/skill-visuals/campaign-export-handoff/README.md)

| File | Format | Size (px) | Weight | Meant for |
| --- | --- | --- | --- | --- |
| `logo-512.png` | PNG | 512 x 512 | 8 KB | Logo (square, 512 x 512) |
| `01-flow-overview.png` | PNG | 1280 x 720 | 99 KB | Screenshot 1 (hero) |
| `02-flow-middle.png` | PNG | 1280 x 720 | 100 KB | Screenshot 2 |
| `03-run-early.png` | PNG | 1280 x 720 | 48 KB | Screenshot 3 |
| `04-run-middle.png` | PNG | 1280 x 720 | 64 KB | Screenshot 4 |
| `05-run-complete.png` | PNG | 1280 x 720 | 75 KB | Screenshot 5 |
| `06-result.png` | PNG | 1280 x 720 | 77 KB | Screenshot 6 |
| `01-flow-overview.jpg` | JPG | 1280 x 720 | 80 KB | Screenshot 1, JPEG alternative |
| `flow.gif` | GIF | 1280 x 720 | 178 KB | Animated screenshot or skill description (GIF) (96 frames, 9.6 s, loop forever) |
| `run.gif` | GIF | 1280 x 720 | 143 KB | Animated screenshot or skill description (GIF) (24 frames, 9.0 s, loop forever) |
| `flow.webp` | WEBP | 1280 x 720 | 246 KB | Untested option (animated WebP) (96 frames, 9.6 s, loop forever) |
| `run.webp` | WEBP | 1280 x 720 | 105 KB | Untested option (animated WebP) (24 frames, 9.0 s, loop forever) |
| `flow.mp4` | MP4 | 1280 x 720 | 147 KB | Untested option (MP4) (9.6 s) |
| `run.mp4` | MP4 | 1280 x 720 | 106 KB | Untested option (MP4) (9.0 s) |
| `flow.webm` | WEBM | 1280 x 720 | 197 KB | Untested option (WebM) (9.6 s) |
| `run.webm` | WEBM | 1280 x 720 | 148 KB | Untested option (WebM) (9.0 s) |
