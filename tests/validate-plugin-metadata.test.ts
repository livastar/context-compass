import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

describe("plugin metadata", () => {
  it("has marketplace and plugin metadata ready for local install", () => {
    const marketplace = JSON.parse(readFileSync(".agents/plugins/marketplace.json", "utf8"));
    const plugin = JSON.parse(readFileSync("plugins/context-compass/.codex-plugin/plugin.json", "utf8"));

    assert.equal(marketplace.name, "livastar-context-tools");
    assert.equal(marketplace.plugins[0].name, "context-compass");
    assert.equal(marketplace.plugins[0].source.path, "./plugins/context-compass");
    assert.equal(marketplace.plugins[0].policy.installation, "AVAILABLE");
    assert.equal(plugin.name, "context-compass");
    assert.equal(plugin.version, "0.1.0");
    assert.equal(plugin.license, "MIT");
    assert.equal(plugin.interface.displayName, "Context Compass");
    assert.equal(existsSync("plugins/context-compass/scripts/context-compass.mjs"), true);
    assert.ok(!JSON.stringify(plugin).includes("[TODO"));
  });
});
