import path from "node:path";
import { build } from "esbuild";
import pkg from "../package.json" with { type: "json" };

const root = path.resolve(import.meta.dirname, "..");

// npm dependencies stay external (installed at runtime); the internal
// @deskaway/shared package ships TS source, so it is inlined into the bundle.
const external = Object.keys(pkg.dependencies).filter(
  (name) => name !== "@deskaway/shared",
);

await build({
  entryPoints: [path.join(root, "src/server.ts")],
  outfile: path.join(root, "dist/server.js"),
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node24",
  sourcemap: true,
  external,
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "info",
});
