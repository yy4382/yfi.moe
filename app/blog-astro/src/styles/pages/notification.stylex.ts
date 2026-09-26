import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  content: {
    marginInline: "auto",
    marginTop: "2.5rem",
    display: "flex",
    minHeight: "80lvh",
    maxWidth: "28rem",
    flexDirection: "column",
    gap: "1rem",
  },
  title: { fontSize: "1.5rem", lineHeight: "2rem", fontWeight: 700 },
});
