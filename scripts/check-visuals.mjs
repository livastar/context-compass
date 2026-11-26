// Validates assets/visuals and writes assets/visuals/README.md from the real files.
// Run: npm run check:visuals
// Fails if a file has the wrong type, size, dimensions, frame count or loop setting.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = join(root, "assets", "visuals");
const spec = JSON.parse(readFileSync(join(root, "docs", "skill-visuals", "skills.json"), "utf8"));

const MB = 1024 * 1024;
const LIMITS = { png: 1 * MB, jpg: 1 * MB, gif: 5 * MB, webp: 5 * MB, mp4: 10 * MB, webm: 10 * MB };
const MIME = { png: "image/png", jpg: "image/jpeg", gif: "image/gif", webp: "image/webp", mp4: "video/mp4", webm: "video/webm" };
const FIELD = {
  "logo-512.png": "Logo (square, 512 x 512)",
  "01-flow-overview.png": "Screenshot 1 (hero)",
  "02-flow-middle.png": "Screenshot 2",
  "03-run-early.png": "Screenshot 3",
  "04-run-middle.png": "Screenshot 4",
  "05-run-complete.png": "Screenshot 5",
  "06-result.png": "Screenshot 6",
  "01-flow-overview.jpg": "Screenshot 1, JPEG alternative",
  "flow.gif": "Animated screenshot or skill description (GIF)",
  "run.gif": "Animated screenshot or skill description (GIF)",
  "flow.webp": "Untested option (animated WebP)",
  "run.webp": "Untested option (animated WebP)",
  "flow.mp4": "Untested option (MP4)",
  "run.mp4": "Untested option (MP4)",
  "flow.webm": "Untested option (WebM)",
  "run.webm": "Untested option (WebM)"
};
const EXPECTED = Object.keys(FIELD);
const problems = [];
const kb = (n) => (n < MB ? `${(n / 1024).toFixed(0)} KB` : `${(n / MB).toFixed(2)} MB`);

function videoInfo(file) {
  const r = spawnSync(ffmpegPath, ["-hide_banner", "-i", file], { encoding: "utf8" });
  const text = r.stderr;
  const dur = text.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  const dim = text.match(/Video: .*?, (\d{2,5})x(\d{2,5})/);
  if (!dur || !dim) throw new Error(`Cannot read ${file}`);
  return { seconds: Number(dur[1]) * 3600 + Number(dur[2]) * 60 + Number(dur[3]), width: Number(dim[1]), height: Number(dim[2]) };
}

const sections = [];
for (const skill of spec.skills) {
  const folder = join(dir, skill.slug);
  const present = new Set(readdirSync(folder));
  const rows = [];
  for (const name of EXPECTED) {
    if (!present.has(name)) {
      problems.push(`${skill.slug}/${name}: missing`);
      continue;
    }
    const file = join(folder, name);
    const ext = name.split(".").pop();
    const size = statSync(file).size;
    const label = `${skill.slug}/${name}`;
    let dims = "";
    let note = "";
    if (size > LIMITS[ext]) problems.push(`${label}: ${kb(size)} is over the ${kb(LIMITS[ext])} target`);
    const type = spawnSync("file", ["--mime-type", "-b", file], { encoding: "utf8" }).stdout.trim();
    if (type !== MIME[ext]) problems.push(`${label}: mime ${type}, expected ${MIME[ext]}`);

    if (ext === "mp4" || ext === "webm") {
      const v = videoInfo(file);
      dims = `${v.width} x ${v.height}`;
      note = `${v.seconds.toFixed(1)} s`;
      if (v.seconds >= 10) problems.push(`${label}: ${v.seconds}s is not under 10 s`);
      if (v.width !== 1280 || v.height !== 720) problems.push(`${label}: ${dims}, expected 1280 x 720`);
    } else {
      const m = await sharp(file, { animated: true }).metadata();
      const h = m.pageHeight ?? m.height;
      dims = `${m.width} x ${h}`;
      const expected = name.startsWith("logo") ? [512, 512] : [1280, 720];
      if (m.width !== expected[0] || h !== expected[1]) problems.push(`${label}: ${dims}, expected ${expected.join(" x ")}`);
      if (ext === "gif" || ext === "webp") {
        const secs = m.delay.reduce((a, b) => a + b, 0) / 1000;
        note = `${m.pages} frames, ${secs.toFixed(1)} s, loop ${m.loop === 0 ? "forever" : m.loop}`;
        if (m.pages < 2) problems.push(`${label}: not animated`);
        if (m.loop !== 0) problems.push(`${label}: does not loop forever`);
        if (secs >= 10) problems.push(`${label}: ${secs}s is not under 10 s`);
        // The first and a middle frame must differ, or the file is an expensive still.
        const a = await sharp(file, { page: 0 }).raw().toBuffer();
        const b = await sharp(file, { page: Math.floor(m.pages / 2) }).raw().toBuffer();
        if (a.equals(b)) problems.push(`${label}: first and middle frames are identical`);
      }
    }
    rows.push(`| \`${name}\` | ${ext.toUpperCase()} | ${dims} | ${kb(size)} | ${FIELD[name]}${note ? ` (${note})` : ""} |`);
  }
  for (const extra of present) if (!EXPECTED.includes(extra)) problems.push(`${skill.slug}/${extra}: unexpected file`);
  sections.push(`### ${skill.short}\n\nSource: [\`docs/skill-visuals/${skill.slug}\`](../../docs/skill-visuals/${skill.slug}/README.md)\n\n| File | Format | Size (px) | Weight | Meant for |\n| --- | --- | --- | --- | --- |\n${rows.join("\n")}\n`);
}

const readme = `# Visuals in upload-ready formats

The SVG and animated SVG files in \`docs/skill-visuals/\` were rejected by the Agensi screenshot uploader (\`image/svg+xml is not supported\`). These are the same pictures as PNG, JPEG, GIF, WebP, MP4 and WebM.

The originals stay in \`docs/skill-visuals/\`. Nothing here has been uploaded anywhere.

## Which formats are confirmed

| Format | Status |
| --- | --- |
| SVG | Confirmed **rejected** by the screenshot gallery uploader. It can still be shown from an external URL inside the skill description. |
| PNG | Assumed accepted. Agensi does not list accepted formats. Safest static choice. |
| JPEG | Assumed accepted. Same reason. |
| GIF | Assumed accepted. Not confirmed that the gallery keeps it animated. |
| Animated WebP, MP4, WebM | **Untested.** Provided as extra options only. |

What Agensi documents (\`/docs/submit-on-the-website\`, read 26 November 2026): logo square, 512 x 512 recommended, up to 5 MB; up to 6 screenshots of 10 MB each; a demo video is a YouTube or Loom link, not a file. Screenshot formats and dimensions are not documented.

Because of the 6-screenshot cap, each skill has exactly six numbered PNGs plus a square logo. Every file stays well under 1 MB (static), 5 MB (GIF, WebP) and 10 MB (video).

## How these were made

\`\`\`bash
npm run export:visuals              # all skills, about 80 seconds each
npm run export:visuals -- ui-recheck   # one skill
npm run check:visuals               # validate files and rewrite this README
\`\`\`

- Chrome opens each SVG, pauses every CSS animation, and sets it to an exact time for every frame. No screen recording.
- Frames are 1280 x 720 (16:9). Each card is centred on the same navy as the card, so the bars read as part of the picture.
- Animations run at 10 frames per second and loop forever. The flow GIF is the real 9.6 s loop (8 s for Quality Department). The run GIF plays the 13.5 s sample at 1.5x speed so it loops in 9 s.
- Text uses the system font stack from the SVG, so no font or network download is needed. A different operating system may render slightly different letter shapes.
- Dev tools only: \`playwright-core\` (uses the installed Google Chrome), \`sharp\`, \`ffmpeg-static\`.

## Files

${sections.join("\n")}`;

writeFileSync(join(dir, "README.md"), readme);
if (problems.length > 0) {
  console.error(`Visual checks failed:\n- ${problems.join("\n- ")}`);
  process.exit(1);
}
console.log(`Visual checks passed for ${spec.skills.length} skills.`);
