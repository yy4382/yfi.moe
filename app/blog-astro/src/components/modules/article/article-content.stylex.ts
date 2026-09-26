import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  container: {
    position: "relative",
    display: "grid",
    height: "100%",
    gridTemplateColumns: "minmax(0, 1fr)",
  },
  overlay: {
    pointerEvents: "none",
    gridColumnStart: 1,
    gridRowStart: 1,
  },
  content: {
    gridColumnStart: 1,
    gridRowStart: 1,
    paddingInline: "1rem",
    paddingBlock: "4.5rem",
  },
});
