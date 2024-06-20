import type { Config } from "tailwindcss";
import type { CSSRuleObject, PluginAPI } from "tailwindcss/types/config";
import typography from "@tailwindcss/typography";
import { withTV } from "tailwind-variants/transformer";
import "./cssAsPlugin.cjs";

const config: Config = {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: ({ theme }) => ({
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
      typography: ({ theme }: any) => ({
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
