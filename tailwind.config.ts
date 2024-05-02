import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
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
      },
      typography: ({ theme }: any) => ({
        DEFAULT: {
          css: {
            a: {
              textDecoration: "none",
              borderBottom: "2px solid var(--link-underline-normal)",
              transition: "border-bottom .1s ease-in-out",
              '&:hover': {
                borderBottom: "2px solid var(--link-underline-hover)",
              },
              '&:active': {
                borderBottom: "2px solid var(--link-underline-active)",
              },
            },
            "*:not(pre) > code": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
            blockquote: {
              fontWeight: "inherit",
              fontStyle: "normal",
            },
            'blockquote p:first-of-type::before': {
              content: 'none',
            },
            'blockquote p:last-of-type::after': {
              content: 'none',
            },
          },
        },
        invert: {
          css: {
            code: {
              backgroundColor: theme("colors.prose-invert-code-bg"),
            },
          },
        },
      }),
    },
  },
  plugins: [typography],
} satisfies Config;
