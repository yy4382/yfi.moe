import { transformAsync } from "@babel/core";
import stylexBabelPlugin, { type Rule } from "@stylexjs/babel-plugin";
import stylexVitePlugin from "@stylexjs/unplugin/vite";
import type { AstroIntegration } from "astro";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

type StyleXStore = {
  rulesById: Map<string, Rule[]>;
  version: number;
};

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const moduleResolution = {
  type: "commonJS" as const,
  rootDir: workspaceRoot,
};

export function stylexIntegration(): AstroIntegration {
  return {
    name: "blog-astro-stylex",
    hooks: {
      "astro:config:setup": ({ command, injectScript, updateConfig }) => {
        const dev = command === "dev";
        const unpluginOptions = {
          dev,
          devMode: "css-only" as const,
          externalPackages: ["@repo/comment", "@repo/design-tokens"],
          importSources: ["@stylexjs/stylex"],
          unstable_moduleResolution: moduleResolution,
          useCSSLayers: true,
        };

        updateConfig({
          vite: {
            plugins: [
              stylexVitePlugin(unpluginOptions),
              astroStylexTransform({ dev }),
            ],
          },
        });

        if (dev) {
          injectScript("page", 'import "virtual:stylex:css-only";');
        }
      },
    },
  };
}

function astroStylexTransform({ dev }: { dev: boolean }) {
  const transformedIds = new Set<string>();

  return {
    name: "blog-astro-stylex-transform",
    enforce: "post" as const,
    buildStart() {
      const store = getStyleXStore();
      for (const id of transformedIds) {
        store.rulesById.delete(id);
      }
      transformedIds.clear();
      store.version += 1;
    },
    async transform(code: string, id: string) {
      const filename = cleanFilename(id);
      if (!filename.endsWith(".astro") || !code.includes("@stylexjs/stylex")) {
        return null;
      }

      const result = await transformAsync(code, {
        babelrc: false,
        caller: {
          name: "blog-astro-stylex-transform",
          supportsDynamicImport: true,
          supportsExportNamespaceFrom: true,
          supportsStaticESM: true,
          supportsTopLevelAwait: true,
        },
        configFile: false,
        filename,
        parserOpts: {
          plugins: ["jsx", "typescript"],
          sourceType: "module",
        },
        plugins: [
          stylexBabelPlugin.withOptions({
            dev,
            importSources: ["@stylexjs/stylex"],
            treeshakeCompensation: true,
            unstable_moduleResolution: moduleResolution,
          }),
        ],
        sourceMaps: true,
      });

      if (!result?.code) {
        return null;
      }

      const metadata = result.metadata as { stylex?: Rule[] };
      const rules = metadata.stylex ?? [];
      const store = getStyleXStore();
      if (rules.length > 0) {
        store.rulesById.set(id, rules);
        transformedIds.add(id);
      } else {
        store.rulesById.delete(id);
        transformedIds.delete(id);
      }
      store.version += 1;

      return {
        code: result.code,
        map: result.map,
      };
    },
  };
}

function cleanFilename(id: string) {
  return id.split("?", 1)[0]?.replace(/^\0/, "") ?? id;
}

function getStyleXStore(): StyleXStore {
  const globalStore = globalThis as typeof globalThis & {
    __stylex_unplugin_store?: StyleXStore;
  };
  globalStore.__stylex_unplugin_store ??= {
    rulesById: new Map(),
    version: 0,
  };
  return globalStore.__stylex_unplugin_store;
}
