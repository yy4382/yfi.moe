import * as stylex from "@stylexjs/stylex";

const focusRing = "0 0 0 3px color-mix(in oklab, var(--ring) 50%, transparent)";

export const styles = stylex.create({
  root: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  list: {
    display: "inline-flex",
    width: "fit-content",
    height: "2.25rem",
    alignItems: "center",
    justifyContent: "center",
    padding: "3px",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "var(--muted)",
    color: "var(--muted-foreground)",
  },
  trigger: {
    display: "inline-flex",
    height: "calc(100% - 1px)",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: "0.375rem",
    paddingInline: "0.5rem",
    paddingBlock: "0.25rem",
    borderWidth: "1px",
    borderColor: {
      default: "transparent",
      ":focus-visible": "var(--ring)",
      '[data-state="active"]': {
        default: "transparent",
        "@media (prefers-color-scheme: dark)": "var(--input)",
      },
    },
    borderRadius: "var(--radius-md)",
    outlineColor: { default: null, ":focus-visible": "var(--ring)" },
    outlineStyle: { default: null, ":focus-visible": "solid" },
    outlineWidth: { default: null, ":focus-visible": "1px" },
    backgroundColor: {
      default: "transparent",
      '[data-state="active"]': {
        default: "var(--background)",
        "@media (prefers-color-scheme: dark)":
          "color-mix(in oklab, var(--input) 30%, transparent)",
      },
    },
    color: {
      default: "var(--foreground)",
      "@media (prefers-color-scheme: dark)": "var(--muted-foreground)",
      '[data-state="active"]': {
        default: "var(--foreground)",
        "@media (prefers-color-scheme: dark)": "var(--foreground)",
      },
    },
    boxShadow: {
      default: "none",
      ":focus-visible": focusRing,
      '[data-state="active"]': "var(--shadow-sm)",
      '[data-state="active"]:focus-visible': `${focusRing}, var(--shadow-sm)`,
    },
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-sm-line-height)",
    whiteSpace: "nowrap",
    pointerEvents: { default: null, ":disabled": "none" },
    opacity: { default: 1, ":disabled": 0.5 },
    transitionProperty: "color, box-shadow",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  content: { flex: 1, outline: "none" },
  icon: { width: "1rem", height: "1rem", flexShrink: 0, pointerEvents: "none" },
});
