import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  section: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.5rem",
    marginInline: "auto",
    paddingBlock: "6rem",
  },
  title: {
    color: "var(--color-heading)",
    fontSize: "var(--text-3xl)",
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--text-3xl-line-height)",
    textAlign: "center",
  },
  attributes: {
    display: "flex",
    flexDirection: {
      default: "column",
      "@media (min-width: 48rem)": "row",
    },
    alignItems: "center",
    gap: { default: "0.5rem", "@media (min-width: 64rem)": "0.75rem" },
    color: "var(--color-comment)",
    fontSize: "0.8rem",
  },
});
