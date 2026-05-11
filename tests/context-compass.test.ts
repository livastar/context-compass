import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  analyzeProject,
  formatMarkdownReport,
  type CompassReport,
} from "../src/context-compass.js";

const fixturesRoot = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

describe("Context Compass scanner", () => {
  it("maps basic project intention and instruction context", async () => {
    const report = await analyzeProject(join(fixturesRoot, "plain-repo"));

    assert.equal(report.project.name, "plain-repo");
    assert.equal(report.project.hasGitRepository, false);
    assert.ok(hasSource(report, "README.md"));
    assert.ok(hasSource(report, "AGENTS.md"));
    assert.match(report.sections.intention.summary, /Plain Fixture/);
    assert.ok(report.recommendations.length > 0);
  });

  it("detects marketplace and plugin manifests", async () => {
    const report = await analyzeProject(join(fixturesRoot, "plugin-repo"));

    assert.ok(hasSource(report, ".agents/plugins/marketplace.json"));
    assert.ok(hasSource(report, "plugins/sample/.codex-plugin/plugin.json"));
    assert.ok(report.sections.contextSources.pluginManifests.some((source) => source.kind === "plugin-manifest"));
  });

  it("treats ds-light knowledge-base files as first-class context", async () => {
    const report = await analyzeProject(join(fixturesRoot, "ds-light-repo"));

    assert.equal(report.sections.memoryAndDocs.knowledgeBase.detected, true);
    assert.deepEqual(report.sections.memoryAndDocs.knowledgeBase.projects, ["alpha"]);
    assert.ok(hasSource(report, "knowledge-base/registry.json"));
    assert.ok(hasSource(report, "knowledge-base/portfolio-roadmap.md"));
    assert.match(report.recommendations[0]?.reason ?? "", /proof|evidence|quality|context/i);
  });

  it("reports code, test, script, and stale-plan hygiene signals", async () => {
    const report = await analyzeProject(join(fixturesRoot, "hygiene-repo"));

    assert.equal(report.sections.quality.scripts.test, "node --test");
    assert.equal(report.sections.quality.scripts.typecheck, "tsc --noEmit");
    assert.equal(report.sections.quality.codeFiles, 1);
    assert.equal(report.sections.quality.testFiles, 1);
    assert.ok(report.sections.risks.some((risk) => risk.includes("TODO")));
  });

  it("renders a stable Markdown map with required sections and evidence-backed recommendations", async () => {
    const report = await analyzeProject(join(fixturesRoot, "hygiene-repo"));
    const markdown = formatMarkdownReport(report);

    assert.match(markdown, /^# Context Compass: hygiene-repo/m);
    assert.match(markdown, /## Project Intention/);
    assert.match(markdown, /## Context Sources/);
    assert.match(markdown, /## Code And Test Hygiene/);
    assert.match(markdown, /## Risks And Missing Proof/);
    assert.match(markdown, /## Ranked Next Best Actions/);
    assert.match(markdown, /Evidence:/);
  });
});

function hasSource(report: CompassReport, relativePath: string): boolean {
  return report.evidence.some((source) => source.path === relativePath);
}
