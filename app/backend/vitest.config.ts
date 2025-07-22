import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      exclude: ["src/auth/**/*.ts", "src/db/**/*.ts"],
    },
  },
});
