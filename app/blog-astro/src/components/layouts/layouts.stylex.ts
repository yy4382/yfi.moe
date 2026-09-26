import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  body: {
    margin: 0,
    padding: 0,
    overflowX: "hidden",
    backgroundColor: "var(--background)",
    backgroundAttachment: "fixed",
    color: "var(--color-content)",
  },
  navigationSurface: {
    margin: 0,
    padding: 0,
    backgroundColor: "var(--background)",
    backgroundAttachment: "fixed",
    color: "var(--color-content)",
  },
  navigationGrid: {
    display: "grid",
    minHeight: "100lvh",
    gridTemplateRows: "var(--navbar-height) auto 1fr auto",
  },
  content: { width: "100%" },
  spacer: { height: "100%", minHeight: "3rem" },
  fullHeight: { height: "100%" },
  articlePadding: { paddingInline: "1rem", paddingBlock: "4.5rem" },
  prose: { marginInline: "auto", overflowWrap: "break-word" },
});
