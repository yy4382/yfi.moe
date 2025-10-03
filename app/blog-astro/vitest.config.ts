import type { ViteUserConfig } from "astro";
import { getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  defineConfig({
    test: {},
  }) as ViteUserConfig,
  {
    // override to empty env, allowing tests to run without env variables
    env: {},
  },
);
