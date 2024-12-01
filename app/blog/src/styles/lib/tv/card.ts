import { tv } from "tailwind-variants";
export const card = tv({
  slots: {
    base: "shape-card bg-card",
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
    lessBottomPadding: {
      true: {},
    },
    headSize: {
      xl: {
        heading: "text-xl font-medium tracking-tight",
      },
      "3xl": {
        heading: "text-3xl font-medium tracking-tight",
      },
    },
    useIndicator: {
      true: {
        heading:
          "relative before:absolute before:h-[0.85em] before:w-[0.18em] before:rounded-full before:bg-primary before:content-['']",
      },
    },
    leftExtraPadding: {
      true: {},
    },
  },
  compoundVariants: [
    // lessBottomPadding
    {
      lessBottomPadding: true,
      padding: "xs",
      class: { base: "pb-2 sm:pb-3" },
    },
    {
      lessBottomPadding: true,
      padding: "sm",
      class: { base: "pb-3 sm:pb-5" },
    },
    {
      lessBottomPadding: true,
      padding: "md",
      class: { base: "pb-4 sm:pb-6" },
    },

    // indicator placement change due to headSize changes
    {
      useIndicator: true,
      headSize: ["xl", "3xl"],
      class: { heading: "before:top-[6px]" }, // (line-height - text-size*0.8)/2
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
    {
      padding: "md",
      useIndicator: true,
      class: { heading: "before:-left-4" },
    },

    // leftExtraPadding changes
    {
      padding: "xs",
      useIndicator: true,
      leftExtraPadding: true,
      class: { heading: "ml-2" },
    },
    {
      padding: "sm",
      useIndicator: true,
      leftExtraPadding: true,
      class: { heading: "ml-2.5" },
    },
    {
      padding: "md",
      useIndicator: true,
      leftExtraPadding: true,
      class: { heading: "ml-4" },
    },
  ],
  defaultVariants: {
    padding: "md",
    headSize: "xl",
    useIndicator: true,
    leftExtraPadding: false,
    lessBottomPadding: false,
  },
});
