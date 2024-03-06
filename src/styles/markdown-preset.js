/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    "prose-a-bgi": {
      DEFAULT:
        "linear-gradient(to right, rgb(221 214 254 / 0.8), rgb(221 214 254 / 0.8))",
      dark: "linear-gradient(to right, hsl(236 100% 81% / 0.7), hsl(236 100% 81% / 0.7))",
    },
    extend: {
      colors: {
        "prose-code-bg": "oklch(0.95 0.025 280)",
        "prose-invert-code-bg": "oklch(0.33 0.035 280)",
      },
      typography: ({ theme }) => ({
        invert: {
          css: {
            a: {
              backgroundImage: theme("prose-a-bgi.dark"),
            },
            code: {
              backgroundColor: theme("colors.prose-invert-code-bg"),
            },
            "pre code": {
              backgroundColor: "transparent",
            },
          },
        },
        DEFAULT: {
          css: {
            "--tw-prose-code": theme("colors.btn.regular.text.light"),
            "--tw-prose-invert-code": theme("colors.btn.regular.text.dark"),

            // controlled by remark plugin
            // "--tw-prose-pre-bg": "oklch(0.2 0.015 280)",
            // "--tw-prose-invert-pre-bg": "oklch(0.17 0.015 280)",

            "--tw-prose-counters": theme("colors.primary.DEFAULT"),
            "--tw-prose-invert-counters": theme("colors.primary.dark"),
            "--tw-prose-bullets": theme("colors.primary.DEFAULT"),
            "--tw-prose-invert-bullets": theme("colors.primary.dark"),

            "--tw-prose-quote-borders": "oklch(0.95 0.025 280)",
            "--tw-prose-invert-quote-borders": "oklch(0.33 0.035 280)",

            a: {
              backgroundImage: theme("prose-a-bgi.DEFAULT"),
              backgroundSize: "100%",
              backgroundPosition: "left 0.7em",
              backgroundRepeat: "no-repeat",
              color: "currentColor",
              textDecoration: "none",
              fontWeight: "500",
              transitionProperty: "background-position",
              transitionDuration: "0.5s",
              transitionTimingFunction: "cubic-bezier(0,1,0.5,1)",
              "&:hover": {
                backgroundPosition: "left 0.95em",
              },
            },
            code: {
              backgroundColor: theme("colors.prose-code-bg"),
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
              padding: "1rem 1rem",
            },
            blockquote: {
              fontWeight: "500",
              fontStyle: "normal",
              color: "inherit",
            },
            "blockquote p:first-of-type::before": {
              content: "none",
            },
            "blockquote p:last-of-type::after": {
              content: "none",
            },
            "blockquote code": {
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
