import React from "react";
import type { MarkdownHeading } from "@repo/markdown/parse";

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
          className={`before:bg-primary/80 relative min-w-0 py-1 before:absolute before:-left-1 before:top-1/2 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-md before:opacity-0 before:transition-opacity before:content-[''] ${
            activeIndex === index ? "before:opacity-100" : ""
          }`}
        >
          <a
            href={`#${heading.slug}`}
            className={`text-comment hover:text-content inline-block w-full min-w-0 select-none truncate align-middle transition-[color,margin-left] ${
              activeIndex === index ? "!text-heading" : ""
            }`}
            style={{
              marginLeft: `calc(0.75rem * ${heading.depth - 2 + Number(activeIndex === index) * 0.7})`,
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
