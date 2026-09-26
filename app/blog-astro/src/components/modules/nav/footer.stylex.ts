import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: {
      default: "column-reverse",
      "@media (min-width: 48rem)": "row",
    },
    alignItems: "center",
    justifyContent: "space-between",
    gap: "1.5rem",
    paddingInline: "1.5rem",
    paddingBlock: "1rem",
  },
  brand: {
    display: "flex",
    gap: "1rem",
    fontSize: "var(--text-2xl)",
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--text-2xl-line-height)",
  },
  logo: { width: "2rem", height: "2rem", borderRadius: "var(--radius-lg)" },
  content: {
    display: "flex",
    width: { default: "100%", "@media (min-width: 48rem)": "unset" },
    flexGrow: 1,
    flexShrink: 1,
    flexDirection: "column",
    alignItems: {
      default: "flex-start",
      "@media (min-width: 48rem)": "flex-end",
    },
    gap: { default: "2rem", "@media (min-width: 48rem)": "0.5rem" },
  },
  groups: {
    display: "flex",
    flexDirection: { default: "column", "@media (min-width: 64rem)": "row" },
    alignItems: {
      default: "flex-start",
      "@media (min-width: 64rem)": "flex-end",
    },
    alignSelf: { default: "center", "@media (min-width: 48rem)": "flex-end" },
    columnGap: "1.5rem",
    rowGap: "0.25rem",
    color: "var(--color-comment)",
  },
  groupTitle: {
    display: "inline-flex",
    alignItems: "center",
    color: "var(--color-content)",
    fontWeight: "var(--font-weight-medium)",
  },
  icon: { width: "1rem", height: "1rem" },
  links: { display: "inline-flex", gap: "0.5rem" },
  legal: {
    display: "flex",
    flexDirection: "column",
    alignItems: { default: "center", "@media (min-width: 48rem)": "flex-end" },
    alignSelf: { default: "center", "@media (min-width: 48rem)": "flex-end" },
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  legalRow: {
    display: "inline-flex",
    alignItems: "center",
    columnGap: "0.25rem",
    color: "var(--color-comment)",
  },
  inlineGroup: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.125rem",
  },
  mutedSeparator: { opacity: 0.7 },
  mutedText: { color: "var(--color-comment)" },
  underline: { textDecorationLine: "underline" },
});
