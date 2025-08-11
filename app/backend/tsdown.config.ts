import { defineConfig } from "tsdown";

// eslint is false positive
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export default defineConfig({
  entry: "src/index.ts",
  noExternal: [/^@repo\//],
});
