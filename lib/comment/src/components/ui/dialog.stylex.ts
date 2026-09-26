import * as stylex from "@stylexjs/stylex";

const fadeIn = stylex.keyframes({ from: { opacity: 0 } });
const fadeOut = stylex.keyframes({ to: { opacity: 0 } });
const contentIn = stylex.keyframes({
  from: { opacity: 0, transform: "scale3d(.95, .95, .95)" },
});
const contentOut = stylex.keyframes({
  to: { opacity: 0, transform: "scale3d(.95, .95, .95)" },
});

export const styles = stylex.create({
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "rgb(0 0 0 / 50%)",
    animationName: {
      default: null,
      '[data-state="open"]': fadeIn,
      '[data-state="closed"]': fadeOut,
    },
    animationDuration: "0.15s",
    animationTimingFunction: "ease",
  },
  content: {
    position: "fixed",
    top: "50%",
    left: "50%",
    zIndex: 50,
    display: "grid",
    width: "calc(100% - 2rem)",
    maxWidth: {
      default: null,
      "@media (min-width: 40rem)": "32rem",
    },
    translate: "-50% -50%",
    gap: "1rem",
    padding: "1.5rem",
    borderWidth: "1px",
    borderColor: "var(--border)",
    borderRadius: "var(--radius-lg)",
    backgroundColor: "var(--background)",
    boxShadow: "var(--shadow-lg)",
    animationName: {
      default: null,
      '[data-state="open"]': contentIn,
      '[data-state="closed"]': contentOut,
    },
    animationDuration: "0.2s",
    animationTimingFunction: "ease",
  },
  close: {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    borderRadius: "var(--radius-xs)",
    outline: "none",
    backgroundColor: {
      default: "transparent",
      '[data-state="open"]': "var(--accent)",
    },
    color: {
      default: null,
      '[data-state="open"]': "var(--muted-foreground)",
    },
    boxShadow: {
      default: "none",
      ":focus": "0 0 0 2px var(--background), 0 0 0 4px var(--ring)",
    },
    opacity: {
      default: 0.7,
      "@media (hover: hover)": { ":hover": 1 },
    },
    pointerEvents: { default: null, ":disabled": "none" },
    transitionProperty: "opacity",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  closeIcon: {
    width: "1rem",
    height: "1rem",
    flexShrink: 0,
    pointerEvents: "none",
  },
  visuallyHidden: {
    position: "absolute",
    width: "1px",
    height: "1px",
    margin: "-1px",
    padding: 0,
    overflow: "hidden",
    borderWidth: 0,
    clipPath: "inset(50%)",
    whiteSpace: "nowrap",
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    textAlign: { default: "center", "@media (min-width: 40rem)": "left" },
  },
  footer: {
    display: "flex",
    flexDirection: {
      default: "column-reverse",
      "@media (min-width: 40rem)": "row",
    },
    justifyContent: {
      default: null,
      "@media (min-width: 40rem)": "flex-end",
    },
    gap: "0.5rem",
  },
  title: {
    fontSize: "var(--text-lg)",
    fontWeight: "var(--font-weight-semibold)",
    lineHeight: 1,
  },
  description: {
    color: "var(--muted-foreground)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
});
