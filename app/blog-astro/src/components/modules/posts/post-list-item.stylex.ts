import * as stylex from "@stylexjs/stylex";

const colorTransition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

export const styles = stylex.create({
  root: { height: "100%" },
  lastItem: { borderBottomWidth: 0 },
  content: {
    paddingInline: {
      default: "1.5rem",
      "@container (36rem <= width < 56rem)": "2.5rem",
      "@container (56rem <= width < 72rem)": "4rem",
      "@container (min-width: 72rem)": "8rem",
    },
    paddingBlock: {
      default: "2rem",
      "@container (min-width: 56rem)": "3rem",
    },
  },
  title: {
    ...colorTransition,
    marginBottom: "0.5rem",
    fontSize: {
      default: "var(--text-lg)",
      "@container (36rem <= width < 56rem)": "var(--text-xl)",
      "@container (min-width: 56rem)": "var(--text-3xl)",
    },
    fontWeight: "var(--font-weight-bold)",
    lineHeight: {
      default: "var(--text-lg-line-height)",
      "@container (36rem <= width < 56rem)": "var(--text-xl-line-height)",
      "@container (min-width: 56rem)": "var(--text-3xl-line-height)",
    },
    color: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
  },
  attributes: {
    display: "flex",
    flexWrap: "wrap",
    gap: { default: "0.5rem", "@media (min-width: 64rem)": "0.75rem" },
    color: "var(--color-comment)",
    fontSize: "0.8rem",
  },
  excerpt: {
    display: { default: "none", "@container (min-width: 56rem)": "block" },
    maxWidth: "90ch",
    marginTop: "1rem",
  },
});
