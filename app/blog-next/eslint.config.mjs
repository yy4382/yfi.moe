import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from "@tanstack/eslint-plugin-query";
import reactHooks from "eslint-hooks-rc";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = tseslint.config(
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { "react-hooks-rc": reactHooks },
    rules: {
      "react-hooks-rc/react-compiler": "error",
    },
  },
  ...compat.config({
    extends: ["next/core-web-vitals"],
  }),
  [
    ...tseslint.configs.recommendedTypeChecked,
    {
      name: "typescript-eslint/custom-added",
      rules: {
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-unused-expressions": "warn",
      },
    },
  ],
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);

export default eslintConfig;
