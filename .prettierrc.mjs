/** @type {import("prettier").Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  plugins: [
    "prettier-plugin-astro",
    "@trivago/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  tailwindStylesheet: "./app/blog-astro/src/styles/global.css",
  importOrder: ["<THIRD_PARTY_MODULES>", "^@repo/(.*)$", "^@/(.*)$", "^[./]"],
};
