import * as stylex from "@stylexjs/stylex";

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

export const styles = stylex.create({
  dialog: {
    maxWidth: {
      default: null,
      "@media (min-width: 40rem)": "var(--container-md)",
    },
  },
  title: { display: "flex", alignItems: "center", gap: "0.5rem" },
  titleIcon: { width: "1.25rem", height: "1.25rem" },
  fullWidth: { width: "100%" },
  tabsList: {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  },
  tabsContent: { marginTop: "1rem" },
  stack4: { display: "flex", flexDirection: "column", gap: "1rem" },
  stack2: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  loading: { display: "flex", alignItems: "center", gap: "0.5rem" },
  spinner: {
    width: "1rem",
    height: "1rem",
    borderWidth: "2px",
    borderColor: "var(--primary)",
    borderTopColor: "transparent",
    borderRadius: "3.40282e38px",
    animationName: spin,
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  sent: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    textAlign: "center",
  },
  success: {
    padding: "1rem",
    borderRadius: "var(--radius)",
    backgroundColor: {
      default: "var(--color-green-50)",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--color-green-900) 20%, transparent)",
    },
  },
  successRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: { flexShrink: 0 },
  successIcon: {
    width: "1.25rem",
    height: "1.25rem",
    color: "var(--color-green-400)",
  },
  successCopy: { marginLeft: "0.75rem" },
  successTitle: {
    color: {
      default: "var(--color-green-800)",
      "@media (prefers-color-scheme: dark)": "var(--color-green-200)",
    },
    fontSize: "var(--text-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-sm-line-height)",
  },
  successDescription: {
    color: {
      default: "var(--color-green-700)",
      "@media (prefers-color-scheme: dark)": "var(--color-green-300)",
    },
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  note: {
    color: "var(--muted-foreground)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
});
