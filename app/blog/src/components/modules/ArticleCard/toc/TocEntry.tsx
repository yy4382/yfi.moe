import React from "react";

import type { MarkdownHeading } from "astro";

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
          className={`relative min-w-0 py-1 before:absolute before:top-1/2 before:-left-1 before:h-4 before:w-[2px] before:-translate-y-1/2 before:rounded-md before:bg-primary before:opacity-0 before:transition-opacity before:content-[''] ${
            activeIndex === index ? "before:opacity-100" : ""
          }`}
        >
          <a
            href={`#${heading.slug}`}
            className={`inline-block w-full min-w-0 truncate align-middle text-comment transition-[color,margin-left] select-none hover:text-content ${
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
