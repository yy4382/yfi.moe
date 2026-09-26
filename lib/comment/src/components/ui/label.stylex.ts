import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  root: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: 1,
    userSelect: "none",
  },
  disabled: { pointerEvents: "none", cursor: "not-allowed", opacity: 0.5 },
});
