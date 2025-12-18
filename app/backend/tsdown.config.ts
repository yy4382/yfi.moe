import { defineConfig } from "tsdown";

// eslint is false positive
export default defineConfig({
  entry: "src/index.ts",
  dts: {
    sourcemap: true,
  },
});
