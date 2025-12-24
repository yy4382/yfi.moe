// @ts-check
import eslint from "@eslint/js";
import eslintPluginAstro from "eslint-plugin-astro";
import reactHooks from "eslint-plugin-react-hooks";
// import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", ".astro"]),
  eslint.configs.recommended,
  tseslint.configs.recommended,

  // Must declare `@typescript-eslint/parser` as devDependency!
  // When used in CLI, astro plugin could figure out the parser is installed via
  // other plugin's dependency, thus working correctly.
  //
  // However, the vscode extension works differently, unless the parser is
  // declared as devDependency, it will use the js parser, causing parse errors.
  eslintPluginAstro.configs.recommended,

  reactHooks.configs.flat.recommended,
  // reactRefresh.configs.vite,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
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
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },
]);
