import { defineConfig } from "tsdown";

export default defineConfig({
  noExternal: [/^@repo\//],
  outDir: "dist",
  entry: "src/index.ts",
  format: "esm",
  target: "es2020",
  clean: true,
});
