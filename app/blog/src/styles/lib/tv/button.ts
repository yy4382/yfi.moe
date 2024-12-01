import { tv } from "tailwind-variants";
export const tvButton = tv({
  base: "rounded-lg text-content transition-colors select-none",
  variants: {
    color: {
      primary: "bg-transparent hover:bg-primary/20 active:bg-primary/30",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});
