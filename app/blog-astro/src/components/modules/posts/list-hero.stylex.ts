import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  section: {
    display: "flex",
    height: { default: "13rem", "@media (min-width: 64rem)": "24rem" },
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  title: {
    color: "var(--color-heading)",
    fontSize: {
      default: "var(--text-5xl)",
      "@container (min-width: 48rem)": "var(--text-6xl)",
    },
    fontWeight: "var(--font-weight-bold)",
    lineHeight: {
      default: 1,
      "@container (min-width: 48rem)": 1,
    },
  },
  description: {
    marginTop: "1rem",
    marginLeft: "0.25rem",
    color: "var(--color-content)",
    fontSize: "var(--text-lg)",
    lineHeight: "var(--text-lg-line-height)",
  },
});
