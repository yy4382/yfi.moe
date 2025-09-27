"use client";

import { CheckIcon, CopyIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

export function CopyButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isCopied, setIsCopied] = useState<"idle" | "copied" | "error">("idle");
  const handleClick = () => {
    if (!buttonRef.current) return;
    const code = buttonRef.current.closest("pre")?.querySelector("code");
    if (!code) return;
    if (code.innerText.trim() === "") return;
    navigator.clipboard
      .writeText(code.innerText)
      .then(() => {
        setIsCopied("copied");
        setTimeout(() => {
          setIsCopied("idle");
        }, 2000);
      })
      .catch(() => {
        setIsCopied("error");
      });
  };
  const Icon =
    isCopied === "copied" ? CheckIcon : isCopied === "error" ? XIcon : CopyIcon;
  return (
    <motion.button
      onClick={handleClick}
      ref={buttonRef}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="hover:bg-accent-foreground absolute right-2 top-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors [&_svg]:pointer-events-none [&_svg]:size-4"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isCopied}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.15 }}
        >
          <Icon />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}
