import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: { display: "flex", flexDirection: "column" },
  children: { marginLeft: "1.5rem", paddingLeft: "1rem" },
  loadMoreContainer: { display: "flex", justifyContent: "center" },
  loadMore: {
    paddingInline: "0.5rem",
    paddingBlock: "0.25rem",
    borderWidth: "1px",
    borderColor: "var(--border-color-container)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-comment)",
    boxShadow: "var(--shadow-md)",
    scale: {
      default: null,
      "@media (hover: hover)": { ":hover": 1.05 },
      ":active": 0.95,
    },
  },
});
