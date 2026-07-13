import * as stylex from "@stylexjs/stylex";
import {
  colors,
  motion,
  radii,
  spacing,
} from "@repo/design-tokens/tokens.stylex";
import type { ArticleHeading } from "@repo/markdown/article";

interface TableOfContentsProps {
  headings: ArticleHeading[];
  activeIndex: number;
}

const styles = stylex.create({
  list: { listStyle: "none", margin: 0, padding: 0 },
  item: {
    borderInlineStartColor: "transparent",
    borderInlineStartStyle: "solid",
    borderInlineStartWidth: "2px",
    borderRadius: radii.sm,
    minWidth: 0,
    paddingBlock: spacing.xs,
    paddingInlineStart: spacing.sm,
    transitionDuration: motion.durationFast,
    transitionProperty: "border-color",
  },
  activeItem: { borderInlineStartColor: colors.accent },
  link: {
    color: colors.textSecondary,
    display: "inline-block",
    minWidth: 0,
    overflow: "hidden",
    textDecoration: "none",
    textOverflow: "ellipsis",
    transitionDuration: motion.durationFast,
    transitionProperty: "color, margin-left, transform",
    userSelect: "none",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
    width: "100%",
    ":hover": { color: colors.textPrimary },
  },
  activeLink: { color: colors.textPrimary },
});

export default function TocEntry({
  headings,
  activeIndex,
}: TableOfContentsProps) {
  return (
    <ul {...stylex.props(styles.list)}>
      {headings.map((heading, index) => {
        const isActive = activeIndex === index;
        return (
          <li
            key={heading.id}
            {...stylex.props(styles.item, isActive && styles.activeItem)}
          >
            <a
              href={`#${heading.id}`}
              {...stylex.props(styles.link, isActive && styles.activeLink)}
              style={{
                marginLeft: `calc(0.75rem * ${heading.depth - 2})`,
                transform: `translateX(${Number(isActive) * 0.525}rem)`,
              }}
            >
              {heading.text}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
