import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import pluginQuery from "@tanstack/eslint-plugin-query";
import reactHooks from "eslint-hooks-rc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...pluginQuery.configs["flat/recommended"],
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: { "react-hooks-rc": reactHooks },
    rules: {
      "react-hooks-rc/react-compiler": "error",
    },
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
