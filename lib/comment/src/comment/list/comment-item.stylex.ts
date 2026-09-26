import * as stylex from "@stylexjs/stylex";

const interactiveChip = {
  display: "inline-flex",
  height: "1.75rem",
  flexShrink: 0,
  alignItems: "center",
  gap: "0.25rem",
  paddingInline: "0.5rem",
  paddingBlock: "0.125rem",
  borderWidth: "1px",
  borderRadius: "var(--radius-md)",
  color: "var(--color-comment)",
  fontSize: "var(--text-sm)",
  lineHeight: "var(--text-sm-line-height)",
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
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
} as const;

export const styles = stylex.create({
  row: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.75rem",
    paddingBlock: "0.5rem",
    borderColor: "var(--color-zinc-100)",
  },
  avatarContainer: { flexShrink: 0 },
  avatar: {
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "3.40282e38px",
    objectFit: "cover",
  },
  content: {
    display: "flex",
    minWidth: 0,
    flex: 1,
    flexDirection: "column",
    marginTop: "0.125rem",
    marginBottom: "0.25rem",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.25rem",
  },
  displayName: {
    color: "color-mix(in oklab, var(--color-content) 80%, transparent)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  badge: {
    paddingInline: "0.375rem",
    paddingBlock: "0.125rem",
    borderRadius: "var(--radius-sm)",
    fontSize: "var(--text-xs)",
    lineHeight: "var(--text-xs-line-height)",
  },
  mineBadge: {
    color: {
      default: "var(--color-blue-600)",
      "@media (prefers-color-scheme: dark)": "var(--color-blue-100)",
    },
    backgroundColor: {
      default: "var(--color-blue-100)",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--color-blue-800) 60%, transparent)",
    },
  },
  spamBadge: {
    color: {
      default: "var(--color-red-600)",
      "@media (prefers-color-scheme: dark)": "var(--color-red-100)",
    },
    backgroundColor: {
      default: "var(--color-red-100)",
      "@media (prefers-color-scheme: dark)":
        "color-mix(in oklab, var(--color-red-800) 60%, transparent)",
    },
  },
  timestamp: {
    color: "var(--color-zinc-500)",
    fontSize: "var(--text-xs)",
    lineHeight: "var(--text-xs-line-height)",
  },
  replyTo: {
    paddingBlock: "0.25rem",
    color: "var(--color-zinc-500)",
    fontSize: "var(--text-xs)",
    lineHeight: "var(--text-xs-line-height)",
  },
  muted: { color: "var(--color-zinc-500)" },
  prose: { overflowWrap: "break-word", color: "var(--color-content)" },
  actions: { display: "flex", alignItems: "center", marginTop: "0.25rem" },
  actionsWithReactions: { gap: "1rem" },
  actionsWithoutReactions: { gap: "0.5rem" },
  replyButton: interactiveChip,
  replyForm: { marginLeft: "2rem", padding: "0.125rem", paddingTop: "0.5rem" },
});
