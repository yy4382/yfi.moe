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
        portage: getOklchColors("var(--primary-hue)"),
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
        spring: `linear(${getCssSpring()
          .map(([i, v]) => {
            return `${v.toFixed(6)} ${i}%`;
          })
          .join(", ")})`,
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

// https://evilmartians.com/chronicles/better-dynamic-themes-in-tailwind-with-oklch-color-magic
function getOklchColors(hueInput: string | number) {
  const names = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const lightness = [
    97.78, 93.56, 88.11, 82.67, 74.22, 64.78, 57.33, 46.89, 39.44, 32, 23.78,
  ];
  const chroma = [
    0.0108, 0.0321, 0.0609, 0.0908, 0.1398, 0.1472, 0.1299, 0.1067, 0.0898,
    0.0726, 0.054,
  ];
  const hue = typeof hueInput === "string" ? hueInput : hueInput.toFixed(2);

  const colors = lightness.map((l, i) => {
    return `oklch(${l}% ${chroma[i]} ${hue} / <alpha-value>)`;
  });

  return Object.fromEntries(names.map((name, i) => [name, colors[i]]));
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
