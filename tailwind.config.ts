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
        portage: Object.fromEntries(
          names.map((name) => [
            name,
            `oklch(var(--pri-${name}) / <alpha-value>)`,
          ]),
        ),
        primary: {
          DEFAULT: "oklch(var(--pri-400) / <alpha-value>)",
        },
        card: {
          DEFAULT: "oklch(var(--bg-card) / <alpha-value>)",
        },
        content: {
          50: "var(--content-50)",
          100: "var(--content-100)",
          200: "var(--content-200)",
          primary: "oklch(var(--content-primary) / <alpha-value>)",
        },
      }),
      backgroundColor: {
        popover: "var(--bg-popover)",
      },
      textColor: ({ theme }) => ({
        content: theme("colors.content.100"),
        primary: {
          DEFAULT: theme("colors.content.primary / 1"),
          ui: theme("colors.primary.DEFAULT / 1"),
        },
        heading: theme("colors.content.200"),
        comment: theme("colors.content.50"),
      }),
      borderRadius: {
        card: "0.75rem", // rounded-xl
      },
      transitionTimingFunction: {
        spring: `linear(${getCssSpring()
          .map(([i, v]) => {
            return `${v.toFixed(6)} ${i}%`;
          })
          .join(", ")})`,
      },
      animation: {
        onload: "fadeInUpSpring 1s linear forwards",
        onload_small: "fadeInUpSpringSmall 0.5s linear forwards",
      },
      keyframes: {
        fadeInUpSpring: Object.fromEntries(
          getCssSpring().map(([i, v]) => {
            return [
              `${i}%`,
              {
                transform: `translateY(${(2 - 2 * v).toFixed(6)}rem)`,
                opacity: v.toFixed(2),
              },
            ];
          }),
        ),
        fadeInUpSpringSmall: Object.fromEntries(
          getCssSpring().map(([i, v]) => {
            return [
              `${i}%`,
              {
                transform: `translateY(${(1 - 1 * v).toFixed(6)}rem)`,
                opacity: v.toFixed(2),
              },
            ];
          }),
        ),
      },
      typography: ({ theme }: { theme: PluginAPI["theme"] }) => ({
        DEFAULT: {
          css: {
            maxWidth: "unset",
            a: {
              textDecoration: "none",
              borderBottom: "2px solid var(--link-underline-normal)",
              transition: "all .15s ease-in-out",
              fontWeight: theme("fontWeight.medium"),
              "&:hover": {
                color: theme("colors.content.primary / 1"),
                borderBottom: "2px solid var(--link-underline-hover)",
              },
              "&:active": {
                borderBottom: "2px solid var(--link-underline-active)",
              },
            },
            strong: {
              color: theme("colors.content.primary / 1"),
              fontWeight: theme("fontWeight.semiBold"),
            },
            "strong > code": {
              color: theme("colors.content.primary / 1"),
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
    colorVariablePlugin,

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
      "border-radius": theme("borderRadius.card"),
      "box-shadow": theme("boxShadow.lg"),
    },
  };
  addUtilities(styles);
}

// https://evilmartians.com/chronicles/better-dynamic-themes-in-tailwind-with-oklch-color-magic
const names = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
// prettier-ignore
const lightness = [97.78, 93.56, 88.11, 82.67, 74.22, 64.78, 57.33, 46.89, 39.44, 32, 23.78];
// prettier-ignore
const chroma = [0.0108, 0.0321, 0.0609, 0.0908, 0.1398, 0.1472, 0.1299, 0.1067, 0.0898, 0.0726, 0.054];

function colorVariablePlugin({ addBase }: PluginAPI) {
  const hue = "var(--primary-hue)";
  const styles: CSSRuleObject = {
    ":root": Object.fromEntries(
      names.map((name, i) => {
        return [`--pri-${name}`, `${lightness[i]}% ${chroma[i]} ${hue}`];
      }),
    ),
  };
  addBase(styles);
}

// https://medium.com/@dtinth/spring-animation-in-css-2039de6e1a03
function getCssSpring(interval = 2) {
  const spring = (t: number) =>
    -0.5 *
    2.71828 ** (-6 * t) *
    (-2 * 2.71828 ** (6 * t) + Math.sin(12 * t) + 2 * Math.cos(12 * t));
  const percentage = Array.from(
    { length: 102 / interval },
    (_, i) => i * interval,
  ).filter((i) => i <= 100);
  const values = percentage.map((i) => spring(i / 100));
  return percentage.map((i, index) => [i, values[index]]);
}

export default withTV(config);
