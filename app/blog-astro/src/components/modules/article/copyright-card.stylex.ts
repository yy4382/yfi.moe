import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  section: {
    overflow: "hidden",
    paddingBlock: "2.5rem",
  },
  content: {
    maxWidth: "75ch",
    marginInline: "auto",
    fontSize: "var(--text-sm)",
    lineHeight: "var(--text-sm-line-height)",
  },
  signature: { float: "right" },
  firstParagraph: { marginTop: 0, marginBottom: "0.5rem" },
  lastParagraph: { marginTop: 0 },
});
