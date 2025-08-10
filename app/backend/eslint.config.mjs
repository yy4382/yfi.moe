// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["node_modules", "dist", "eslint.config.mjs", "coverage"],
  },
  eslint.configs.recommended,
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
