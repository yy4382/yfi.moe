import * as stylex from "@stylexjs/stylex";

export const groupMarker = stylex.defineMarker();

const colorTransition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

export const styles = stylex.create({
  grid: {
    display: "grid",
    alignItems: "stretch",
  },
  doubleGrid: {
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 64rem)": "repeat(2, minmax(0, 1fr))",
    },
  },
  singleGrid: { gridTemplateColumns: "minmax(0, 1fr)" },
  cardContainer: { containerType: "inline-size" },
  link: {
    ...colorTransition,
    display: "flex",
    height: "100%",
    alignItems: "center",
    gap: { default: "1rem", "@container (min-width: 32rem)": "2rem" },
    paddingInline: {
      default: "1.5rem",
      "@container (min-width: 32rem)": "4rem",
    },
    paddingBlock: {
      default: "1.5rem",
      "@container (min-width: 32rem)": "2rem",
    },
    color: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent-foreground)" },
    },
    backgroundColor: {
      default: null,
      "@media (hover: hover)": { ":hover": "var(--accent)" },
    },
  },
  previousLink: {
    borderColor: "var(--border-color-container)",
    borderBottomWidth: {
      default: "1px",
      "@media (min-width: 64rem)": 0,
    },
    borderRightWidth: {
      default: 0,
      "@media (min-width: 64rem)": "1px",
    },
  },
  nextLink: { flexDirection: "row-reverse" },
  iconCircle: {
    display: "flex",
    width: "3rem",
    height: "3rem",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: "1px",
    borderColor: {
      default: "color-mix(in oklab, var(--accent) 20%, transparent)",
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", groupMarker)]:
          "color-mix(in oklab, var(--accent) 30%, transparent)",
      },
    },
    borderRadius: "3.40282e38px",
    backgroundColor: {
      default: "color-mix(in oklab, var(--accent) 10%, transparent)",
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", groupMarker)]:
          "color-mix(in oklab, var(--accent) 20%, transparent)",
      },
    },
    transitionProperty: "all",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "0.2s",
  },
  icon: {
    width: "2.25rem",
    height: "2.25rem",
    flexShrink: 0,
    scale: {
      default: null,
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", groupMarker)]: "120%",
      },
      [stylex.when.ancestor(":active", groupMarker)]: "95%",
    },
    transitionProperty: "transform, translate, scale, rotate",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  label: {
    color: "var(--color-comment)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  title: {
    fontSize: {
      default: null,
      "@container (min-width: 32rem)": "var(--text-lg)",
    },
    lineHeight: {
      default: null,
      "@container (min-width: 32rem)": "var(--text-lg-line-height)",
    },
  },
  nextText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
});
