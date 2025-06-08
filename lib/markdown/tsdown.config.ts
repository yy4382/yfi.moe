import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/processor.ts", "src/parse.ts"],
  dts: true,
  sourcemap: true,
  unbundle: true,
});
