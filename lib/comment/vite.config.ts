/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel";
import stylex from "@stylexjs/unplugin";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import { stylexLayers } from "../../stylex-layers";

let analyzer;
if (process.env.ANALYZE === "true") {
  analyzer = (await import("vite-bundle-analyzer")).analyzer;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    (process.env.VITEST ? stylex.rollup : stylex.vite)({
      dev: false,
      classNamePrefix: "c",
      runtimeInjection: false,
      // Independent library builds must not reuse the app's priority indexes.
      useCSSLayers: stylexLayers("comment"),
      lightningcssOptions: { minify: true },
    }),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    Icons({ compiler: "jsx", jsx: "react" }),
    ...((process.env.ANALYZE === "true" && analyzer
      ? [analyzer()].flat()
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        []) as any[]),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    cssCodeSplit: false,
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/comment/index.tsx"),
      name: "Yuline",
      fileName: "yuline",
      cssFileName: "yuline",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "@stylexjs/stylex",
        "react",
        "react/compiler-runtime",
        "react-dom",
        "react/jsx-runtime",
        "sonner",
        "@tanstack/react-query",
        "zod",
        "radix-ui",
        "immer",
        "jotai",
        "@repo/api",
        /motion(\/.*)?/,
        /better-auth(\/.*)?/,
        /hono(\/.*)?/,
      ],
    },
  },
  server: {
    port: 3000,
  },
  test: {
    setupFiles: ["./test/vitest-cleanup-after-each.ts"],
    environment: "jsdom",
  },
});
