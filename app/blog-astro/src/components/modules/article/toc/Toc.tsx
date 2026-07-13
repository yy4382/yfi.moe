"use client";

import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import { colors, spacing, typography } from "@repo/design-tokens/tokens.stylex";
import type { ArticleHeading } from "@repo/markdown/article";
import { MaskIcon } from "@/components/ui/mask-icon";
import {
  Popover,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
  PopoverTrigger,
  PopoverBackdrop,
} from "@/components/ui/motion-popover";
import TocEntry from "./TocEntry";

// MARK: Constants

const ELEMENT_IDS = {
  articleContent: "article-content",
  articleContainer: "article-container",
} as const;

const LAYOUT = {
  /** Minimum gap between article content and TOC */
  gapFromContent: 36,
  /** Minimum gap between TOC and viewport edge */
  gapFromEdge: 20,
  /** TOC width for short headings */
  minTocWidth: 192,
  /** TOC width for longer headings */
  maxTocWidthLong: 300,
  /** Absolute maximum TOC width */
  maxTocWidth: 400,
  /** How far TOC extends past container edge */
  containerOverflow: 24,
  /** Space threshold for doubling gaps (more breathing room) */
  spaciousThreshold: 300,
  /** Median heading length threshold for "long" text mode */
  longTextThreshold: 15,
} as const;

const styles = stylex.create({
  popoverRoot: {
    display: "flex",
    isolation: "isolate",
    justifyContent: "flex-end",
    position: "sticky",
    top: "var(--navbar-height)",
    zIndex: 10,
  },
  trigger: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderDefault,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    borderLeftColor: colors.borderDefault,
    borderLeftStyle: "solid",
    borderLeftWidth: "1px",
    display: "flex",
    height: "2.5rem",
    justifyContent: "center",
    pointerEvents: "auto",
    width: "2.5rem",
  },
  triggerIcon: { color: colors.textPrimary, height: "1.5rem", width: "1.5rem" },
  positioner: { zIndex: 50 },
  popupContent: {
    backgroundColor: colors.surface,
    borderColor: colors.borderDefault,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textSecondary,
    maxWidth: "calc(100vw - 2rem)",
    paddingBlock: spacing.xxl,
    paddingInline: spacing.xl,
    pointerEvents: "auto",
    width: "19rem",
  },
  sidebarRoot: {
    isolation: "isolate",
    paddingBlock: spacing.xxl,
    position: "sticky",
    top: "var(--navbar-height)",
    zIndex: 10,
  },
  sidebar: {
    backgroundColor: colors.surface,
    borderBlockColor: colors.borderDefault,
    borderBlockStyle: "dashed",
    borderBlockWidth: "1px",
    color: colors.textSecondary,
    fontSize: typography.sizeSm,
    paddingBlockStart: spacing.lg,
    paddingBlockEnd: spacing.xxl,
    paddingInline: spacing.sm,
    pointerEvents: "auto",
    width: "fit-content",
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizeXl,
    marginBlockEnd: spacing.sm,
  },
});

// MARK: Hooks

/**
 * Tracks which heading is currently active based on viewport visibility.
 * Uses IntersectionObserver to detect when headings enter/exit the viewport.
 */
function useActiveHeading(headings: ArticleHeading[]): number {
  const [isVisible, setIsVisible] = useState<boolean[]>(() =>
    new Array(headings.length).fill(false),
  );
  const lastActiveIndexRef = useRef<number>(0);

  useEffect(() => {
    const headers = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = headings.findIndex((h) => h.id === entry.target.id);
          if (index === -1) return;

          setIsVisible((prev) => {
            const next = [...prev];
            next[index] = entry.isIntersecting;
            return next;
          });
        });
      },
      { rootMargin: "-80px 0px 0px 0px" },
    );

    headers.forEach((header) => observer.observe(header));
    return () => observer.disconnect();
  }, [headings]);

  return useMemo(() => {
    const index = isVisible.findIndex((v) => v);
    if (index !== -1) {
      // eslint-disable-next-line react-hooks/refs -- intentionally persist last active
      lastActiveIndexRef.current = index;
      return index;
    }
    // eslint-disable-next-line react-hooks/refs -- fall back to last known active
    return lastActiveIndexRef.current;
  }, [isVisible]);
}

/**
 * Calculates the median "effective length" of headings.
 * Used to determine if TOC needs extra width for longer text.
 */
function useMedianHeadingLength(headings: ArticleHeading[]): number {
  return useMemo(() => {
    if (headings.length === 0) return 0;
    const lengths = headings
      .map((h) => h.text.length + h.depth * 2)
      .sort((a, b) => a - b);
    return lengths[Math.floor(lengths.length / 2)];
  }, [headings]);
}

interface TocLayout {
  mode: "sidebar" | "popover";
  sidebar: {
    left: number;
    minWidth: number;
    maxWidth: number;
  };
}

/**
 * Measures article layout and determines TOC display mode.
 * Returns positioning values for sidebar mode.
 */
function useTocLayout(headings: ArticleHeading[]): TocLayout {
  const medianLength = useMedianHeadingLength(headings);
  const requiredWidth =
    medianLength > LAYOUT.longTextThreshold
      ? LAYOUT.maxTocWidthLong
      : LAYOUT.minTocWidth;

  const [layout, setLayout] = useState<TocLayout>({
    mode: "popover",
    sidebar: { left: 0, minWidth: 0, maxWidth: 0 },
  });

  useLayoutEffect(() => {
    function measure() {
      const articleContent = document.getElementById(
        ELEMENT_IDS.articleContent,
      );
      const articleContainer = document.getElementById(
        ELEMENT_IDS.articleContainer,
      );

      if (!articleContent || !articleContainer) {
        setLayout({
          mode: "popover",
          sidebar: { left: 0, minWidth: 0, maxWidth: 0 },
        });
        return;
      }

      const contentRect = articleContent.getBoundingClientRect();
      const containerRect = articleContainer.getBoundingClientRect();
      const availableSpace = window.innerWidth - contentRect.right;

      // Determine display mode
      const minSpaceRequired =
        LAYOUT.gapFromContent + LAYOUT.gapFromEdge + requiredWidth;

      if (availableSpace <= minSpaceRequired) {
        setLayout({
          mode: "popover",
          sidebar: { left: 0, minWidth: 0, maxWidth: 0 },
        });
        return;
      }

      // Calculate sidebar positioning
      // Use larger gaps when there's plenty of space
      const isSpacious =
        availableSpace - LAYOUT.gapFromContent - LAYOUT.gapFromEdge >
        LAYOUT.spaciousThreshold;
      const gapContent = isSpacious
        ? LAYOUT.gapFromContent * 2
        : LAYOUT.gapFromContent;
      const gapEdge = isSpacious ? LAYOUT.gapFromEdge * 2 : LAYOUT.gapFromEdge;

      const left = contentRect.right - containerRect.left + gapContent;
      const minWidth = containerRect.width - left + LAYOUT.containerOverflow;
      const maxWidth = Math.min(
        window.innerWidth - contentRect.right - gapContent - gapEdge,
        LAYOUT.maxTocWidth,
      );

      setLayout({
        mode: "sidebar",
        sidebar: { left, minWidth, maxWidth },
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [requiredWidth]);

  return layout;
}

// MARK: Components

interface TocPopoverProps {
  headings: ArticleHeading[];
}

function TocPopover({ headings }: TocPopoverProps) {
  const activeIndex = useActiveHeading(headings);

  return (
    <div {...stylex.props(styles.popoverRoot)}>
      <Popover modal={true}>
        <PopoverTrigger stylexStyle={styles.trigger} aria-label="打开文章目录">
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <MaskIcon name="lucide-list" style={styles.triggerIcon} />
          </motion.span>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverBackdrop />
          <PopoverPositioner sideOffset={5} stylexStyle={styles.positioner}>
            <PopoverPopup>
              <div {...stylex.props(styles.popupContent)}>
                <TocEntry headings={headings} activeIndex={activeIndex} />
              </div>
            </PopoverPopup>
          </PopoverPositioner>
        </PopoverPortal>
      </Popover>
    </div>
  );
}

interface TocSidebarProps {
  headings: ArticleHeading[];
  position: TocLayout["sidebar"];
}

function TocSidebar({ headings, position }: TocSidebarProps) {
  const activeIndex = useActiveHeading(headings);

  return (
    <div {...stylex.props(styles.sidebarRoot)}>
      <div
        {...stylex.props(styles.sidebar)}
        style={{
          transform: `translateX(${position.left}px)`,
          minWidth: `${position.minWidth}px`,
          maxWidth: `${position.maxWidth}px`,
        }}
      >
        <div {...stylex.props(styles.title)}>文章目录</div>
        <TocEntry headings={headings} activeIndex={activeIndex} />
      </div>
    </div>
  );
}

interface TocProps {
  headings: ArticleHeading[];
}

function Toc({ headings }: TocProps) {
  const layout = useTocLayout(headings);

  if (layout.mode === "sidebar") {
    return <TocSidebar headings={headings} position={layout.sidebar} />;
  }

  return <TocPopover headings={headings} />;
}

export default Toc;
