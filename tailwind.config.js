const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  presets: [require("./src/styles/markdown-preset.js")],
  theme: {
    extend: {
      colors: {
        portage: {
          50: "hsl(230, 100%, 96%)",
          100: "hsl(234, 100%, 94%)",
          200: "hsl(234, 100%, 89%)",
          300: "hsl(236, 100%, 81%)",
          400: "hsl(241, 95%, 74%)",
          500: "hsl(246, 89%, 67%)",
          600: "hsl(250, 80%, 59%)",
          700: "hsl(251, 62%, 51%)",
          800: "hsl(251, 58%, 41%)",
          900: "hsl(249, 51%, 34%)",
          950: "hsl(252, 51%, 20%)",
        },

        primary: {
          DEFAULT: "oklch(0.7 0.15 280 / <alpha-value>)",
          dark: "oklch(0.75 0.14 280)",
        },

        link: {
          DEFAULT: "oklch(75% 0.1 280 / <alpha-value>)",
          dark: "oklch(0.95 0.025 280  / <alpha-value>)",
        },
        card: {
          DEFAULT: "white",
          dark: "oklch(0.23 0.015 280)",
        },
        btn: {
          regular: {
            bg: {
              light: {
                DEFAULT: "oklch(0.95 0.025 280)",
                hover: "oklch(0.9 0.05 280)",
                active: "oklch(0.85 0.08 280)",
              },
              dark: {
                DEFAULT: "oklch(0.33 0.035 280)",
                hover: "oklch(0.38 0.04 280)",
                active: "oklch(0.43 0.05 280)",
              },
            },
            text: {
              light: "oklch(0.55 0.12 280)",
              dark: "oklch(0.8 0.03 280)",
            },
          },
          plain: {
            bg: {
              light: {
                hover: "oklch(0.95 0.025 280)",
                active: "oklch(0.98 0.01 280)",
              },
              dark: {
                hover: "oklch(0.17 0.017 280)",
                active: "oklch(0.19 0.017 280)",
              },
            },
          },
          card: {
            bg: {
              light: {
                hover: "oklch(0.98 0.005 280)",
                active: "oklch(0.3 0.03 280)",
              },
              dark: {
                hover: "oklch(0.9 0.03 280)",
                active: "oklch(0.35 0.035 280)",
              },
            },
          },
        },
      },
    },
  },
};
