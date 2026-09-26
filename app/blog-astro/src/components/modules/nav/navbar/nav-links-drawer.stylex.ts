import * as stylex from "@stylexjs/stylex";

const colorTransition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

export const styles = stylex.create({
  trigger: {
    display: "flex",
    width: "2rem",
    height: "2rem",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1px",
    borderColor: "var(--border-color-container)",
    borderRadius: "var(--radius-lg)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    backgroundColor: "color-mix(in oklab, var(--color-black) 40%, transparent)",
  },
  content: {
    position: "fixed",
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 60,
    display: "flex",
    height: "fit-content",
    marginTop: "6rem",
    flexDirection: "column",
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    outline: "none",
    backgroundColor: "var(--background)",
  },
  panel: {
    flex: 1,
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    paddingInline: "2rem",
    paddingBlock: "1rem",
  },
  handle: {
    width: "3rem",
    height: "0.375rem",
    marginInline: "auto",
    marginBottom: "2rem",
    flexShrink: 0,
    borderRadius: "3.40282e38px",
    backgroundColor: "var(--color-gray-300)",
  },
  body: {
    maxWidth: "var(--container-md)",
    marginInline: "auto",
    marginBottom: "1.5rem",
  },
  title: {
    marginBottom: "1rem",
    color: "var(--color-heading)",
    fontSize: "var(--text-lg)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-lg-line-height)",
  },
  list: { display: "flex", flexDirection: "column" },
  item: { display: "flex", alignItems: "center", justifyContent: "flex-start" },
  link: {
    ...colorTransition,
    paddingBlock: "0.375rem",
    color: {
      default: "var(--muted-foreground)",
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
  },
  active: { color: "var(--accent-foreground)" },
});
