import { cva } from "class-variance-authority";
import type { ClassValue } from "clsx";
import { cn } from "@/lib/utils/cn";

const cardInner = cva("", {
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

/**
 * Card container
 *
 * `@container main-container h-full`
 */
const cardContainer = (className?: ClassValue) =>
  cn("@container main-container h-full", className);

/**
 * Card outer container
 *
 * `border-b border-container`
 */
const cardOuter = (className?: ClassValue) =>
  cn("border-b border-container", className);

export function Card({
  className,
  padding,
  bg,
  classOuter,
  classContainer,
  children,
}: {
  className?: string;
  padding?: "sm" | "article" | "postList";
  bg?: "grid";
  classOuter?: string;
  classContainer?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className={cardOuter(classOuter)}>
      <div className={cn(cardContainer(classContainer))}>
        <div className={cn(cardInner({ padding, bg, className }))}>
          {children}
        </div>
      </div>
    </section>
  );
}
