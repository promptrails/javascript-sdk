/**
 * Post-build script: adds .js extensions to relative imports in dist/*.js files.
 *
 * TypeScript with "module": "ES2022" + "moduleResolution": "node" emits
 * `from "./foo"` but Node ESM requires `from "./foo.js"`.
 */

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "fs";
import { join, dirname, resolve } from "path";

const DIST = new URL("../dist", import.meta.url).pathname;

function walk(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (entry === "cjs") continue; // skip CJS output
    if (statSync(full).isDirectory()) {
      files.push(...walk(full));
    } else if (full.endsWith(".js")) {
      files.push(full);
    }
  }
  return files;
}

// Match: from "./something" or from "../something" (without .js)
const RE = /(from\s+["'])(\.\.?\/[^"']+?)(["'])/g;

let fixed = 0;
for (const file of walk(DIST)) {
  const src = readFileSync(file, "utf8");
  const dir = dirname(file);
  const out = src.replace(RE, (match, pre, path, post) => {
    if (path.endsWith(".js") || path.endsWith(".json")) return match;

    // Check if the import points to a directory (with index.js inside)
    const resolved = resolve(dir, path);
    if (existsSync(resolved) && statSync(resolved).isDirectory()) {
      fixed++;
      return `${pre}${path}/index.js${post}`;
    }

    fixed++;
    return `${pre}${path}.js${post}`;
  });
  if (out !== src) {
    writeFileSync(file, out);
  }
}

console.log(`fix-esm-imports: patched ${fixed} imports in dist/`);
