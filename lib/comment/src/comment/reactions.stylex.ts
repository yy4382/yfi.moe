import * as stylex from "@stylexjs/stylex";

const transition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

const focusRing = {
  outline: "none",
  boxShadow: {
    default: null,
    ":focus-visible": "0 0 0 2px var(--color-neutral-400)",
  },
} as const;

export const styles = stylex.create({
  root: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "0.25rem",
  },
  chip: {
    ...transition,
    display: "flex",
    height: "1.75rem",
    alignItems: "center",
    gap: "0.25rem",
    paddingInline: "0.5rem",
    paddingBlock: "0.125rem",
    borderWidth: "1px",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
    outline: "none",
    boxShadow: {
      default: null,
      ":focus-visible": "0 0 0 2px var(--color-blue-500)",
    },
  },
  activeChip: {
    borderColor: {
      default: "var(--color-blue-200)",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--color-blue-200) 50%, transparent)",
    },
    backgroundColor: {
      default: "var(--color-blue-100)",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--color-blue-100) 30%, transparent)",
    },
    color: {
      default: null,
      "@media (prefers-color-scheme: dark)": "var(--color-blue-300)",
    },
  },
  inactiveChip: {
    borderColor: {
      default: "var(--color-zinc-200)",
      "@media (prefers-color-scheme: dark)": "var(--color-zinc-700)",
    },
    backgroundColor: {
      default: "var(--color-zinc-100)",
      "@media (hover: hover) and (prefers-color-scheme: light)": {
        ":hover": "var(--color-zinc-100)",
      },
      "@media (prefers-color-scheme: dark)": {
        default: "var(--color-zinc-800)",
        "@media (hover: hover)": { ":hover": "var(--color-zinc-700)" },
      },
    },
    color: {
      default: "var(--color-zinc-700)",
      "@media (prefers-color-scheme: dark)": "var(--color-zinc-300)",
    },
  },
  emoji: { fontSize: "var(--text-base)", lineHeight: 1 },
  count: {
    fontSize: "var(--text-xs)",
    fontVariantNumeric: "tabular-nums",
    lineHeight: 1,
  },
  addButton: {
    ...transition,
    display: "inline-flex",
    height: "1.75rem",
    alignItems: "center",
    gap: "0.125rem",
    paddingInline: "0.5rem",
    paddingBlock: "0.125rem",
    borderWidth: "1px",
    borderRadius: "var(--radius-md)",
    color: "var(--color-comment)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
    borderColor: {
      default: "var(--color-zinc-200)",
      "@media (prefers-color-scheme: dark)": "var(--color-zinc-700)",
    },
    backgroundColor: {
      default: "var(--color-zinc-50)",
      "@media (hover: hover) and (prefers-color-scheme: light)": {
        ":hover": "var(--color-zinc-100)",
      },
      "@media (prefers-color-scheme: dark)": {
        default: "var(--color-zinc-900)",
        "@media (hover: hover)": { ":hover": "var(--color-zinc-800)" },
      },
    },
  },
  busy: { pointerEvents: "none", opacity: 0.6 },
  emojiIcon: { width: "1.25rem", height: "1.25rem" },
  addIcon: { width: "1rem", height: "1rem" },
  popover: {
    zIndex: 50,
    minWidth: "8rem",
    maxHeight: "var(--radix-dropdown-menu-content-available-height)",
    transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
    overflowX: "hidden",
    overflowY: "auto",
    padding: "0.25rem",
    borderWidth: "1px",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    boxShadow: "var(--shadow-md)",
  },
  picker: {
    isolation: "isolate",
    display: "flex",
    width: "fit-content",
    height: "368px",
    flexDirection: "column",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--popover)",
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.25rem",
    paddingInline: "0.5rem",
    paddingTop: "0.5rem",
  },
  quickAction: {
    ...transition,
    ...focusRing,
    display: "flex",
    width: "2rem",
    height: "2rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-lg)",
    lineHeight: "var(--text-lg-line-height)",
    backgroundColor: {
      default: null,
      "@media (hover: hover) and (prefers-color-scheme: light)": {
        ":hover": "var(--color-neutral-200)",
      },
      "@media (prefers-color-scheme: dark) and (hover: hover)": {
        ":hover": "var(--color-neutral-700)",
      },
    },
  },
  visuallyHidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  search: {
    ...focusRing,
    zIndex: 10,
    marginInline: "0.5rem",
    marginTop: "0.5rem",
    appearance: "none",
    paddingInline: "0.625rem",
    paddingBlock: "0.5rem",
    borderRadius: "var(--radius-md)",
    backgroundColor: {
      default: "var(--color-neutral-200)",
      "@media (prefers-color-scheme: dark)": "var(--color-neutral-700)",
    },
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  viewport: { position: "relative", flex: 1, outline: "none" },
  pickerState: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: {
      default: "var(--color-neutral-400)",
      "@media (prefers-color-scheme: dark)": "var(--color-neutral-500)",
    },
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  list: { width: "100%", paddingBottom: "0.375rem", userSelect: "none" },
  category: {
    paddingInline: "0.75rem",
    paddingTop: "0.75rem",
    paddingBottom: "0.375rem",
    backgroundColor: "var(--popover)",
    color: {
      default: "var(--color-neutral-600)",
      "@media (prefers-color-scheme: dark)": "var(--color-neutral-400)",
    },
    fontSize: "var(--text-xs)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-xs-line-height)",
  },
  row: { marginBlock: "0.375rem", paddingInline: "0.375rem" },
  pickerEmoji: {
    display: "flex",
    width: "2rem",
    height: "2rem",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    fontSize: "var(--text-lg)",
    lineHeight: "var(--text-lg-line-height)",
    backgroundColor: {
      default: null,
      ":is([data-active])": "var(--color-neutral-200)",
      "@media (prefers-color-scheme: dark)": {
        ":is([data-active])": "var(--color-neutral-700)",
      },
    },
  },
});
