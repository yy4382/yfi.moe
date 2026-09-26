import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  list: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "1rem",
    listStyleType: "none",
  },
  link: {
    color: {
      default: "var(--muted-foreground)",
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  active: { color: "var(--accent-foreground)" },
});
