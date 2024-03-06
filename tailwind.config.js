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

      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            // Additional styles for reference. Put in the base CSS file
            // Looking for a way to insert css variables in this file
            //
            // :root {
            //   --tw-prose-code-bg: oklch(0.95 0.025 280);
            //   --tw-prose-a-bgi: linear-gradient(to right, rgb(221 214 254 / 0.8), rgb(221 214 254 / 0.8));
            // }
            // @media (prefers-color-scheme: dark) {
            //   :root {
            //     --tw-prose-code-bg: oklch(0.33 0.035 280);
            //     --tw-prose-a-bgi: linear-gradient(to right, rgb(109 40 217 / 0.8), rgb(109 40 217 / 0.8));
            //   }
            // }

            "--tw-prose-code": theme("colors.btn.regular.text.light"),
            "--tw-prose-invert-code": theme("colors.btn.regular.text.dark"),

            // controlled by remark plugin
            // "--tw-prose-pre-bg": "oklch(0.2 0.015 280)",
            // "--tw-prose-invert-pre-bg": "oklch(0.17 0.015 280)",
            
            "--tw-prose-counters": theme("colors.primary.DEFAULT"),
            "--tw-prose-invert-counters": theme("colors.primary.dark"),
            "--tw-prose-bullets": theme("colors.primary.DEFAULT"),
            "--tw-prose-invert-bullets": theme("colors.primary.dark"),

            '--tw-prose-quote-borders': "oklch(0.95 0.025 280)",
            "--tw-prose-invert-quote-borders": "oklch(0.33 0.035 280)",

            a: {
              backgroundImage: "var(--tw-prose-a-bgi)",
              backgroundSize: "100%",
              backgroundPosition: "left 0.6em",
              backgroundRepeat: "no-repeat",
              color: "currentColor",
              textDecoration: "none",
              fontWeight: "500",
              transitionProperty: "background-position",
              transitionDuration: "0.5s",
              transitionTimingFunction: "cubic-bezier(0,1,0.5,1)",
              "&:hover": {
                backgroundPosition: "left 0.85em",
              },
            },
            code: {
              backgroundColor: "var(--tw-prose-code-bg)",
              color: "var(--tw-prose-code)",
              overflow: "hidden",
              borderRadius: "0.375rem",
              padding: "0.125rem 0.25rem",
              fontFamily: theme("font.mono"),
            },
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            pre: {
              borderRadius: "0.375rem",
              padding: "0 1rem",
            },
            blockquote: {
              fontWeight: '500',
              fontStyle: 'normal',
              color: 'inherit',
            },
            'blockquote p:first-of-type::before': {
              content: 'none',
            },
            'blockquote p:last-of-type::after': {
              content: 'none',
            },
            'blockquote code': {
              color: "var(--tw-prose-code)",
            },
            img: {
              borderRadius: "0.75rem",
            },
          },
        },
      }),
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
