import * as stylex from "@stylexjs/stylex";

const colorTransition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

export const styles = stylex.create({
  section: { paddingBlock: "2.5rem" },
  content: { maxWidth: "var(--prose-max-width)", marginInline: "auto" },
  heading: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  icon: { width: "1rem", height: "1rem", flexShrink: 0 },
  title: {
    fontSize: "var(--text-base)",
    fontWeight: "var(--font-weight-semibold)",
    lineHeight: "var(--text-base-line-height)",
  },
  list: { margin: 0, padding: 0, listStyle: "none" },
  listItem: { margin: 0, padding: 0 },
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    lineHeight: "var(--leading-relaxed)",
  },
  current: {
    color: "var(--accent-foreground)",
    fontWeight: "var(--font-weight-medium)",
  },
  link: {
    ...colorTransition,
    color: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
    textDecoration: "none",
  },
  index: { flexShrink: 0, color: "var(--color-comment)" },
  currentIndex: { fontWeight: "var(--font-weight-normal)" },
});
