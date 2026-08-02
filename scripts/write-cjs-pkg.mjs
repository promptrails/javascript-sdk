/**
 * Post-build: mark dist/cjs as CommonJS.
 *
 * The root package.json is "type": "module", so Node would otherwise parse the
 * `dist/cjs/*.js` files (emitted as CommonJS by tsconfig.cjs.json) as ESM and
 * `require('@promptrails/sdk')` throws `exports is not defined` / an ESM error.
 * A folder-scoped package.json overrides the type for that subtree.
 */
import { writeFileSync } from "fs";

writeFileSync("dist/cjs/package.json", `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`);
console.log("write-cjs-pkg: dist/cjs/package.json → { type: commonjs }");
