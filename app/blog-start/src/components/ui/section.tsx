import { cva } from "class-variance-authority";
import type { ClassValue } from "clsx";
import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

type SectionProps = PropsWithChildren<{
  className?: string;
  padding?: "sm" | "article" | "postList";
  bg?: "grid";
  classOuter?: ClassValue;
  classContainer?: ClassValue;
}>;

const sectionInner = cva("", {
  variants: {
    padding: {
      sm: "px-6 py-4",
      article: "px-4 py-18",
      postList: "px-6 @xl:px-10 @4xl:px-16 @6xl:px-32",
    },
    bg: {
      grid: "bg-grid",
    },
  },
});

const sectionContainer = (className?: ClassValue) =>
  cn("@container main-container h-full", className);

const sectionOuter = (className?: ClassValue) =>
  cn("border-b border-container", className);

export function Section({
  className,
  padding,
  bg,
  classOuter,
  classContainer,
  children,
}: SectionProps) {
  return (
    <section className={sectionOuter(classOuter)}>
      <div className={sectionContainer(classContainer)}>
        <div className={cn(sectionInner({ padding, bg, className }))}>
          {children}
        </div>
      </div>
    </section>
  );
}
