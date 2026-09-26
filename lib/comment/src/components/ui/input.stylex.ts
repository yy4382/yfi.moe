import * as stylex from "@stylexjs/stylex";

const focusRing = "0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)";
const invalidRingLight =
  "0 0 0 3px color-mix(in oklab, var(--destructive) 20%, transparent)";
const invalidRingDark =
  "0 0 0 3px color-mix(in oklab, var(--destructive) 40%, transparent)";

export const styles = stylex.create({
  root: {
    display: "flex",
    width: "100%",
    minWidth: 0,
    height: "2.25rem",
    paddingInline: "0.75rem",
    paddingBlock: "0.25rem",
    borderWidth: "1px",
    borderColor: {
      default: "var(--input)",
      ":focus-visible": "var(--ring)",
      '[aria-invalid="true"]': "var(--destructive)",
    },
    borderRadius: "var(--radius-md)",
    outline: "none",
    backgroundColor: {
      default: "transparent",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--input) 30%, transparent)",
    },
    boxShadow: {
      default: "var(--shadow-xs)",
      ":focus-visible": `${focusRing}, var(--shadow-xs)`,
      '[aria-invalid="true"]': `${invalidRingLight}, var(--shadow-xs)`,
      "@media (prefers-color-scheme: dark)": {
        '[aria-invalid="true"]': `${invalidRingDark}, var(--shadow-xs)`,
      },
    },
    fontSize: {
      default: "var(--text-base)",
      "@media (min-width: 48rem)": "var(--text-sm)",
    },
    lineHeight: {
      default: "var(--text-base-line-height)",
      "@media (min-width: 48rem)": "var(--text-sm-line-height)",
    },
    pointerEvents: { default: null, ":disabled": "none" },
    cursor: { default: null, ":disabled": "not-allowed" },
    opacity: { default: 1, ":disabled": 0.5 },
    transitionProperty: "color, box-shadow",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  fileControl: {
    display: "inline-flex",
    height: "1.75rem",
    borderWidth: 0,
    backgroundColor: "transparent",
    color: "var(--foreground)",
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-sm-line-height)",
  },
});
