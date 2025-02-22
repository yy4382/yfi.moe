import eslintPluginAstro from "eslint-plugin-astro";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
// import autoimportGlobals from "./auto-imports-eslint.mjs";

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
];
