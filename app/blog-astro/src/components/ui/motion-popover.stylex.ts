import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  backdrop: {
    position: "fixed",
    inset: 0,
    isolation: "isolate",
    zIndex: 50,
    backgroundColor: {
      default: "rgb(0 0 0 / 0.1)",
      "@media (prefers-color-scheme: dark)": "rgb(0 0 0 / 0.5)",
    },
    transitionProperty: "opacity",
    transitionDuration: "150ms",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: {
      default: null,
      ":is([data-ending-style])": 0,
      ":is([data-starting-style])": 0,
    },
  },
});
