import { tv } from "tailwind-variants";
export const popover = tv({
  slots: {
    base: `
      absolute size-8
      flex items-end justify-end
      p-1 rounded-2xl bg-popover outline outline-gray-200 dark:outline-gray-600
      group
      transition-[width,height] hover:ease-spring ease-in-out
      hover:delay-0 hover:duration-[var(--extend-bg-duration)] ${/** extent time */ ""}
      delay-[var(--fade-content-duration)] duration-[var(--shrink-bg-duration)] ${/** shrink time */ ""}
      [--extend-bg-duration:500ms] [--show-content-delay:200ms] [--show-content-duration:200ms] ${/** time variables */ ""}
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
