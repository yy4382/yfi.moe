import * as stylex from "@stylexjs/stylex";

const enter = stylex.keyframes({
  from: { opacity: 0, transform: "scale3d(.95, .95, .95)" },
});
const enterFromTop = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "translate3d(0, -.5rem, 0) scale3d(.95, .95, .95)",
  },
});
const enterFromRight = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "translate3d(.5rem, 0, 0) scale3d(.95, .95, .95)",
  },
});
const enterFromLeft = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "translate3d(-.5rem, 0, 0) scale3d(.95, .95, .95)",
  },
});
const enterFromBottom = stylex.keyframes({
  from: {
    opacity: 0,
    transform: "translate3d(0, .5rem, 0) scale3d(.95, .95, .95)",
  },
});
const exit = stylex.keyframes({
  to: { opacity: 0, transform: "scale3d(.95, .95, .95)" },
});

const animatedContent = {
  animationName: {
    default: null,
    '[data-state="open"]': enter,
    '[data-state="open"][data-side="bottom"]': enterFromTop,
    '[data-state="open"][data-side="left"]': enterFromRight,
    '[data-state="open"][data-side="right"]': enterFromLeft,
    '[data-state="open"][data-side="top"]': enterFromBottom,
    '[data-state="closed"]': exit,
  },
  animationDuration: "0.15s",
  animationTimingFunction: "ease",
} as const;

const menuItem = {
  position: "relative",
  display: "flex",
  cursor: "default",
  alignItems: "center",
  gap: "0.5rem",
  borderRadius: "var(--radius-sm)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--text-sm-line-height)",
  outline: "none",
  userSelect: "none",
  backgroundColor: { default: null, ":focus": "var(--accent)" },
  color: { default: null, ":focus": "var(--accent-foreground)" },
  pointerEvents: { default: null, "[data-disabled]": "none" },
  opacity: { default: 1, "[data-disabled]": 0.5 },
} as const;

export const styles = stylex.create({
  content: {
    ...animatedContent,
    zIndex: 50,
    minWidth: "8rem",
    maxHeight: "var(--radix-dropdown-menu-content-available-height)",
    padding: "0.25rem",
    overflowX: "hidden",
    overflowY: "auto",
    transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
    borderWidth: "1px",
    borderColor: "var(--border)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    boxShadow: "var(--shadow-md)",
  },
  item: {
    ...menuItem,
    paddingInline: "0.5rem",
    paddingBlock: "0.375rem",
    paddingLeft: { default: "0.5rem", "[data-inset]": "2rem" },
  },
  destructiveItem: {
    color: {
      default: "var(--destructive)",
      ":focus": "var(--destructive)",
    },
    backgroundColor: {
      default: null,
      ":focus": "color-mix(in oklab, var(--destructive) 10%, transparent)",
      "@media (prefers-color-scheme: dark)": {
        ":focus": "color-mix(in oklab, var(--destructive) 20%, transparent)",
      },
    },
  },
  selectionItem: {
    ...menuItem,
    paddingBlock: "0.375rem",
    paddingRight: "0.5rem",
    paddingLeft: "2rem",
  },
  indicator: {
    position: "absolute",
    left: "0.5rem",
    display: "flex",
    width: "0.875rem",
    height: "0.875rem",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  icon: { width: "1rem", height: "1rem", flexShrink: 0, pointerEvents: "none" },
  mutedIcon: { color: "var(--muted-foreground)" },
  destructiveIcon: { color: "var(--destructive)" },
  radioIcon: { width: "0.5rem", height: "0.5rem", fill: "currentColor" },
  label: {
    paddingInline: "0.5rem",
    paddingBlock: "0.375rem",
    paddingLeft: { default: "0.5rem", "[data-inset]": "2rem" },
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-sm-line-height)",
  },
  separator: {
    height: "1px",
    marginInline: "-0.25rem",
    marginBlock: "0.25rem",
    backgroundColor: "var(--border)",
  },
  shortcut: {
    marginLeft: "auto",
    color: "var(--muted-foreground)",
    fontSize: "var(--text-xs)",
    lineHeight: "var(--text-xs-line-height)",
    letterSpacing: "var(--tracking-widest)",
  },
  subTrigger: {
    display: "flex",
    cursor: "default",
    alignItems: "center",
    paddingInline: "0.5rem",
    paddingBlock: "0.375rem",
    paddingLeft: { default: "0.5rem", "[data-inset]": "2rem" },
    borderRadius: "var(--radius-sm)",
    outline: "none",
    backgroundColor: {
      default: null,
      ":focus": "var(--accent)",
      '[data-state="open"]': "var(--accent)",
    },
    color: {
      default: null,
      ":focus": "var(--accent-foreground)",
      '[data-state="open"]': "var(--accent-foreground)",
    },
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
    userSelect: "none",
  },
  subTriggerIcon: { width: "1rem", height: "1rem", marginLeft: "auto" },
  subContent: {
    ...animatedContent,
    zIndex: 50,
    minWidth: "8rem",
    padding: "0.25rem",
    overflow: "hidden",
    transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
    borderWidth: "1px",
    borderColor: "var(--border)",
    borderRadius: "var(--radius-md)",
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    boxShadow: "var(--shadow-lg)",
  },
});
