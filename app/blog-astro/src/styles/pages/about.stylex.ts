import * as stylex from "@stylexjs/stylex";

export const contactMarker = stylex.defineMarker();
export const styles = stylex.create({
  contacts: { marginBlock: "1rem", display: "flex", gap: "1rem" },
  link: { display: "inline-flex", alignItems: "center", gap: "0.5rem" },
  badge: {
    width: "2.125rem",
    height: "2.125rem",
    borderRadius: "calc(infinity * 1px)",
    padding: "0.375rem",
    transitionProperty: "transform, translate, scale, rotate",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "150ms",
    scale: {
      default: null,
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", contactMarker)]: "105%",
      },
      [stylex.when.ancestor(":active", contactMarker)]: "95%",
    },
  },
  icon: { width: "100%", height: "100%", color: "white" },
});
