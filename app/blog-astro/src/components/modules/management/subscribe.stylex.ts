import * as stylex from "@stylexjs/stylex";

export const styles = stylex.create({
  content: { display: "flex", flexDirection: "column", gap: "1rem" },
  success: { color: "var(--color-green-600)" },
  description: {
    fontSize: "0.875rem",
    lineHeight: "1.25rem",
    color: "var(--color-gray-600)",
  },
  error: { color: "var(--color-red-600)" },
  button: {
    borderRadius: "0.25rem",
    paddingInline: "1rem",
    paddingBlock: "0.5rem",
    color: "white",
  },
  disabledButton: { opacity: { default: null, ":disabled": 0.5 } },
  unsubscribe: {
    backgroundColor: {
      default: "var(--color-red-500)",
      "@media (hover: hover)": { ":hover": "var(--color-red-600)" },
    },
  },
  resubscribe: {
    backgroundColor: {
      default: "var(--color-blue-500)",
      "@media (hover: hover)": { ":hover": "var(--color-blue-600)" },
    },
  },
});
