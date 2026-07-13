"use client";

import * as stylex from "@stylexjs/stylex";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  colors,
  motion as motionTokens,
  radii,
  spacing,
} from "@repo/design-tokens/tokens.stylex";
import { MaskIcon, type AppIconName } from "@/components/ui/mask-icon";

const styles = stylex.create({
  button: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderRadius: radii.lg,
    cursor: "pointer",
    display: "inline-flex",
    height: "2rem",
    insetBlockStart: spacing.sm,
    insetInlineEnd: spacing.sm,
    justifyContent: "center",
    position: "absolute",
    transitionDuration: motionTokens.durationFast,
    transitionProperty: "background-color, color",
    color: colors.textSecondary,
    width: "2rem",
    ":hover": {
      backgroundColor: colors.surfaceInteractiveHover,
      color: colors.accentText,
    },
  },
  iconWrap: { display: "inline-flex" },
  icon: { height: "1rem", width: "1rem" },
});

export function CopyButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isCopied, setIsCopied] = useState<"idle" | "copied" | "error">("idle");

  useEffect(() => {
    if (isCopied === "idle") return;
    const timeout = window.setTimeout(() => setIsCopied("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  const handleClick = () => {
    if (!buttonRef.current) return;
    const code = buttonRef.current.closest("pre")?.querySelector("code");
    if (!code) return;
    if (code.innerText.trim() === "") return;
    navigator.clipboard
      .writeText(code.innerText)
      .then(() => {
        setIsCopied("copied");
      })
      .catch(() => {
        setIsCopied("error");
      });
  };
  const iconName: AppIconName =
    isCopied === "copied"
      ? "lucide-check"
      : isCopied === "error"
        ? "lucide-x"
        : "lucide-copy";
  const label =
    isCopied === "copied"
      ? "已复制"
      : isCopied === "error"
        ? "复制失败"
        : "复制代码";
  return (
    <motion.button
      aria-label={label}
      type="button"
      onClick={handleClick}
      ref={buttonRef}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...stylex.props(styles.button)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isCopied}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          transition={{ duration: 0.15 }}
          {...stylex.props(styles.iconWrap)}
        >
          <MaskIcon name={iconName} style={styles.icon} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
