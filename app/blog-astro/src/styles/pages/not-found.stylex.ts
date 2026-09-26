import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  section: {
    marginInline: "auto",
    marginBlock: "6rem",
    maxWidth: "36rem",
    paddingInline: "2rem",
    color: "var(--color-heading)",
  },
  content: { display: "flex", flexDirection: "column", gap: "3rem" },
  introduction: { display: "flex", flexDirection: "column", gap: "1rem" },
  title: { fontSize: "3rem", lineHeight: 1, fontWeight: 600 },
  suggestions: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  actions: { display: "flex", gap: "1rem" },
  action: {
    borderRadius: "calc(var(--radius) - 2px)",
    backgroundColor: "color-mix(in oklab, var(--primary) 80%, transparent)",
    padding: "0.5rem",
    color: "black",
  },
  homeLink: { display: "block" },
});
