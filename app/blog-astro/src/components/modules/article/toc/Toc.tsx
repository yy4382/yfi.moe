"use client";

import { ListIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect, useRef, useMemo, useLayoutEffect } from "react";
import type { MarkdownHeading } from "@repo/markdown/parse";
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

// MARK: Hooks

/**
 * Tracks which heading is currently active based on viewport visibility.
 * Uses IntersectionObserver to detect when headings enter/exit the viewport.
 */
function useActiveHeading(headings: MarkdownHeading[]): number {
  const [isVisible, setIsVisible] = useState<boolean[]>(() =>
    new Array(headings.length).fill(false),
  );
  const lastActiveIndexRef = useRef<number>(0);

  useEffect(() => {
    const headers = headings
      .map((heading) => document.getElementById(heading.slug))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = headings.findIndex((h) => h.slug === entry.target.id);
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
    return () => headers.forEach((header) => observer.unobserve(header));
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
function useMedianHeadingLength(headings: MarkdownHeading[]): number {
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
function useTocLayout(headings: MarkdownHeading[]): TocLayout {
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
  headings: MarkdownHeading[];
}

function TocPopover({ headings }: TocPopoverProps) {
  const activeIndex = useActiveHeading(headings);

  return (
    <div className="sticky top-(--navbar-height) isolate z-10 flex justify-end">
      <Popover modal={true}>
        <PopoverTrigger className="pointer-events-auto flex size-10 center border-b border-l border-container bg-background">
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ListIcon className="size-6 text-heading" />
          </motion.span>
        </PopoverTrigger>
        <PopoverPortal>
          <PopoverBackdrop />
          <PopoverPositioner sideOffset={5} className="z-50">
            <PopoverPopup
              transition={{
                type: "spring",
                visualDuration: 0.15,
                bounce: 0.2,
              }}
            >
              <div className="pointer-events-auto w-76 border border-container bg-background px-6 py-8 text-comment">
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
  headings: MarkdownHeading[];
  position: TocLayout["sidebar"];
}

function TocSidebar({ headings, position }: TocSidebarProps) {
  const activeIndex = useActiveHeading(headings);

  return (
    <div className="sticky top-(--navbar-height) isolate z-10 py-8">
      <div
        className="pointer-events-auto w-fit border-t border-b border-dashed border-container bg-background px-2 pt-4 pb-8 text-sm text-comment/75 dark:text-comment/90"
        style={{
          transform: `translateX(${position.left}px)`,
          minWidth: `${position.minWidth}px`,
          maxWidth: `${position.maxWidth}px`,
        }}
      >
        <div className="mb-2 text-xl">文章目录</div>
        <TocEntry headings={headings} activeIndex={activeIndex} />
      </div>
    </div>
  );
}

interface TocProps {
  headings: MarkdownHeading[];
}

function Toc({ headings }: TocProps) {
  const layout = useTocLayout(headings);

  if (layout.mode === "sidebar") {
    return <TocSidebar headings={headings} position={layout.sidebar} />;
  }

  return <TocPopover headings={headings} />;
}

export default Toc;
