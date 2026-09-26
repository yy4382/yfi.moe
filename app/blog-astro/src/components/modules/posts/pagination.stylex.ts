import * as stylex from "@stylexjs/stylex";

const colorTransition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

export const styles = stylex.create({
  root: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: "0.75rem",
  },
  navigation: {
    ...colorTransition,
    display: "flex",
    width: "3rem",
    height: "3rem",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: "3.40282e38px",
  },
  navigationEnabled: {
    color: {
      default: "var(--color-content)",
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
    backgroundColor: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent)" },
    },
  },
  navigationDisabled: {
    color: "color-mix(in oklab, var(--color-content) 50%, transparent)",
    cursor: "not-allowed",
  },
  pages: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "0.5rem",
    backgroundImage: "none",
    color: "var(--color-content)",
    fontWeight: "var(--font-weight-bold)",
  },
  page: {
    ...colorTransition,
    display: "flex",
    width: "2.25rem",
    height: "2.25rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "3.40282e38px",
    color: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
    backgroundColor: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent)" },
    },
  },
  currentPage: {
    display: "flex",
    width: "2.25rem",
    height: "2.25rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "3.40282e38px",
    backgroundColor: "color-mix(in oklab, var(--primary) 90%, transparent)",
    color: "var(--primary-foreground)",
  },
  ellipsis: { width: "1.25rem", height: "1.25rem", marginInline: "0.25rem" },
  navigationIcon: { width: "1.5rem", height: "1.5rem" },
  disabledIcon: { opacity: 0.5 },
});
