// Exports the paid-skill SVG visuals to formats that image uploaders accept.
// Run: npm run export:visuals            (all skills)
//      npm run export:visuals -- ui-recheck   (one skill)
//
// Needs, as dev dependencies only: playwright-core (drives the installed Google Chrome),
// sharp (PNG, JPEG, GIF, animated WebP) and ffmpeg-static (MP4, WebM).
// Frames are captured deterministically: every CSS animation is paused and set to an exact
// time, so there is no screen recording and no timing jitter.
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";
import ffmpegPath from "ffmpeg-static";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = join(root, "docs", "skill-visuals");
const outRoot = join(root, "assets", "visuals");
const W = 1280;
const H = 720;
const FPS = 10;
const BG = "#0f172a"; // the navy used by every card
const LOGO_BG = "#f8fafc";

// Animated sources. `speed` shortens the playback so every loop is under 10 seconds.
// Frames to keep as PNG screenshots are given as fractions of the loop.
const ANIMATED = {
  flow: { speed: 1, stills: [["01-flow-overview", 0.08], ["02-flow-middle", 0.5]] },
  run: { speed: 1.5, stills: [["03-run-early", 0.3], ["04-run-middle", 0.6], ["05-run-complete", 0.95]] }
};

const wanted = process.argv.slice(2);
const skills = readdirSync(srcDir, { withFileTypes: true })
  .filter((e) => e.isDirectory() && (wanted.length === 0 || wanted.includes(e.name)))
  .map((e) => e.name);
if (skills.length === 0) throw new Error(`No matching skill folders in ${srcDir}`);

function pagehtml(svg, fit) {
  // Inline the SVG so CSS animations are reachable through document.getAnimations().
  const markup = svg.replace(/<svg([^>]*)>/, (_m, attrs) => `<svg${attrs.replace(/\s(width|height)="[^"]*"/g, "")}>`);
  return `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;width:100%;height:100%;background:${fit.bg};overflow:hidden}
body{display:flex;align-items:center;justify-content:center}
svg{width:${fit.w}px;height:${fit.h}px;display:block}
</style>${markup}`;
}

function loopSeconds(durations) {
  // The longest declared animation sets the loop; the others repeat inside it.
  return Math.max(...durations);
}

async function frameAt(page, ms) {
  await page.evaluate((t) => {
    for (const a of globalThis.document.getAnimations()) {
      a.pause();
      a.currentTime = t;
    }
  }, ms);
  return page.screenshot({ type: "png" });
}

function fit(vbW, vbH, boxW, boxH) {
  const k = Math.min(boxW / vbW, boxH / vbH);
  return { w: Math.round(vbW * k * 100) / 100, h: Math.round(vbH * k * 100) / 100 };
}

function viewBoxOf(svg) {
  const m = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
  if (!m) throw new Error("SVG has no viewBox");
  return [Number(m[1]), Number(m[2])];
}

function durationsOf(svg) {
  return [...svg.matchAll(/animation:[a-z0-9-]+ ([0-9.]+)s/g)].map((m) => Number(m[1]));
}

const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, reducedMotion: "no-preference" });
const page = await context.newPage();
const tmp = mkdtempSync(join(tmpdir(), "export-visuals-"));
const report = [];

try {
  for (const skill of skills) {
    const out = join(outRoot, skill);
    mkdirSync(out, { recursive: true });
    const save = async (name, buf) => {
      writeFileSync(join(out, name), buf);
      report.push(`${skill}/${name}`);
    };

    // Logo: the hand-drawn compass-style illustration on a light square, 512x512.
    const drawing = readFileSync(join(srcDir, skill, "drawing.svg"), "utf8");
    const [dw, dh] = viewBoxOf(drawing);
    const df = fit(dw, dh, 440, 440);
    await page.setViewportSize({ width: 512, height: 512 });
    await page.setContent(pagehtml(drawing, { bg: LOGO_BG, ...df }));
    await save("logo-512.png", await page.screenshot({ type: "png" }));
    await page.setViewportSize({ width: W, height: H });

    // Animated sources: flow and run. Static source: result.
    for (const [kind, cfg] of Object.entries(ANIMATED)) {
      const svg = readFileSync(join(srcDir, skill, `${kind}.svg`), "utf8");
      const [vw, vh] = viewBoxOf(svg);
      await page.setContent(pagehtml(svg, { bg: BG, ...fit(vw, vh, W, H) }));
      const loop = loopSeconds(durationsOf(svg));
      const playSeconds = loop / cfg.speed;
      const n = Math.round(playSeconds * FPS);
      const frames = [];
      for (let i = 0; i < n; i += 1) {
        const ms = (i / FPS) * cfg.speed * 1000;
        frames.push(await frameAt(page, ms));
      }
      for (const [name, frac] of cfg.stills) {
        const png = await frameAt(page, loop * frac * 1000);
        await save(`${name}.png`, png);
        if (name === "01-flow-overview") {
          await save(`${name}.jpg`, await sharp(png).jpeg({ quality: 90, mozjpeg: true }).toBuffer());
        }
      }

      const delay = Array(n).fill(Math.round(1000 / FPS));
      const stack = () => sharp(frames, { join: { animated: true } });
      await save(`${kind}.gif`, await stack().gif({ loop: 0, delay, effort: 10, colours: 128, dither: 0.5 }).toBuffer());
      await save(`${kind}.webp`, await stack().webp({ loop: 0, delay, quality: 80, effort: 6 }).toBuffer());

      // MP4 and WebM from the same frames. Single pass; players loop it.
      const dir = join(tmp, `${skill}-${kind}`);
      mkdirSync(dir, { recursive: true });
      frames.forEach((f, i) => writeFileSync(join(dir, `f${String(i).padStart(4, "0")}.png`), f));
      const input = ["-y", "-loglevel", "error", "-framerate", String(FPS), "-i", join(dir, "f%04d.png")];
      const mp4 = join(out, `${kind}.mp4`);
      const webm = join(out, `${kind}.webm`);
      const a = spawnSync(ffmpegPath, [...input, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "26", "-movflags", "+faststart", "-r", "30", mp4]);
      const b = spawnSync(ffmpegPath, [...input, "-c:v", "libvpx-vp9", "-pix_fmt", "yuv420p", "-crf", "36", "-b:v", "0", "-r", "30", webm]);
      if (a.status !== 0 || b.status !== 0) throw new Error(`ffmpeg failed: ${a.stderr}${b.stderr}`);
      report.push(`${skill}/${kind}.mp4`, `${skill}/${kind}.webm`);
    }

    const result = readFileSync(join(srcDir, skill, "result.svg"), "utf8");
    const [rw, rh] = viewBoxOf(result);
    await page.setContent(pagehtml(result, { bg: BG, ...fit(rw, rh, W, H) }));
    await save("06-result.png", await frameAt(page, 0));
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`Wrote ${report.length} files under assets/visuals/`);
