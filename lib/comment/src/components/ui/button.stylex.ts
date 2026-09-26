import * as stylex from "@stylexjs/stylex";

const focusRing = "0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)";
const invalidRingLight =
  "0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent)";
const invalidRingDark =
  "0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent)";

export const styles = stylex.create({
  root: {
    display: "inline-flex",
    width: "auto",
    height: "2.25rem",
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    paddingInline: { default: "1rem", ":has(> svg)": "0.75rem" },
    paddingBlock: "0.5rem",
    borderColor: {
      default: null,
      ":focus-visible": "var(--ring)",
      '[aria-invalid="true"]': "var(--destructive)",
    },
    borderRadius: "var(--radius-md)",
    outline: "none",
    backgroundColor: {
      default: "var(--primary)",
      "@media (hover: hover)": {
        ":hover": "color-mix(in oklab, var(--primary) 90%, transparent)",
      },
    },
    color: "var(--primary-foreground)",
    boxShadow: {
      default: "var(--shadow-xs)",
      ":focus-visible": `${focusRing}, var(--shadow-xs)`,
      '[aria-invalid="true"]': `${invalidRingLight}, var(--shadow-xs)`,
      "@media (prefers-color-scheme: dark)": {
        '[aria-invalid="true"]': `${invalidRingDark}, var(--shadow-xs)`,
      },
    },
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-sm-line-height)",
    whiteSpace: "nowrap",
    pointerEvents: { default: null, ":disabled": "none" },
    opacity: { default: 1, ":disabled": 0.5 },
    transitionProperty: "all",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  icon: { width: "1rem", height: "1rem", flexShrink: 0, pointerEvents: "none" },
});
