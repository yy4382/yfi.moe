import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  container: { height: "100%", containerType: "inline-size" },
  smallPadding: { paddingInline: "1.5rem", paddingBlock: "1rem" },
  articlePadding: { paddingInline: "1rem", paddingBlock: "4.5rem" },
  postListPadding: {
    paddingInline: {
      default: "1.5rem",
      "@container (36rem <= width < 56rem)": "2.5rem",
      "@container (56rem <= width < 72rem)": "4rem",
      "@container (min-width: 72rem)": "8rem",
    },
  },
});
