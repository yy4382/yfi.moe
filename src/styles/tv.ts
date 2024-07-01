import { tv } from "tailwind-variants";
export const popover = tv({
  slots: {
    base: `
      absolute size-8
      flex items-end justify-end
      p-1 rounded-2xl bg-popover outline outline-gray-200 dark:outline-gray-600
      group
      transition-[width,height] hover:ease-elastic ease-in-out
      hover:delay-0 hover:duration-[var(--extend-bg-duration)] ${/** extent time */ ""}
      delay-[var(--fade-content-duration)] duration-[var(--shrink-bg-duration)] ${/** shrink time */ ""}
      [--extend-bg-duration:1000ms] [--show-content-delay:300ms] [--show-content-duration:500ms] ${/** time variables */ ""}
      [--fade-content-duration:100ms] [--shrink-bg-duration:300ms]`,
    contentWrapper: `
      absolute bottom-0 right-0 size-0
      group-hover:transition-none transition-[width,height] 
      duration-[var(--fade-content-duration)] ease-[steps(1,end)]`,
    content: `
      transition-[visibility,opacity] 

      invisible group-hover:visible 
      opacity-0 group-hover:opacity-100 
      group-hover:pointer-events-auto pointer-events-none 

      group-hover:delay-[var(--show-content-delay)] group-hover:duration-[var(--show-content-duration)] ${/** show time */ ""}
      duration-[var(--fade-content-duration)] ${/** fade time (delay=0) */ ""}`,
    icon: "size-6 text-primary",
  },
});

export const card = tv({
  slots: {
    base: "bg-card shape-card p-6",
    heading: "text-heading",
  },
  variants: {
    padding: {
      xs: {
        base: "p-2 sm:p-4",
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
          "relative before:absolute before:-left-4 before:w-1 before:rounded-md before:bg-[var(--primary)] before:content-['']",
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

      class: { heading: "before:top-1 before:h-5" },
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
      class: { heading: "before:-left-3" },
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
