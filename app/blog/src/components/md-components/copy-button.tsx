import { useRef, useState } from "react";
import CheckLine from "~icons/mingcute/check-line";
import CopyLine from "~icons/mingcute/copy-2-line";
import CloseLine from "~icons/mingcute/close-line";
import { AnimatePresence, motion } from "motion/react";

export function CopyButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isCopied, setIsCopied] = useState<"idle" | "copied" | "error">("idle");
  const handleClick = () => {
    if (!buttonRef.current) return;
    const code = buttonRef.current.parentElement?.querySelector("code");
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
    isCopied === "copied"
      ? CheckLine
      : isCopied === "error"
        ? CloseLine
        : CopyLine;
  return (
    <motion.button
      onClick={handleClick}
      ref={buttonRef}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="absolute top-2 right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-portage-800 [&_svg]:pointer-events-none [&_svg]:size-4"
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
