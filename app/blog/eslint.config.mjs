import eslintPluginAstro from "eslint-plugin-astro";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
// import autoimportGlobals from "./auto-imports-eslint.mjs";
import pluginVue from "eslint-plugin-vue";

export default [
  {
    ignores: [
      "**/dist/",
      "**/node_modules/",
      "**/.astro/",
      "src/components/icons/",
      "**/.vercel/",
    ],
  },
  // JavaScript and TypeScript
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    name: "js and ts rules",
    rules: {
      "no-duplicate-imports": "warn",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
    // languageOptions: {
    //   ...autoimportGlobals,
    // },
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
        project: "./tsconfig.json",
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
    rules: {
      "vue/max-attributes-per-line": "off",
      "vue/html-self-closing": "off",
      "vue/singleline-html-element-content-newline": "off",
    },
  },
];
