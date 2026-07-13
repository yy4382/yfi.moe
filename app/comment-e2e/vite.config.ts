import stylexVitePlugin from "@stylexjs/unplugin/vite";
import react from "@vitejs/plugin-react";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const packageDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    stylexVitePlugin({
      dev: command === "serve",
      devMode: "css-only",
      externalPackages: ["@repo/comment", "@repo/design-tokens"],
      importSources: ["@stylexjs/stylex"],
      unstable_moduleResolution: {
        type: "commonJS",
        rootDir: resolve(packageDir, "../.."),
      },
      useCSSLayers: true,
    }),
    react(),
  ],
}));
