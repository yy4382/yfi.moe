import { defineConfig } from "tsdown/config";

export default [
  defineConfig({
    entry: ["src/index.ts"],
    platform: "node",
  }),
  defineConfig({
    entry: ["src/client.ts", "src/models.ts"],
    dts: true,
  }),
];
