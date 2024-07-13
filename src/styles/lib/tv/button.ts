import { tv } from "tailwind-variants";
export const tvButton = tv({
  base: "transition-colors rounded-lg text-content select-none",
  variants: {
    color: {
      primary: "bg-transparent hover:bg-primary/20 active:bg-primary/30",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});
