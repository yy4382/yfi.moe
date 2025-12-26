import React from "react";
import type { MarkdownHeading } from "@repo/markdown/parse";
import { cn } from "@/lib/utils/cn";

interface TableOfContentsProps {
  headings: MarkdownHeading[];
  activeIndex: number;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  headings,
  activeIndex,
}) => {
  return (
    <ul>
      {headings.map((heading, index) => (
        <li
          key={heading.slug}
          className={cn(
            `relative min-w-0 py-1 before:absolute before:top-1/2 before:-left-1 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-md before:bg-primary/80 before:opacity-0 before:transition-opacity before:content-['']`,
            activeIndex === index && "before:opacity-100",
          )}
        >
          <a
            href={`#${heading.slug}`}
            className={cn(
              `inline-block w-full min-w-0 truncate align-middle transition-[color,margin-left,transform] select-none hover:text-content`,
              activeIndex === index && "text-heading!",
            )}
            style={{
              marginLeft: `calc(0.75rem * ${heading.depth - 2})`,
              transform: `translateX(${Number(activeIndex === index) * 0.7 * 0.75}rem)`,
            }}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ul>
  );
};

export default TableOfContents;
