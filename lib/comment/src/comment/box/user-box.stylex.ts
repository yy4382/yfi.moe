import * as stylex from "@stylexjs/stylex";

export const userMarker = stylex.defineMarker();

export const styles = stylex.create({
  root: { display: "flex", width: "100%", alignItems: "flex-end", gap: "1rem" },
  avatarContainer: {
    position: "relative",
    marginBottom: "0.5rem",
    flexShrink: 0,
  },
  avatar: {
    width: "3.5rem",
    height: "3.5rem",
    aspectRatio: "1 / 1",
    borderRadius: "3.40282e38px",
    boxShadow: {
      default: "0 0 0 2px var(--color-black)",
      "@media (prefers-color-scheme: dark)": "0 0 0 2px var(--color-white)",
    },
  },
  signOut: {
    position: "absolute",
    top: "-0.25rem",
    right: "-0.25rem",
    zIndex: 10,
    display: {
      default: "none",
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", userMarker)]: "block",
      },
    },
    width: "1rem",
    height: "1rem",
    padding: "0.125rem",
    borderRadius: "var(--radius-md)",
    backgroundColor:
      "color-mix(in oklab, var(--color-zinc-500) 50%, transparent)",
  },
  center: {
    display: "flex",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutIcon: { width: "0.625rem", height: "0.625rem" },
  githubBadge: {
    position: "absolute",
    right: "-0.25rem",
    bottom: "-0.25rem",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.125rem",
    paddingBottom: 0,
    borderRadius: "3.40282e38px",
    backgroundColor: "var(--color-white)",
    boxShadow: {
      default: "0 0 0 1px currentColor",
      "@media (prefers-color-scheme: dark)": "0 0 0 1px var(--color-black)",
    },
  },
  githubIcon: {
    width: "0.875rem",
    height: "0.875rem",
    color: "var(--color-black)",
  },
});
