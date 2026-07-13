import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface AnimateChangeInHeightProps {
  children: React.ReactNode;
  duration?: number;
  stylexStyle?: stylex.StyleXStyles;
}

/** Smoothly follows the measured height of its content. */
export function AutoResizeHeight({
  children,
  duration = 0.6,
  stylexStyle,
}: AnimateChangeInHeightProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const observedHeight = entries[0]?.contentRect.height;
      if (observedHeight !== undefined) setHeight(observedHeight);
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <motion.div
      {...stylex.props(styles.root, stylexStyle)}
      style={{ height }}
      initial={false}
      animate={{ height }}
      transition={{ duration, ease: "easeOut" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
}

const styles = stylex.create({ root: { overflow: "hidden" } });
