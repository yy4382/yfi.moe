/** @type {import("prettier").Config} */
export default {
  plugins: ["prettier-plugin-astro", "@trivago/prettier-plugin-sort-imports"],
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
  importOrder: ["<THIRD_PARTY_MODULES>", "^@repo/(.*)$", "^@/(.*)$", "^[./]"],
};
