import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    pointerEvents: "none",
    position: "absolute",
    insetBlock: 0,
    left: 0,
    zIndex: 10,
    display: { default: "none", "@media (min-width: 40rem)": "block" },
  },
  track: {
    position: "sticky",
    top: "var(--navbar-height)",
    height: "calc(100vh - var(--navbar-height))",
  },
  indicator: {
    width: "1.25rem",
    borderTopRightRadius: "calc(infinity * 1px)",
    borderBottomRightRadius: "calc(infinity * 1px)",
    backgroundColor: "var(--container-border)",
  },
});
