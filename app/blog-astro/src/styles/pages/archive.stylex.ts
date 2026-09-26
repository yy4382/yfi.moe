import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  hero: {
    display: "flex",
    height: { default: "13rem", "@media (min-width: 64rem)": "24rem" },
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingInline: "1rem",
  },
  heroContent: {
    marginInline: "auto",
    width: "100%",
    maxWidth: "var(--prose-max-width)",
  },
  title: {
    fontSize: { default: "3rem", "@container (min-width: 48rem)": "3.75rem" },
    lineHeight: 1,
    fontWeight: 700,
    color: "var(--color-heading)",
  },
  description: {
    marginTop: "1rem",
    marginLeft: "0.25rem",
    fontSize: "1.125rem",
    lineHeight: "1.75rem",
    color: "var(--color-content)",
  },
  section: { paddingInline: "1rem", paddingBlock: "4.5rem" },
  archive: {
    marginInline: "auto",
    display: "flex",
    maxWidth: "var(--prose-max-width)",
    flexDirection: "column",
    gap: "2rem",
  },
  group: { display: "flex", flexDirection: "column", gap: "1rem" },
  year: { fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 700 },
  count: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    fontWeight: 400,
    color: "var(--color-comment)",
  },
  list: {
    listStyleType: "none",
    fontSize: { default: "0.875rem", "@media (min-width: 64rem)": "1rem" },
    lineHeight: { default: "1.25rem", "@media (min-width: 64rem)": "1.5rem" },
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  entry: { display: "flex", minWidth: 0, flexShrink: 1, alignItems: "center" },
  date: {
    display: "inline-block",
    width: { default: "3rem", "@media (min-width: 64rem)": "4rem" },
    paddingRight: "0.5rem",
    fontWeight: 300,
    fontVariantNumeric: "tabular-nums",
  },
  link: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    paddingBlock: {
      default: "0.125rem",
      "@media (pointer: coarse)": "0.25rem",
    },
    lineHeight: "1.5rem",
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
    color: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
  },
});
