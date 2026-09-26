import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  positioner: { zIndex: 50 },
  popup: {
    zIndex: 50,
    width: "fit-content",
    transformOrigin: "var(--transform-origin)",
    borderWidth: "1px",
    backgroundColor: {
      default: "var(--color-zinc-100)",
      "@media (prefers-color-scheme: dark)": "var(--color-zinc-800)",
    },
    paddingInline: "0.75rem",
    paddingBlock: "0.375rem",
    color: "var(--color-comment)",
    fontSize: "var(--text-xs)",
    fontVariantNumeric: "tabular-nums",
    lineHeight: "var(--text-xs-line-height)",
    textWrap: "balance",
    willChange: "transform",
  },
  details: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  date: { display: "flex", alignItems: "center", userSelect: "none" },
  icon: {
    width: "1rem",
    height: "1rem",
    marginRight: "0.25rem",
  },
});
