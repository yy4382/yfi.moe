/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "oklch(0.7 0.14 var(--hue))",
        primary_d: "oklch(0.75 0.14 var(--hue))",

        link_h: "oklch(0.95 0.025 var(--hue))",
        link_h_d: "oklch(0.40 0.08 var(--hue))",
        link_a: "oklch(0.90 0.05 var(--hue))",
        link_a_d: "oklch(0.35 0.07 var(--hue))",

        card_bg: "white",
        card_bg_d: "oklch(0.23 0.015 var(--hue))",

        btn_c: "oklch(0.55 0.12 var(--hue))",
        btn_c_d: "oklch(0.8 0.03 var(--hue))",
        btn_bg: "oklch(0.95 0.025 var(--hue))",
        btn_bg_d: "oklch(0.33 0.035 var(--hue))",

        btn_plain_h: "oklch(0.95 0.025 var(--hue))",
        btn_plain_h_d: "oklch(0.17 0.017 var(--hue))",
        btn_plain_a: "oklch(0.98 0.01 var(--hue)) ",
        btn_plain_a_d: "oklch(0.19 0.017 var(--hue))lain",

        codeblock_bg: "oklch(0.2 0.015 var(--hue))",
        codeblock_bg_d: "oklch(0.17 0.015 var(--hue))",
        codeblock_sel: "oklch(0.40 0.08 var(--hue))",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
  // daisyui: {
  //   themes: false, // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
  //   darkTheme: "light", // name of one of the included themes for dark mode
  //   base: false, // applies background color and foreground color for root element by default
  //   styled: true, // include daisyUI colors and design decisions for all components
  //   utils: true, // adds responsive and modifier utility classes
  //   prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
  //   logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
  //   themeRoot: ":root", // The element that receives theme color CSS variables
  // },
};
