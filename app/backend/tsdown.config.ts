import { defineConfig } from "tsdown/config";

export default defineConfig({
  entry: ["src/index.ts", "src/client.ts"],
  dts: {
    sourcemap: true,
  },
  format: "esm",
  platform: "node",
  unbundle: true,
});
