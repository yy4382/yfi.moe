import * as stylex from "@stylexjs/stylex";

const loadMore = {
  paddingInline: "0.5rem",
  paddingBlock: "0.25rem",
  borderWidth: "1px",
  borderColor: "var(--border-color-container)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-comment)",
  boxShadow: "var(--shadow-md)",
  scale: {
    default: null,
    "@media (hover: hover)": { ":hover": 1.05 },
    ":active": 0.95,
  },
} as const;

const message = {
  marginTop: "1.5rem",
  padding: "1rem",
  textAlign: "center",
} as const;

const spin = stylex.keyframes({ to: { transform: "rotate(360deg)" } });

export const styles = stylex.create({
  message: { ...message, color: "var(--color-zinc-500)" },
  error: {
    ...message,
    display: "flex",
    alignItems: "center",
    justifyContent: "safe center",
    gap: "0.5rem",
    color: "var(--color-red-500)",
  },
  retry: loadMore,
  root: { marginTop: "2.5rem" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  inline: { display: "flex", alignItems: "center", gap: "0.5rem" },
  commentCount: { color: "var(--color-comment)" },
  loadingIcon: {
    width: "1.5rem",
    height: "1.5rem",
    animationName: spin,
    animationDuration: "1s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
  },
  sort: {
    paddingBlock: "0.25rem",
    color: "var(--accent-foreground)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
    scale: {
      default: null,
      "@media (hover: hover)": { ":hover": 1.05 },
      ":active": 0.95,
    },
  },
  inactiveSort: { color: "var(--muted-foreground)" },
  list: { display: "flex", flexDirection: "column", gap: "1rem" },
  loadMoreContainer: { display: "flex", justifyContent: "center" },
  loadMore,
  footer: {
    marginTop: "1.5rem",
    color: "var(--color-zinc-500)",
    textAlign: "center",
  },
});
