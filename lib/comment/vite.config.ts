/// <reference types="vitest/config" />
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";

let analyzer;
if (process.env.ANALYZE === "true") {
  analyzer = (await import("vite-bundle-analyzer")).analyzer;
}

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
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
    sourcemap: true,
    minify: false,
    lib: {
      entry: resolve(__dirname, "src/comment/index.tsx"),
      name: "Yuline",
      fileName: "yuline",
      formats: ["es"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/compiler-runtime",
        "react-dom",
        "react/jsx-runtime",
        "tailwind-merge",
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
