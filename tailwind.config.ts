import type { Config } from "tailwindcss";
import type { CSSRuleObject, PluginAPI } from "tailwindcss/types/config";
import typography from "@tailwindcss/typography";
import { withTV } from "tailwind-variants/transformer";
import "./cssAsPlugin.cjs";

const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: () => ({
        portage: {
          50: "oklch(97% 0.05 var(--primary-hue) / <alpha-value>)",
          100: "oklch(94% 0.02 var(--primary-hue) / <alpha-value>)",
          200: "oklch(90% 0.05 var(--primary-hue) / <alpha-value>)",
          250: "oklch(88% 0.08 var(--primary-hue) / <alpha-value>)",
          300: "oklch(83% 0.11 var(--primary-hue) / <alpha-value>)",
          400: "oklch(75% 0.14 var(--primary-hue) / <alpha-value>)",
          500: "oklch(65% 0.14 var(--primary-hue) / <alpha-value>)",
          600: "oklch(58% 0.12 var(--primary-hue) / <alpha-value>)",
          700: "oklch(54% 0.1 var(--primary-hue) / <alpha-value>)",
          800: "oklch(45% 0.06 var(--primary-hue) / <alpha-value>)",
          900: "oklch(40% 0.04 var(--primary-hue) / <alpha-value>)",
          950: "oklch(28% 0.025 var(--primary-hue) / <alpha-value>)",
        },
      }),
      backgroundColor: {
        card: "var(--bg-card)",
        popover: "var(--bg-popover)",
      },
      textColor: {
        content: {
          DEFAULT: "var(--text-content)",
          primary: "var(--text-content-primary)",
        },
        heading: "var(--text-heading)",
        comment: "var(--text-comment)",
        primary: "var(--text-primary)",
        active: "var(--text-active)",
      },
      transitionTimingFunction: {
        /* From Chrome DevTool presets */
        /* prettier-ignore */
        bounce: "linear(0 0%, 0 2.27%, 0.02 4.53%, 0.04 6.8%, 0.06 9.07%, 0.1 11.33%, 0.14 13.6%, 0.25 18.15%, 0.39 22.7%, 0.56 27.25%, 0.77 31.8%, 1 36.35%, 0.89 40.9%, 0.85 43.18%, 0.81 45.45%, 0.79 47.72%, 0.77 50%, 0.75 52.27%, 0.75 54.55%, 0.75 56.82%, 0.77 59.1%, 0.79 61.38%, 0.81 63.65%, 0.85 65.93%, 0.89 68.2%, 1 72.7%, 0.97 74.98%, 0.95 77.25%, 0.94 79.53%, 0.94 81.8%, 0.94 84.08%, 0.95 86.35%, 0.97 88.63%, 1 90.9%, 0.99 93.18%, 0.98 95.45%, 0.99 97.73%, 1 100%)",
        /* prettier-ignore */
        elastic: "linear(0 0%, 0.22 2.1%, 0.86 6.5%, 1.11 8.6%, 1.3 10.7%, 1.35 11.8%, 1.37 12.9%, 1.37 13.7%, 1.36 14.5%, 1.32 16.2%, 1.03 21.8%, 0.94 24%, 0.89 25.9%, 0.88 26.85%, 0.87 27.8%, 0.87 29.25%, 0.88 30.7%, 0.91 32.4%, 0.98 36.4%, 1.01 38.3%, 1.04 40.5%, 1.05 42.7%, 1.05 44.1%, 1.04 45.7%, 1 53.3%, 0.99 55.4%, 0.98 57.5%, 0.99 60.7%, 1 68.1%, 1.01 72.2%, 1 86.7%, 1 100%)",
      },
      typography: ({ theme }: { theme: PluginAPI["theme"] }) => ({
        DEFAULT: {
          css: {
            maxWidth: "unset",
            a: {
              textDecoration: "none",
              borderBottom: "2px solid var(--link-underline-normal)",
              transition: "border-bottom .1s ease-in-out",
              color: "var(--text-content-primary)",
              fontWeight: theme("fontWeight.medium"),
              "&:hover": {
                borderBottom: "2px solid var(--link-underline-hover)",
              },
              "&:active": {
                borderBottom: "2px solid var(--link-underline-active)",
                color: "var(--text-active)",
              },
            },
            strong: {
              color: "var(--text-content-primary)",
              fontWeight: theme("fontWeight.semiBold"),
            },
            "strong > code": {
              color: "var(--text-content-primary)",
            },
            "*:not(pre) > code": {
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            },
            blockquote: {
              fontWeight: "inherit",
              fontStyle: "normal",
            },
            "blockquote p:first-of-type::before": {
              content: "none",
            },
            "blockquote p:last-of-type::after": {
              content: "none",
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
  plugins: [
    typography,
    require("tailwindcss-animated"),
    addShortcutPlugin,

    // import css as plugin is powered by "./cssAsPlugin.cjs"
    require("./src/styles/components.css"),
  ],
};

function addShortcutPlugin({ addUtilities, theme }: PluginAPI) {
  const styles: CSSRuleObject = {
    ".center": {
      "align-items": "center",
      "justify-content": "center",
    },
    ".shape-card": {
      "border-radius": theme("borderRadius.xl"),
      "box-shadow": theme("boxShadow.lg"),
    },
  };
  addUtilities(styles);
}

export default withTV(config);
