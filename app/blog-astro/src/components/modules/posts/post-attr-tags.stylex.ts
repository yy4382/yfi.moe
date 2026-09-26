import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: { display: "flex", alignItems: "center", userSelect: "none" },
  icon: { marginRight: "0.25rem", width: "1rem", height: "1rem" },
  item: {
    marginInlineStart: 0,
    marginInlineEnd: { default: "0.125rem", ":last-child": 0 },
  },
  separator: { color: "var(--color-comment)" },
  link: {
    color: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
  },
});
