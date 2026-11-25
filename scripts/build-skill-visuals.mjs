// Builds the paid-skill visuals in docs/skill-visuals from skills.json.
// Run: npm run build:visuals
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "docs", "skill-visuals");
const spec = JSON.parse(readFileSync(join(outDir, "skills.json"), "utf8"));

// Palette taken from plugins/context-compass/assets/context-compass.svg.
const C = {
  navy: "#0f172a", panel: "#1e293b", line: "#334155", slate: "#64748b", mute: "#94a3b8",
  soft: "#cbd5e1", light: "#f8fafc", green: "#22c55e", mint: "#86efac", deep: "#14532d",
  amber: "#fbbf24", brown: "#451a03", cream: "#fde68a", pale: "#bbf7d0", border: "#e2e8f0"
};
const FONT = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif";
const REDUCED = "@media (prefers-reduced-motion: reduce){*{animation:none !important}}";
const TICK = String.fromCharCode(96);

function esc(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrap(text, width, size) {
  const max = Math.max(6, Math.floor(width / (size * 0.56)));
  const lines = [];
  let current = "";
  for (const word of String(text).split(" ")) {
    const next = current ? current + " " + word : word;
    if (next.length > max && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function text(lines, x, y, size, fill, options) {
  const o = options || {};
  const list = Array.isArray(lines) ? lines : [lines];
  const gap = Math.round(size * 1.32);
  let out = '<text x="' + x + '" y="' + y + '" font-size="' + size + '" fill="' + fill + '"';
  if (o.weight) out += ' font-weight="' + o.weight + '"';
  if (o.anchor) out += ' text-anchor="' + o.anchor + '"';
  if (o.spacing) out += ' letter-spacing="' + o.spacing + '"';
  out += ">";
  list.forEach((line, index) => {
    out += '<tspan x="' + x + '" dy="' + (index === 0 ? 0 : gap) + '">' + esc(line) + "</tspan>";
  });
  return out + "</text>";
}

function box(x, y, w, h, rx, fill, stroke, extra) {
  return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + rx + '" fill="' + fill + '"' +
    (stroke ? ' stroke="' + stroke + '" stroke-width="1.5"' : "") + (extra || "") + "/>";
}

function open(width, height, title, desc, css) {
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + width + " " + height + '" width="' + width + '" height="' + height +
    '" role="img" aria-labelledby="t d" font-family="' + FONT + '">\n<title id="t">' + esc(title) + '</title>\n<desc id="d">' + esc(desc) +
    "</desc>\n<style>" + css + REDUCED + "</style>\n";
}

function chipTone(kind) {
  if (kind === "ok") return { fill: C.deep, stroke: C.green, ink: C.pale };
  if (kind === "stop") return { fill: C.brown, stroke: C.amber, ink: C.cream };
  return { fill: C.panel, stroke: C.slate, ink: C.soft };
}

function flowSvg(skill) {
  const n = skill.steps.length;
  const beat = 1.6;
  const total = n * beat;
  const share = 100 / n;
  const css =
    ".dash{stroke-dasharray:6 8;animation:dash 1.2s linear infinite}" +
    "@keyframes dash{to{stroke-dashoffset:-14}}" +
    ".hl{opacity:0;animation:hl " + total + "s linear infinite}" +
    "@keyframes hl{0%{opacity:0}3%{opacity:1}" + (share - 1).toFixed(2) + "%{opacity:1}" + (share + 3).toFixed(2) + "%{opacity:0}100%{opacity:0}}";
  let out = open(1200, 720, skill.short + ": what it does and how it acts",
    "Inputs: " + skill.inputs.join("; ") + ". Steps: " + skill.steps.map((s) => s.t).join(", ") + ". Outputs: " + skill.outputs.join("; ") + ".", css);
  out += box(0, 0, 1200, 720, 28, C.navy) + "\n";
  out += text("PAID SKILL · $" + skill.price, 60, 58, 13, C.mint, { weight: 700, spacing: 1.5 }) + "\n";
  out += text(skill.short, 60, 96, 32, C.light, { weight: 700 }) + "\n";
  out += text(skill.takeaway, 60, 126, 17, C.soft) + "\n";

  out += text("YOU BRING", 60, 172, 12, C.mute, { weight: 700, spacing: 1.5 });
  out += text("THE SKILL", 600, 172, 12, C.mute, { weight: 700, spacing: 1.5, anchor: "middle" });
  out += text("YOU GET", 840, 172, 12, C.mute, { weight: 700, spacing: 1.5 }) + "\n";
  const rows = [186, 234, 282];
  skill.inputs.forEach((label, index) => {
    const y = rows[index];
    out += '<path class="dash" d="M360 ' + (y + 20) + " C410 " + (y + 20) + " 400 254 450 254" + '" fill="none" stroke="' + C.slate + '" stroke-width="2"/>';
    out += box(60, y, 300, 40, 10, C.panel, C.line) + text(label, 76, y + 25, 14.5, C.light) + "\n";
  });
  skill.outputs.forEach((label, index) => {
    const y = rows[index];
    out += '<path class="dash" d="M750 254 C800 254 790 ' + (y + 20) + " 840 " + (y + 20) + '" fill="none" stroke="' + C.green + '" stroke-width="2"/>';
    out += box(840, y, 300, 40, 10, C.deep, C.green) + text(label, 856, y + 25, 14.5, C.light) + "\n";
  });
  out += box(450, 196, 300, 116, 20, C.green);
  const nameLines = wrap(skill.short, 260, 24);
  out += text(nameLines, 600, 254 - (nameLines.length - 1) * 16 + 8, 24, C.navy, { weight: 800, anchor: "middle" }) + "\n";

  out += text("HOW IT ACTS", 60, 366, 12, C.mute, { weight: 700, spacing: 1.5 }) + "\n";
  const gap = 16;
  const w = (1080 - gap * (n - 1)) / n;
  skill.steps.forEach((step, index) => {
    const x = 60 + index * (w + gap);
    out += box(x, 380, w, 140, 12, C.panel, C.line);
    out += '<circle cx="' + (x + 24) + '" cy="404" r="12" fill="' + C.green + '"/>' + text(String(index + 1), x + 24, 409, 13, C.navy, { weight: 800, anchor: "middle" });
    out += text(wrap(step.t, w - 56, 14.5), x + 44, 409, 14.5, C.light, { weight: 700 });
    out += text(wrap(step.d, w - 28, 12.5), x + 14, 452, 12.5, C.soft);
    out += box(x, 380, w, 140, 12, "none", C.mint, ' class="hl" style="stroke-width:3;animation-delay:' + (index * beat).toFixed(1) + 's"') + "\n";
    if (index < n - 1) {
      out += '<path d="M' + (x + w + 3) + " 450h" + (gap - 6) + '" fill="none" stroke="' + C.slate + '" stroke-width="2"/>';
    }
    if (step.below) {
      const tone = chipTone(step.below.kind);
      out += '<path d="M' + (x + w / 2) + ' 520v20" fill="none" stroke="' + tone.stroke + '" stroke-width="2"/>';
      out += box(x, 540, w, 58, 10, tone.fill, tone.stroke);
      out += text(wrap(step.below.t, w - 24, 12), x + 12, 560, 12, tone.ink, { weight: 600 }) + "\n";
    }
  });

  out += text("RESULT STATES", 60, 644, 12, C.mute, { weight: 700, spacing: 1.5 });
  let cx = 60;
  skill.verdicts.forEach((verdict) => {
    const tone = chipTone(verdict[1]);
    const cw = Math.round(verdict[0].length * 8.2 + 28);
    out += box(cx, 658, cw, 30, 15, tone.fill, tone.stroke) + text(verdict[0], cx + cw / 2, 678, 13, tone.ink, { weight: 700, anchor: "middle" });
    cx += cw + 10;
  });
  out += text("Amber: the skill stops or flags. Green: the result you want.", 1140, 678, 12.5, C.mute, { anchor: "end" });
  return out + "\n</svg>\n";
}

function runSvg(skill) {
  const lines = skill.run.lines;
  const n = lines.length;
  const height = 196 + n * 50 + 84;
  const total = (n + 3) * 1.5;
  let css = "";
  lines.forEach((_, index) => {
    const at = ((index + 0.4) / (n + 3)) * 100;
    css += ".l" + index + "{animation:l" + index + " " + total + "s linear infinite}" +
      "@keyframes l" + index + "{0%," + at.toFixed(2) + "%{opacity:0}" + (at + 3).toFixed(2) + "%,97%{opacity:1}100%{opacity:0}}";
  });
  const end = ((n + 0.4) / (n + 3)) * 100;
  css += ".v{animation:v " + total + "s linear infinite}@keyframes v{0%," + end.toFixed(2) + "%{opacity:0}" + (end + 3).toFixed(2) + "%,97%{opacity:1}100%{opacity:0}}";
  let out = open(1200, height, skill.short + ": one sample run",
    "Sample run from " + skill.run.source + ". " + lines.map((l) => l[1]).join(". ") + ". Outcome: " + skill.run.verdict + ".", css);
  out += box(0, 0, 1200, height, 28, C.navy) + "\n";
  out += text("ONE RUN", 60, 58, 13, C.mint, { weight: 700, spacing: 1.5 });
  out += text(skill.short + ": " + skill.run.title, 60, 96, 28, C.light, { weight: 700 });
  out += text("Source: " + skill.run.source + ". It shows how the skill acts. It is not a customer result.", 60, 126, 15, C.mute) + "\n";
  out += box(60, 152, 1080, n * 50 + 24, 16, C.panel, C.line) + "\n";
  lines.forEach((line, index) => {
    const y = 176 + index * 50;
    const step = skill.steps[line[0] - 1];
    out += '<g class="l' + index + '">';
    out += '<circle cx="92" cy="' + (y + 13) + '" r="13" fill="' + C.green + '"/>' + text(String(line[0]), 92, y + 18, 13, C.navy, { weight: 800, anchor: "middle" });
    out += text(step.t, 118, y + 18, 14, C.mint, { weight: 700 });
    out += text(line[1], 330, y + 18, 15, C.light);
    out += "</g>\n";
  });
  const vy = 176 + n * 50 + 34;
  const vw = Math.round(skill.run.verdict.length * 8.6 + 40);
  out += '<g class="v">' + text("OUTCOME", 60, vy + 22, 12, C.mute, { weight: 700, spacing: 1.5 }) +
    box(150, vy, vw, 34, 17, C.green) + text(skill.run.verdict, 150 + vw / 2, vy + 22, 14.5, C.navy, { weight: 800, anchor: "middle" }) + "</g>";
  return out + "\n</svg>\n";
}

function resultSvg(skill) {
  const rows = skill.result;
  const limits = skill.limits;
  const tableTop = 150;
  const limitsTop = tableTop + rows.length * 48 + 56;
  const height = limitsTop + 30 + Math.ceil(limits.length / 2) * 34 + 36;
  let out = open(1200, height, skill.short + ": the result you should get",
    "The result contains: " + rows.map((r) => r[0] + " (" + r[1] + ")").join("; ") + ". It does not: " + limits.join("; ") + ".", "");
  out += box(1, 1, 1198, height - 2, 28, C.light, C.border) + "\n";
  out += text("THE RESULT YOU SHOULD GET", 60, 58, 13, "#15803d", { weight: 700, spacing: 1.5 });
  out += text(skill.short, 60, 96, 28, C.navy, { weight: 700 });
  out += text("If your result lacks one of these parts, the skill has not finished.", 60, 126, 15, C.slate) + "\n";
  rows.forEach((row, index) => {
    const y = tableTop + index * 48;
    out += box(60, y, 1080, 42, 10, index % 2 ? "#ffffff" : "#f1f5f9", C.border);
    out += '<circle cx="84" cy="' + (y + 21) + '" r="6" fill="' + C.green + '"/>';
    out += text(row[0], 102, y + 26, 15, C.navy, { weight: 700 });
    out += text(row[1], 400, y + 26, 15, C.line) + "\n";
  });
  out += text("IT DOES NOT", 60, limitsTop, 13, "#b45309", { weight: 700, spacing: 1.5 }) + "\n";
  limits.forEach((limit, index) => {
    const x = 60 + (index % 2) * 548;
    const y = limitsTop + 16 + Math.floor(index / 2) * 34;
    out += box(x, y, 532, 28, 8, "#fffbeb", "#fcd34d") + text(limit, x + 14, y + 19, 13.5, "#78350f") + "\n";
  });
  return out + "</svg>\n";
}

function skillPage(skill) {
  const lines = [
    "# " + skill.name,
    "",
    "> " + skill.takeaway,
    "",
    '<img src="drawing.svg" alt="' + esc(skill.short) + ' illustration" width="440">',
    "",
    "**Price:** $" + skill.price + " one-time, as shown on the listing on " + spec.observed + ".  ",
    "**Listing:** " + skill.listing + "  ",
    "**Whiteboard:** " + skill.whiteboard + " (private Claude whiteboard; the owner shares access)",
    "",
    "## What it does and how it acts",
    "",
    "![" + skill.short + " flow](flow.svg)",
    "",
    "## One sample run",
    "",
    "![" + skill.short + " sample run](run.svg)",
    "",
    "Source: " + skill.run.source + ". This shows how the skill acts. It is not a customer result.",
    "",
    "## The result you should get",
    "",
    "![" + skill.short + " result](result.svg)",
    "",
    "## It does not",
    ""
  ];
  skill.limits.forEach((limit) => lines.push("- " + limit));
  lines.push("", "[Back to all paid skills](../README.md)", "");
  return lines.join("\n");
}

function indexPage() {
  const lines = [
    "# Paid skill visuals",
    "",
    "One page per paid skill. Each page shows what the skill does, how it acts, one sample run, and the result you should get.",
    "",
    "Prices and listings as observed on " + spec.observed + ". The pictures use the Context Compass logo palette.",
    "",
    "| Skill | Price | What you get | Visuals | Whiteboard |",
    "| --- | --- | --- | --- | --- |"
  ];
  spec.skills.forEach((skill) => {
    lines.push("| [" + skill.short + "](" + skill.listing + ") | $" + skill.price + " | " + skill.takeaway + " | [Open](" + skill.slug + "/README.md) | [Board](" + skill.whiteboard + ") |");
  });
  lines.push("", "## How these are built", "",
    TICK + "skills.json" + TICK + " holds the facts for each skill. The " + TICK + "drawing.svg" + TICK + " files are drawn by hand. Everything else is generated:",
    "", TICK + TICK + TICK + "bash", "npm run build:visuals", TICK + TICK + TICK, "",
    "The whiteboards are private Claude whiteboards built from the same facts. They add an interactive sample run. The owner controls who can open them.",
    "", "Animations stop when the reader asks for reduced motion.", "");
  return lines.join("\n");
}

for (const skill of spec.skills) {
  const dir = join(outDir, skill.slug);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "flow.svg"), flowSvg(skill));
  writeFileSync(join(dir, "run.svg"), runSvg(skill));
  writeFileSync(join(dir, "result.svg"), resultSvg(skill));
  writeFileSync(join(dir, "README.md"), skillPage(skill));
}
writeFileSync(join(outDir, "README.md"), indexPage());
console.log("Built visuals for " + spec.skills.length + " skills in docs/skill-visuals");
