"use client";

import { Loader2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useLinkStatus } from "next/link";
import { PropsWithChildren } from "react";

export function PrevNextIndicator({ children }: PropsWithChildren) {
  const { pending } = useLinkStatus();
  const Icon = pending ? (
    <Loader2Icon className="animate-spin" size={36} />
  ) : (
    children
  );

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          initial={{ opacity: 0, scale: 0 }}
          exit={{ opacity: 0, scale: 0, transition: { delay: 0.2 } }}
          key={String(pending)}
        >
          {Icon}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
