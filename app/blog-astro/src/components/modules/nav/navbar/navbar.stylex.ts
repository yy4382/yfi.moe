import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  header: {
    position: "fixed",
    top: 0,
    right: 0,
    left: 0,
    zIndex: 30,
    height: "var(--navbar-height)",
    borderBottomWidth: "1px",
    borderColor: "var(--border-color-container)",
    backgroundColor: "color-mix(in oklab, var(--background) 70%, transparent)",
    backdropFilter: "blur(var(--blur-lg))",
  },
  container: {
    display: "flex",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingInline: "1.5rem",
    paddingBlock: "1rem",
    color: "var(--color-content)",
  },
  main: {
    display: "flex",
    minWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    alignItems: "center",
    gap: "1rem",
  },
  flexible: { minWidth: 0, flexGrow: 1, flexShrink: 1 },
  postInfo: { display: "flex", flexDirection: "column" },
  truncate: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  postTags: {
    color: {
      default: "color-mix(in oklab, var(--color-gray-600) 60%, transparent)",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--color-gray-300) 60%, transparent)",
    },
    fontSize: "var(--text-xs)",
    lineHeight: "var(--text-xs-line-height)",
  },
  postTitle: {
    fontSize: "1.1rem",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--leading-normal)",
  },
  siteTitle: {
    fontSize: "var(--text-2xl)",
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--text-2xl-line-height)",
  },
});
