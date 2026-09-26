import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  card: {
    padding: 24,
    backgroundColor: {
      default: "#eee",
      "@media (prefers-color-scheme: dark)": "#222",
    },
    color: { default: "#222", "@media (prefers-color-scheme: dark)": "#eee" },
    width: { default: 400, "@media (max-width: 600px)": 240 },
  },
  button: {
    padding: 12,
    color: "white",
    backgroundColor: { default: "#245", ":hover": "#467" },
  },
  dynamic: (width: number) => ({ width }),
});
