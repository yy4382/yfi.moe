// /// <reference types="vitest" />
/* 
the three slashes won't work here because vitest is calling vite 7, while
  astro is calling vite 6, so we need to manually call defineConfig instead 
*/
import type { ViteUserConfig } from "astro";
import { envField, getViteConfig } from "astro/config";
import { defineConfig } from "vitest/config";

export default getViteConfig(
  defineConfig({
    test: {},
  }) as ViteUserConfig,
  {
    // override to empty env, allowing tests to run without env variables
    env: {
      schema: {
        // for unknown reasons, we must set envs that are "client and not optional" to optional to stop astro
        // from making them required and failing tests
        WALINE_URL: envField.string({
          optional: true,
          context: "client",
          access: "public",
        }),
      },
    },
  },
);
