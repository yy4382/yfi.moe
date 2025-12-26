"use client";

import { motion, useMotionValue, animate } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

const ELEMENT_IDS = {
  articleContent: "article-content",
  articleContainer: "article-container",
} as const;

const PADDING = 8;
const NAVBAR_HEIGHT = 80;
const MIN_GAP_FOR_BORDER = 64;
const INDICATOR_HEIGHT = 8; // h-2 = 0.5rem = 8px

/**
 * Calculates reading progress based on scroll position within the article.
 */
function useReadingProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function calculateProgress() {
      const articleContent = document.getElementById(
        ELEMENT_IDS.articleContent,
      );
      if (!articleContent) return;

      const rect = articleContent.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const articleTop = rect.top;
      const articleHeight = rect.height;

      const readingLine = NAVBAR_HEIGHT;
      const scrolledPast = readingLine - articleTop;
      const scrollableDistance =
        articleHeight - (viewportHeight - NAVBAR_HEIGHT);

      if (scrolledPast <= 0) {
        setProgress(0);
      } else if (scrolledPast >= scrollableDistance) {
        setProgress(1);
      } else {
        setProgress(scrolledPast / scrollableDistance);
      }
    }

    calculateProgress();
    window.addEventListener("scroll", calculateProgress, { passive: true });
    window.addEventListener("resize", calculateProgress);

    return () => {
      window.removeEventListener("scroll", calculateProgress);
      window.removeEventListener("resize", calculateProgress);
    };
  }, []);

  return progress;
}

interface IndicatorLayout {
  visible: boolean;
  trackHeight: number;
  /** Negative offset to reach screen edge, or 0 to stay at border */
  leftOffset: number;
}

/**
 * Determines indicator position based on available space.
 * - hidden: screen too narrow (< 640px), no border rendered
 * - border: gap >= 64px, attach to container border (leftOffset = 0)
 * - edge: gap < 64px, attach to screen edge (leftOffset = negative value)
 */
function useIndicatorLayout(): IndicatorLayout {
  const [layout, setLayout] = useState<IndicatorLayout>({
    visible: false,
    trackHeight: 0,
    leftOffset: 0,
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
        setLayout({ visible: false, trackHeight: 0, leftOffset: 0 });
        return;
      }

      const contentRect = articleContent.getBoundingClientRect();
      const containerRect = articleContainer.getBoundingClientRect();

      // Gap between content left edge and container left edge (where border is)
      const gap = contentRect.left - containerRect.left;

      // Calculate track height (viewport minus navbar, padding, and indicator height)
      const stickyHeight = window.innerHeight - NAVBAR_HEIGHT;
      const trackHeight = Math.max(
        stickyHeight - PADDING * 2 - INDICATOR_HEIGHT,
        0,
      );

      // If gap < 64px, offset indicator to screen edge
      // Subtract 1 extra pixel to account for container's border width
      const leftOffset =
        gap >= MIN_GAP_FOR_BORDER ? 0 : -containerRect.left - 1;

      setLayout({ visible: true, trackHeight, leftOffset });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return layout;
}

function ReadingProgress() {
  const progress = useReadingProgress();
  const { visible, trackHeight, leftOffset } = useIndicatorLayout();
  const hasInitialized = useRef(false);
  const y = useMotionValue(0);

  // Animate indicator position based on progress
  const targetY = progress * trackHeight;

  useEffect(() => {
    if (trackHeight === 0) return;

    if (!hasInitialized.current) {
      y.set(targetY);
      hasInitialized.current = true;
    } else {
      animate(y, targetY, {
        type: "spring",
        stiffness: 300,
        damping: 30,
      });
    }
  }, [targetY, trackHeight, y]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden sm:block"
      aria-hidden="true"
    >
      <div
        className="sticky top-(--navbar-height) h-[calc(100vh-var(--navbar-height))]"
        style={{ padding: `${PADDING}px 0` }}
      >
        <motion.div
          className="w-5 rounded-r-full bg-(--container-border)"
          style={{ y, x: leftOffset, height: INDICATOR_HEIGHT }}
        />
      </div>
    </div>
  );
}

export default ReadingProgress;
