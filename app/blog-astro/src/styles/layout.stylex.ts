import * as stylex from "@stylexjs/stylex";

export const layout = stylex.create({
  spacer: { minHeight: "3rem" },
  container: {
    boxSizing: "border-box",
    borderColor: "var(--border-color-container)",
    width: {
      default: "100vw",
      "@media (40rem <= width < 80rem)": "calc(100vw - 100px)",
      "@media (min-width: 80rem)": "1120px",
    },
    maxWidth: "100vw",
    marginInline: "auto",
    borderInlineWidth: { default: 0, "@media (min-width: 40rem)": "1px" },
  },
  queryContainer: { containerType: "inline-size" },
  gridBackground: {
    backgroundImage:
      "linear-gradient(to right, var(--container-light-border) 1px, transparent 1px), linear-gradient(to bottom, var(--container-light-border) 1px, transparent 1px)",
    backgroundSize: "14px 14px",
    backgroundPosition: "-1px -1px",
    boxSizing: "border-box",
  },
  divider: {
    borderBottomWidth: "1px",
    borderColor: "var(--border-color-container)",
  },
});
