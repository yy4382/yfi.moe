import * as stylex from "@stylexjs/stylex";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { styles as transitionStyles } from "./auto-resize-height.stylex";

interface AnimateChangeInHeightProps {
  children: React.ReactNode;
  className?: string;
  styles?: stylex.StyleXStyles;
  duration?: number;
}

/**
 * A component that automatically adjusts its height based on the content inside it,
 * with smooth transitions when the height changes.
 *
 * Caveats:
 * - The content inside should not use `margin-top` or `margin-bottom`, as this can interfere with height calculations.
 */
export const AutoResizeHeight: React.FC<AnimateChangeInHeightProps> = ({
  children,
  className,
  styles,
  duration = 0.6,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number | "auto">("auto");

  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        const observedHeight = entries[0].contentRect.height;
        setHeight(observedHeight);
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  const styleProps = stylex.props(transitionStyles.root, styles);

  return (
    <motion.div
      {...styleProps}
      className={cn(styleProps.className, className)}
      style={{ ...styleProps.style, height }}
      initial={false}
      animate={{ height }}
      transition={{ duration, ease: "easeOut" }}
    >
      <div ref={containerRef}>{children}</div>
    </motion.div>
  );
};
