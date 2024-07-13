import { tv } from "tailwind-variants";
export const card = tv({
  slots: {
    base: "bg-card shape-card",
    heading: "text-heading",
  },
  variants: {
    padding: {
      xs: {
        base: "p-3 sm:p-4",
      },
      sm: {
        base: "p-4 sm:p-6",
      },
      md: {
        base: "p-6 sm:p-8",
      },
    },
    headSize: {
      xl: {
        heading: "text-xl font-medium tracking-tight",
      },
    },
    useIndicator: {
      true: {
        heading:
          "relative before:absolute before:-left-4 before:w-1 before:rounded-md before:bg-primary before:content-[''] before:top-1/2 before:-translate-y-1/2",
      },
    },
    leftExtraPadding: {
      true: {},
    },
  },
  compoundVariants: [
    {
      headSize: "xl",
      useIndicator: true,
      class: { heading: "before:h-5" },
    },

    // indicator placement change due to padding
    {
      padding: "xs",
      useIndicator: true,
      class: { heading: "before:-left-2" },
    },
    {
      padding: "sm",
      useIndicator: true,
      class: { heading: "before:-left-2.5" },
    },

    // leftExtraPadding changes
    {
      padding: "xs",
      useIndicator: true,
      leftExtraPadding: true,
      class: { heading: "ml-1 sm:ml-2" },
    },
    {
      padding: "sm",
      useIndicator: true,
      leftExtraPadding: true,
      class: { heading: "ml-2 sm:ml-3" },
    },
    {
      padding: "md",
      useIndicator: true,
      leftExtraPadding: true,
      class: { heading: "ml-3 sm:ml-4" },
    },
  ],
  defaultVariants: {
    padding: "md",
    headSize: "xl",
    useIndicator: true,
    leftExtraPadding: false,
  },
});
