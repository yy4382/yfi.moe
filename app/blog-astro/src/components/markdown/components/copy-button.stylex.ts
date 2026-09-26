import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  button: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    display: "inline-flex",
    width: "2rem",
    height: "2rem",
    cursor: "pointer",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius)",
    backgroundColor: {
      default: null,
      "@media (hover: hover)": {
        ":hover":
          "color-mix(in oklab, var(--color-violet-300) 20%, transparent)",
      },
    },
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  icon: { width: "1rem", height: "1rem", pointerEvents: "none" },
});
