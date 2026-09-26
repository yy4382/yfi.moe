import * as stylex from "@stylexjs/stylex";

export const cardMarker = stylex.defineMarker();

const colorTransition = {
  transitionProperty:
    "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
  transitionTimingFunction: "var(--default-transition-timing-function)",
  transitionDuration: "var(--default-transition-duration)",
} as const;

export const styles = stylex.create({
  headingContainer: {
    borderBottomWidth: "1px",
    borderColor: "var(--border-color-container)",
    paddingInline: "1.5rem",
    paddingBlock: "1rem",
  },
  heading: {
    fontSize: "var(--text-lg)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--text-lg-line-height)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: {
      default: "minmax(0, 1fr)",
      "@media (min-width: 48rem)": "repeat(3, minmax(0, 1fr))",
    },
  },
  card: {
    ...colorTransition,
    containerType: "inline-size",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    borderColor: "var(--border-color-container)",
    paddingInline: {
      default: "1.5rem",
      "@container (min-width: 32rem)": "2rem",
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
  separatedCard: {
    borderBottomWidth: {
      default: "1px",
      "@media (min-width: 48rem)": 0,
    },
    borderRightWidth: {
      default: 0,
      "@media (min-width: 48rem)": "1px",
    },
  },
  title: {
    color: {
      default: null,
      "@media (hover: hover)": {
        [stylex.when.ancestor(":hover", cardMarker)]:
          "var(--accent-foreground)",
      },
    },
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--leading-snug)",
    transitionProperty:
      "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    transitionTimingFunction: "var(--default-transition-timing-function)",
    transitionDuration: "var(--default-transition-duration)",
  },
  tags: {
    display: "flex",
    alignItems: "center",
    marginTop: "auto",
    paddingTop: "0.5rem",
    color: "var(--color-comment)",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
    userSelect: "none",
  },
  tagIcon: {
    width: "1rem",
    height: "1rem",
    marginRight: "0.25rem",
  },
  tagPiece: { marginRight: "0.125rem" },
  lastTagPiece: { marginRight: 0 },
});
