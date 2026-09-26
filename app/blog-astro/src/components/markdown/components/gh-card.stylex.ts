import * as stylex from "@stylexjs/stylex";

const pulse = stylex.keyframes({
  "0%, 100%": { opacity: 1 },
  "50%": { opacity: 0.5 },
});

const transitionAll = {
  transitionProperty: "all",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

const cardSurface = {
  borderColor: {
    default: "var(--color-zinc-200)",
    "@media (prefers-color-scheme: dark)": "var(--color-zinc-800)",
  },
  backgroundColor: {
    default: "var(--color-white)",
    "@media (prefers-color-scheme: dark)": "var(--color-zinc-950)",
  },
} as const;

const adaptiveCardSurface = {
  borderColor: {
    default: "var(--color-zinc-200)",
    "@media (hover: hover) and (prefers-color-scheme: light)": {
      ":hover": "var(--color-zinc-400)",
    },
    "@media (prefers-color-scheme: dark)": {
      default: "var(--color-zinc-800)",
      "@media (hover: hover)": { ":hover": "var(--color-zinc-600)" },
    },
  },
  backgroundColor: {
    default: "var(--color-white)",
    "@media (prefers-color-scheme: dark)": "var(--color-zinc-950)",
  },
} as const;

export const cardMarker = stylex.defineMarker();

export const styles = stylex.create({
  centered: { display: "flex", width: "100%", justifyContent: "center" },
  invalid: { color: "var(--color-red-500)" },
  skeleton: {
    ...cardSurface,
    position: "relative",
    display: "flex",
    width: "25rem",
    maxWidth: "var(--container-sm)",
    height: "9rem",
    padding: "1rem",
    borderWidth: "1px",
    borderRadius: "var(--radius)",
    animationName: pulse,
    animationDuration: "2s",
    animationTimingFunction: "cubic-bezier(0.4, 0, 0.6, 1)",
    animationIterationCount: "infinite",
  },
  skeletonBody: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  skeletonLine: {
    height: "1rem",
    borderRadius: "0.25rem",
    backgroundColor: {
      default: "var(--color-zinc-300)",
      "@media (prefers-color-scheme: dark)": "var(--color-zinc-700)",
    },
  },
  skeletonTitle: { width: "75%", height: "1.25rem", marginBottom: "0.75rem" },
  skeletonDescription: { width: "100%", marginBottom: "0.75rem" },
  skeletonDescriptionShort: { width: "50%" },
  skeletonMeta: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    paddingTop: "0.5rem",
  },
  skeletonLanguage: { width: "4rem" },
  skeletonStars: { width: "3rem" },
  loadingLink: { display: "block", maxWidth: "var(--container-sm)" },
  messageCard: {
    ...adaptiveCardSurface,
    ...transitionAll,
    position: "relative",
    display: "flex",
    width: "25rem",
    maxWidth: "var(--container-sm)",
    height: "9rem",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem",
    borderWidth: "1px",
    borderRadius: "var(--radius)",
    textAlign: "center",
  },
  fallbackMessage: { color: "var(--color-red-500)" },
  errorMessage: { color: "var(--color-comment)" },
  card: {
    ...adaptiveCardSurface,
    ...transitionAll,
    position: "relative",
    display: "flex",
    maxWidth: "var(--container-md)",
    borderWidth: "1px",
    borderRadius: "var(--radius)",
    textAlign: "left",
  },
  cardBorder: (color: string) => ({ borderColor: color }),
  cardBody: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    padding: "1rem",
  },
  summary: { flex: 1 },
  repoName: {
    marginBottom: "0.25rem",
    color: "var(--color-heading)",
    fontWeight: "var(--font-weight-semibold)",
  },
  description: {
    color: "var(--color-comment)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  metadata: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
    color: "var(--color-comment)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  language: { display: "flex", alignItems: "center", gap: "0.375rem" },
  languageDot: (color: string) => ({
    width: "0.75rem",
    height: "0.75rem",
    borderRadius: "3.40282e38px",
    backgroundColor: color,
  }),
  stars: { display: "flex", alignItems: "center", gap: "0.25rem" },
  avatarContainer: {
    position: "relative",
    display: { default: "none", "@media (min-width: 40rem)": "block" },
    flexShrink: 0,
    alignSelf: "center",
  },
  avatar: {
    width: "4rem",
    height: "4rem",
    marginRight: "2rem",
    borderRadius: "var(--radius-xl)",
    transform: {
      default: null,
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", cardMarker)]: "scale(1.05)",
      },
    },
    transitionProperty: "transform, translate, scale, rotate",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
});
