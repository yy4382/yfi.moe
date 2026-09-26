import * as stylex from "@stylexjs/stylex";
import React from "react";
import type { ArticleHeading } from "@repo/markdown/article";
import { styles } from "./toc.stylex";

interface TableOfContentsProps {
  headings: ArticleHeading[];
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
          key={heading.id}
          {...stylex.props(
            styles.entry,
            activeIndex === index && styles.activeEntry,
          )}
        >
          <a
            href={`#${heading.id}`}
            {...stylex.props(
              styles.link,
              activeIndex === index && styles.activeLink,
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
