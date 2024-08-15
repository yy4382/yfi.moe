import { tv } from "tailwind-variants";
export const tvButton = tv({
  base: "select-none rounded-lg text-content transition-colors",
  variants: {
    color: {
      primary: "bg-transparent hover:bg-primary/20 active:bg-primary/30",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});
