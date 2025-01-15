import React, { Fragment } from "react";
import { card, tvButton } from "@styles/tv";
import { motion } from "motion/react";

const noBounceSpring = {
  type: "spring",
  duration: 0.5,
  bounce: 0,
} as const;

const bouncySpring = {
  type: "spring",
  bounce: 0.5,
  visualDuration: 0.5,
} as const;

const BASE_DELAY = 0.1;
const INTERVAL = 0.1;

type CompactEntryListProps = {
  keyword?: string;
  rows: {
    year: string;
    items: {
      title: string;
      href: string;
      children: React.ReactNode;
    }[];
  }[];
};

export const CompactEntryList: React.FC<CompactEntryListProps> = ({
  keyword,
  rows,
}: CompactEntryListProps) => {
  return (
    <motion.div
      className={card().base()}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        default: noBounceSpring,
        opacity: { duration: 0.2, ease: "ease" },
      }}
    >
      {keyword && (
        <motion.h1
          className={card().heading()}
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{
            ...noBounceSpring,
            delay: BASE_DELAY,
          }}
        >
          {keyword}
        </motion.h1>
      )}
      {rows.map((row, yearIndex) => (
        <Fragment key={row.year}>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              default: {
                ...bouncySpring,
                delay: BASE_DELAY + yearIndex * INTERVAL,
              },
              opacity: {
                duration: 0.2,
                ease: "ease",
                delay: BASE_DELAY + yearIndex * INTERVAL,
              },
            }}
          >
            <CompactEntryListYear year={row.year} />
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              default: {
                ...bouncySpring,
                delay: BASE_DELAY + yearIndex * INTERVAL + INTERVAL / 3,
              },
              opacity: {
                duration: 0.2,
                ease: "ease",
                delay: BASE_DELAY + yearIndex * INTERVAL + INTERVAL / 3,
              },
            }}
          >
            <CompactEntryListItems items={row.items} />
          </motion.div>
        </Fragment>
      ))}
    </motion.div>
  );
};

type CompactEntryListYearProps = {
  year: string;
};

const CompactEntryListYear: React.FC<CompactEntryListYearProps> = ({
  year,
}) => {
  return (
    <div className="pointer-events-none relative h-12 select-none sm:h-20">
      {/* https://stackoverflow.com/a/73146972 */}
      <span className="absolute top-4 -left-4 text-8xl leading-none font-bold text-transparent opacity-10 [-webkit-text-stroke:4px_theme('colors.content.200')] sm:text-[9rem]">
        {year}
        <span className="pointer-events-none absolute left-0 text-card [-webkit-text-stroke:0]">
          {year}
        </span>
      </span>
    </div>
  );
};

type CompactEntryListItemsProps = {
  items: CompactEntryListProps["rows"][number]["items"];
};

const CompactEntryListItems: React.FC<CompactEntryListItemsProps> = ({
  items,
}) => {
  return (
    <ul className="timeline-dot -ml-3 flex flex-col md:ml-0">
      {items.map((item) => (
        <li
          className={"timeline-dot-item group py-2 " + tvButton()}
          key={item.title}
        >
          <a className="flex flex-col gap-1" href={item.href}>
            <span className="truncate text-left text-sm text-heading transition group-hover:translate-x-1 md:text-base">
              {item.title}
            </span>
            {item.children}
          </a>
        </li>
      ))}
    </ul>
  );
};
