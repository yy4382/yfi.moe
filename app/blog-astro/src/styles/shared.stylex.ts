import * as stylex from "@stylexjs/stylex";
import { colors, motion, spacing } from "@repo/design-tokens/tokens.stylex";

export const layout = stylex.create({
  mainContainer: {
    boxSizing: "border-box",
    marginInline: "auto",
    maxWidth: "100vw",
    width: "100vw",
    "@media (min-width: 40rem) and (max-width: 79.999rem)": {
      borderInlineColor: colors.borderDefault,
      borderInlineStyle: "solid",
      borderInlineWidth: "1px",
      width: "calc(100vw - 100px)",
    },
    "@media (min-width: 80rem)": {
      borderInlineColor: colors.borderDefault,
      borderInlineStyle: "solid",
      borderInlineWidth: "1px",
      width: "1120px",
    },
  },
  sectionBorder: {
    borderBottomColor: colors.borderDefault,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
  },
  gridBackground: {
    backgroundImage:
      "linear-gradient(to right, var(--color-border-subtle) 1px, transparent 1px), linear-gradient(to bottom, var(--color-border-subtle) 1px, transparent 1px)",
    backgroundPosition: "-1px -1px",
    backgroundSize: "14px 14px",
    boxSizing: "border-box",
  },
  articleWidth: { marginInline: "auto", maxWidth: "40em", width: "100%" },
  center: { alignItems: "center", justifyContent: "center" },
  iconSm: { height: "1rem", width: "1rem" },
  iconMd: { height: "1.25rem", width: "1.25rem" },
  iconLg: { height: "1.5rem", width: "1.5rem" },
  underline: { textDecoration: "underline" },
  interactiveCard: {
    transitionDuration: motion.durationFast,
    transitionProperty: "background-color, color",
    transitionTimingFunction: motion.easeStandard,
    ":hover": {
      backgroundColor: colors.surfaceInteractiveHover,
      color: colors.accentText,
    },
  },
  srOnly: {
    clipPath: "inset(50%)",
    height: "1px",
    margin: "-1px",
    overflow: "hidden",
    position: "absolute",
    whiteSpace: "nowrap",
    width: "1px",
  },
  touchTarget: { minHeight: "2.75rem", minWidth: "2.75rem" },
  stackSm: { display: "flex", flexDirection: "column", gap: spacing.sm },
});
