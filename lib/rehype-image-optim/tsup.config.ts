import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
});
