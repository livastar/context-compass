#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
const SKIP_DIRECTORIES = new Set([
    ".git",
    ".next",
    ".turbo",
    ".venv",
    "coverage",
    "dist",
    "fixtures",
    "node_modules",
    "target",
    "__fixtures__",
]);
const CODE_EXTENSIONS = new Set([
    ".cjs",
    ".cts",
    ".js",
    ".jsx",
    ".mjs",
    ".mts",
    ".py",
    ".ts",
    ".tsx",
]);
const DOC_NAMES = new Set([
    "README.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "CHANGELOG.md",
]);
const INSTRUCTION_NAMES = new Set([
    "AGENTS.md",
    "CLAUDE.md",
    "GEMINI.md",
]);
export async function analyzeProject(targetRoot, options = {}) {
    const root = resolve(targetRoot);
    const allFiles = walkFiles(root);
    const evidence = collectEvidence(root, allFiles);
    const packageJson = readJsonIfExists(join(root, "package.json"));
    const packageScripts = getPackageScripts(packageJson);
    const quality = buildQualitySection(root, allFiles, packageJson, packageScripts);
    const recentChanges = buildRecentChanges(root);
    const risks = buildRisks(root, allFiles, evidence, quality);
    const knowledgeBase = buildKnowledgeBaseSection(root, evidence);
    const intention = buildIntentionSection(root, packageJson, evidence);
    const verification = options.verify ? runVerification(root, quality.packageManager, packageScripts) : [];
    const report = {
        project: {
            name: inferProjectName(root, packageJson),
            root,
            hasGitRepository: recentChanges.branch !== null || existsSync(join(root, ".git")),
        },
        sections: {
            intention,
            contextSources: {
                instructions: evidence.filter((source) => source.kind === "instruction"),
                docs: evidence.filter((source) => source.kind === "documentation"),
                pluginManifests: evidence.filter((source) => source.kind === "plugin-manifest" || source.kind === "marketplace"),
                packageFiles: evidence.filter((source) => source.kind === "package"),
            },
            memoryAndDocs: {
                knowledgeBase,
                docs: evidence.filter((source) => source.kind === "documentation" || source.kind === "knowledge-base"),
            },
            quality,
            recentChanges,
            risks,
            verification,
        },
        evidence,
        recommendations: [],
    };
    report.recommendations = rankRecommendations(report);
    return report;
}
export function formatMarkdownReport(report) {
    const lines = [];
    lines.push(`# Context Compass: ${report.project.name}`);
    lines.push("");
    lines.push("## Project Intention");
    lines.push(report.sections.intention.summary);
    lines.push(`Evidence: ${formatEvidenceList(report.sections.intention.sources)}`);
    lines.push("");
    lines.push("## Context Sources");
    lines.push(`- Instructions: ${formatSourceCount(report.sections.contextSources.instructions)}`);
    lines.push(`- Docs: ${formatSourceCount(report.sections.contextSources.docs)}`);
    lines.push(`- Plugin manifests: ${formatSourceCount(report.sections.contextSources.pluginManifests)}`);
    lines.push(`- Package files: ${formatSourceCount(report.sections.contextSources.packageFiles)}`);
    lines.push("");
    lines.push("## Instruction Memory And Docs Map");
    lines.push(`- Knowledge base: ${report.sections.memoryAndDocs.knowledgeBase.detected ? "detected" : "not detected"}`);
    if (report.sections.memoryAndDocs.knowledgeBase.projects.length > 0) {
        lines.push(`- Knowledge projects: ${report.sections.memoryAndDocs.knowledgeBase.projects.join(", ")}`);
    }
    lines.push(`- Context docs: ${formatSourceCount(report.sections.memoryAndDocs.docs)}`);
    lines.push("");
    lines.push("## Code And Test Hygiene");
    lines.push(`- Package manager: ${report.sections.quality.packageManager ?? "not detected"}`);
    lines.push(`- Code files: ${report.sections.quality.codeFiles}`);
    lines.push(`- Test files: ${report.sections.quality.testFiles}`);
    lines.push(`- Quality scripts: ${formatScriptList(report.sections.quality.scripts)}`);
    for (const signal of report.sections.quality.styleSignals) {
        lines.push(`- ${signal}`);
    }
    lines.push("");
    lines.push("## Recent Change Signals");
    lines.push(`- Git branch: ${report.sections.recentChanges.branch ?? "not detected"}`);
    lines.push(`- Dirty files: ${report.sections.recentChanges.dirtyFiles}`);
    lines.push(`- Recent commits: ${report.sections.recentChanges.commits.length > 0 ? report.sections.recentChanges.commits.join(" | ") : "not detected"}`);
    lines.push("");
    if (report.sections.verification.length > 0) {
        lines.push("## Explicit Verification");
        for (const result of report.sections.verification) {
            lines.push(`- ${result.command}: ${result.status} (${result.summary})`);
        }
        lines.push("");
    }
    lines.push("## Risks And Missing Proof");
    if (report.sections.risks.length === 0) {
        lines.push("- No immediate context or quality risks detected by the local scan.");
    }
    else {
        for (const risk of report.sections.risks) {
            lines.push(`- ${risk}`);
        }
    }
    lines.push("");
    lines.push("## Ranked Next Best Actions");
    for (const recommendation of report.recommendations) {
        lines.push(`${recommendation.rank}. ${recommendation.title}`);
        lines.push(`   Reason: ${recommendation.reason}`);
        lines.push(`   Evidence: ${formatEvidenceList(recommendation.evidence)}`);
    }
    lines.push("");
    lines.push("_Context Compass runs local-first. Default scans are read-only and do not call external services._");
    return `${lines.join("\n")}\n`;
}
export async function runCli(argv = process.argv.slice(2)) {
    const { targetRoot, json, verify } = parseCliArgs(argv);
    const report = await analyzeProject(targetRoot, { verify });
    process.stdout.write(json ? `${JSON.stringify(report, null, 2)}\n` : formatMarkdownReport(report));
}
function parseCliArgs(argv) {
    let targetRoot = process.cwd();
    let json = false;
    let verify = false;
    for (const arg of argv) {
        if (arg === "--json") {
            json = true;
        }
        else if (arg === "--verify") {
            verify = true;
        }
        else if (arg === "--help" || arg === "-h") {
            process.stdout.write("Usage: context-compass [target-root] [--json] [--verify]\n");
            process.exit(0);
        }
        else {
            targetRoot = arg;
        }
    }
    return { targetRoot, json, verify };
}
function walkFiles(root) {
    const output = [];
    const stack = [root];
    while (stack.length > 0) {
        const current = stack.pop();
        if (!current) {
            continue;
        }
        for (const entry of safeReadDir(current)) {
            const absolutePath = join(current, entry);
            const relativePath = normalizeRelative(root, absolutePath);
            const stats = safeStat(absolutePath);
            if (!stats) {
                continue;
            }
            if (stats.isDirectory()) {
                if (!SKIP_DIRECTORIES.has(entry)) {
                    stack.push(absolutePath);
                }
            }
            else if (stats.isFile()) {
                output.push(relativePath);
            }
        }
    }
    return output.sort();
}
function collectEvidence(root, files) {
    const evidence = [];
    for (const file of files) {
        const name = basename(file);
        const label = file;
        if (INSTRUCTION_NAMES.has(name) || file === ".codex/AGENTS.md") {
            evidence.push({ path: file, kind: "instruction", label });
        }
        else if (file === "package.json" || file.endsWith("/package.json") || file === "pyproject.toml") {
            evidence.push({ path: file, kind: "package", label });
        }
        else if (file.endsWith(".codex-plugin/plugin.json")) {
            evidence.push({ path: file, kind: "plugin-manifest", label });
        }
        else if (file === ".agents/plugins/marketplace.json" || file.endsWith("/.agents/plugins/marketplace.json")) {
            evidence.push({ path: file, kind: "marketplace", label });
        }
        else if (file.startsWith("knowledge-base/")) {
            evidence.push({ path: file, kind: "knowledge-base", label });
        }
        else if (DOC_NAMES.has(name) || file.startsWith("docs/") || file.endsWith(".md")) {
            evidence.push({ path: file, kind: "documentation", label });
        }
        else if (isTestFile(file)) {
            evidence.push({ path: file, kind: "test", label });
        }
        else if (isCodeFile(file)) {
            evidence.push({ path: file, kind: "code", label });
        }
    }
    return evidence;
}
function buildIntentionSection(root, packageJson, evidence) {
    const readme = evidence.find((source) => source.path === "README.md");
    const summary = readme
        ? extractMarkdownHeading(readFileSafe(join(root, readme.path))) ?? "README detected, but no clear title was found."
        : inferProjectName(root, packageJson);
    return {
        summary,
        sources: readme ? [readme.path] : [],
    };
}
function buildKnowledgeBaseSection(root, evidence) {
    const kbFiles = evidence.filter((source) => source.kind === "knowledge-base");
    const registry = readJsonIfExists(join(root, "knowledge-base", "registry.json"));
    const projects = getRegistryProjectIds(registry);
    return {
        detected: kbFiles.length > 0,
        projects,
        files: kbFiles,
    };
}
function buildQualitySection(root, files, packageJson, scripts) {
    const codeFiles = files.filter((file) => isCodeFile(file) && !isTestFile(file));
    const testFiles = files.filter(isTestFile);
    const sourceDirectories = unique(codeFiles.map((file) => firstDirectory(file)));
    const testDirectories = unique(testFiles.map((file) => firstDirectory(file)));
    const qualityScripts = pickQualityScripts(scripts);
    const styleSignals = buildStyleSignals(files, qualityScripts, codeFiles.length, testFiles.length);
    return {
        packageManager: inferPackageManager(root, packageJson),
        scripts: qualityScripts,
        codeFiles: codeFiles.length,
        testFiles: testFiles.length,
        sourceDirectories,
        testDirectories,
        styleSignals,
    };
}
function buildRecentChanges(root) {
    if (!existsSync(join(root, ".git"))) {
        return {
            branch: null,
            commits: [],
            dirtyFiles: 0,
        };
    }
    const branch = runGit(root, ["branch", "--show-current"]);
    const commitOutput = runGit(root, ["log", "--oneline", "-3"]);
    const dirtyOutput = runGit(root, ["status", "--short"]);
    return {
        branch: branch || null,
        commits: commitOutput ? commitOutput.split("\n").filter(Boolean) : [],
        dirtyFiles: dirtyOutput ? dirtyOutput.split("\n").filter(Boolean).length : 0,
    };
}
function buildRisks(root, files, evidence, quality) {
    const risks = [];
    if (!evidence.some((source) => source.path === "README.md")) {
        risks.push("README.md is missing, so public intention is weak.");
    }
    if (evidence.filter((source) => source.kind === "instruction").length === 0) {
        risks.push("No agent instruction file was detected.");
    }
    if (quality.codeFiles > 0 && quality.testFiles === 0) {
        risks.push("Code is present without detected tests.");
    }
    for (const required of ["test", "lint", "typecheck"]) {
        if (quality.codeFiles > 0 && !quality.scripts[required]) {
            risks.push(`No ${required} script was detected for code proof.`);
        }
    }
    const todoFiles = files.filter((file) => shouldScanForTodos(file) && containsTodo(join(root, file)));
    if (todoFiles.length > 0) {
        risks.push(`TODO/FIXME markers detected in ${todoFiles.length} file(s): ${todoFiles.slice(0, 4).join(", ")}.`);
    }
    return risks;
}
function rankRecommendations(report) {
    const candidates = [];
    const kbEvidence = report.sections.memoryAndDocs.knowledgeBase.files.map((source) => source.path);
    if (report.sections.memoryAndDocs.knowledgeBase.detected) {
        candidates.push({
            title: "Start from canonical context before choosing implementation depth",
            reason: "A knowledge-base is present; use it as the context and proof gate before changing code or expanding scope.",
            evidence: kbEvidence.slice(0, 4),
            score: 95,
        });
    }
    if (report.sections.risks.length > 0) {
        candidates.push({
            title: "Close the highest context or proof gap",
            reason: "Detected risks point to missing proof, stale TODOs, or weak instructions; resolving them improves direction quality.",
            evidence: report.evidence.slice(0, 4).map((source) => source.path),
            score: 90,
        });
    }
    if (report.sections.contextSources.pluginManifests.length > 0) {
        candidates.push({
            title: "Validate the marketplace installation path",
            reason: "Plugin metadata is present, so installability and manifest consistency are the next public trust checks.",
            evidence: report.sections.contextSources.pluginManifests.map((source) => source.path).slice(0, 4),
            score: 82,
        });
    }
    if (report.sections.quality.codeFiles > 0 && report.sections.quality.testFiles > 0) {
        candidates.push({
            title: "Run the explicit quality gate before changing behavior",
            reason: "Code and tests are both present; prove the current baseline before making the next implementation move.",
            evidence: report.sections.contextSources.packageFiles.map((source) => source.path),
            score: 78,
        });
    }
    candidates.push({
        title: "Orient before acting",
        reason: "Use the mapped context sources to select one grounded next step instead of adding surface area.",
        evidence: report.evidence.slice(0, 4).map((source) => source.path),
        score: 60,
    });
    return candidates
        .filter((candidate) => candidate.evidence.length > 0 || candidate.title === "Orient before acting")
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((candidate, index) => ({ ...candidate, rank: index + 1 }));
}
function runVerification(root, packageManager, scripts) {
    if (!packageManager) {
        return [{ command: "verification", status: "skipped", exitCode: null, summary: "No package manager detected." }];
    }
    const scriptNames = scripts.check ? ["check"] : ["typecheck", "lint", "test", "build"].filter((name) => scripts[name]);
    if (scriptNames.length === 0) {
        return [{ command: "verification", status: "skipped", exitCode: null, summary: "No quality scripts detected." }];
    }
    return scriptNames.map((scriptName) => {
        const command = `${packageManager} run ${scriptName}`;
        const result = spawnSync(packageManager, ["run", scriptName], {
            cwd: root,
            encoding: "utf8",
            timeout: 120_000,
        });
        const exitCode = typeof result.status === "number" ? result.status : null;
        return {
            command,
            status: exitCode === 0 ? "passed" : "failed",
            exitCode,
            summary: summarizeCommandOutput(result.stdout, result.stderr),
        };
    });
}
function getPackageScripts(packageJson) {
    if (!isRecord(packageJson) || !isRecord(packageJson.scripts)) {
        return {};
    }
    return Object.fromEntries(Object.entries(packageJson.scripts).filter((entry) => typeof entry[1] === "string"));
}
function pickQualityScripts(scripts) {
    const picked = {};
    for (const name of ["check", "build", "lint", "typecheck", "test", "test:e2e", "format:check"]) {
        if (scripts[name]) {
            picked[name] = scripts[name];
        }
    }
    return picked;
}
function buildStyleSignals(files, scripts, codeFiles, testFiles) {
    const signals = [];
    if (codeFiles > 0) {
        signals.push(`Source surface is ${codeFiles} code file(s), small enough for direct review.`);
    }
    if (testFiles > 0) {
        signals.push(`Test surface is ${testFiles} file(s), so behavior can be proven locally.`);
    }
    if (scripts.check) {
        signals.push("A combined check script is present.");
    }
    if (scripts.lint && scripts.typecheck && scripts.test) {
        signals.push("Lint, typecheck, and test scripts are all present.");
    }
    if (files.some((file) => file.endsWith(".ts") || file.endsWith(".tsx"))) {
        signals.push("TypeScript is part of the project tone.");
    }
    return signals;
}
function inferPackageManager(root, packageJson) {
    if (existsSync(join(root, "pnpm-lock.yaml"))) {
        return "pnpm";
    }
    if (existsSync(join(root, "yarn.lock"))) {
        return "yarn";
    }
    if (existsSync(join(root, "package-lock.json"))) {
        return "npm";
    }
    if (isRecord(packageJson) && typeof packageJson.packageManager === "string") {
        return packageJson.packageManager.split("@")[0] || null;
    }
    return isRecord(packageJson) ? "npm" : null;
}
function inferProjectName(root, packageJson) {
    void packageJson;
    return basename(root);
}
function getRegistryProjectIds(registry) {
    if (!isRecord(registry) || !Array.isArray(registry.projects)) {
        return [];
    }
    return registry.projects
        .map((project) => (isRecord(project) && typeof project.id === "string" ? project.id : null))
        .filter((project) => project !== null);
}
function readJsonIfExists(path) {
    try {
        if (!existsSync(path)) {
            return null;
        }
        return JSON.parse(readFileSync(path, "utf8"));
    }
    catch {
        return null;
    }
}
function extractMarkdownHeading(text) {
    for (const line of text.split("\n")) {
        const match = /^#\s+(.+)$/.exec(line.trim());
        if (match?.[1]) {
            return match[1].trim();
        }
    }
    return null;
}
function isCodeFile(path) {
    return CODE_EXTENSIONS.has(extension(path));
}
function isTestFile(path) {
    return /(^|\/)(tests?|__tests__)\//.test(path) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(path);
}
function shouldScanForTodos(path) {
    return path.endsWith(".md") || isCodeFile(path);
}
function containsTodo(path) {
    return /(?:^|\s)(TODO|FIXME)\s*:/im.test(readFileSafe(path));
}
function extension(path) {
    const dotIndex = path.lastIndexOf(".");
    return dotIndex === -1 ? "" : path.slice(dotIndex);
}
function firstDirectory(path) {
    const [first] = path.split("/");
    return first ?? ".";
}
function unique(values) {
    return Array.from(new Set(values)).filter(Boolean).sort();
}
function formatSourceCount(sources) {
    if (sources.length === 0) {
        return "none";
    }
    return `${sources.length} (${sources.map((source) => source.path).slice(0, 4).join(", ")})`;
}
function formatScriptList(scripts) {
    const entries = Object.entries(scripts);
    if (entries.length === 0) {
        return "none";
    }
    return entries.map(([name, command]) => `${name}: \`${command}\``).join("; ");
}
function formatEvidenceList(paths) {
    return paths.length > 0 ? paths.join(", ") : "not detected";
}
function normalizeRelative(root, absolutePath) {
    return relative(root, absolutePath).split(sep).join("/");
}
function safeReadDir(path) {
    try {
        return readdirSync(path);
    }
    catch {
        return [];
    }
}
function safeStat(path) {
    try {
        return statSync(path);
    }
    catch {
        return null;
    }
}
function readFileSafe(path) {
    try {
        return readFileSync(path, "utf8");
    }
    catch {
        return "";
    }
}
function runGit(root, args) {
    try {
        return execFileSync("git", args, {
            cwd: root,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
            timeout: 10_000,
        }).trim();
    }
    catch {
        return "";
    }
}
function summarizeCommandOutput(stdout, stderr) {
    const combined = `${stdout ?? ""}\n${stderr ?? ""}`.trim();
    if (!combined) {
        return "No output.";
    }
    return combined.split("\n").slice(-3).join(" ").slice(0, 240);
}
function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}
const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
    runCli().catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`${message}\n`);
        process.exit(1);
    });
}
