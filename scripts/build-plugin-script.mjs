import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const source = "dist/src/context-compass.js";
const target = "plugins/context-compass/scripts/context-compass.mjs";

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
process.stdout.write(`Bundled plugin runtime: ${target}\n`);
