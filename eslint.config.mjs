import eslintPluginAstro from "eslint-plugin-astro";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import autoimportGlobals from "./auto-imports-eslint.mjs";
import pluginVue from "eslint-plugin-vue";

export default [
  {
    ignores: ["dist/", "node_modules/", ".astro/", "src/components/icons/"],
  },
  // JavaScript and TypeScript
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    name: "js and ts rules",
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
      "no-duplicate-imports": "warn",
    },
    languageOptions: {
      ...autoimportGlobals,
    },
  },

  // Astro
  ...eslintPluginAstro.configs.recommended,

  // Vue 3
  // https://stackoverflow.com/questions/78348933/how-to-use-eslint-flat-config-for-vue-with-typescript
  ...pluginVue.configs["flat/recommended"],
  {
    name: "vue config",
    files: ["src/**/*.vue"],
    plugins: {
      "typescript-eslint": tseslint.plugin,
    },
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: "./tsconfig.eslint.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
    rules: {
      "vue/max-attributes-per-line": "off",
    },
  },

  {
    name: "auto imports",
    languageOptions: {
      ...autoimportGlobals,
    },
  },
];
