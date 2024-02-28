/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
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

        codeblock: {
          DEFAULT: "oklch(0.2 0.015 280)",
          dark: "oklch(0.17 0.015 280)",
          sel: "oklch(0.40 0.08 280)",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
