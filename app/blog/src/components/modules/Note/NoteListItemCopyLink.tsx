import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "framer-motion";
import MingcuteLinkLine from "@assets/icons/mingcute-link-line.svg?react";
import MingcuteCheckboxLine from "@assets/icons/mingcute-checkbox-line.svg?react";
import MingcuteClipboardLine from "@assets/icons/mingcute-clipboard-line.svg?react";

export default function (props: { uriPath: string }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isShowingCopyStatus, setIsShowingCopyStatus] = useState(false);
  const isOpen = isHovering || isShowingCopyStatus;
  function handleCopyLink() {
    setIsShowingCopyStatus(true);
    navigator.clipboard.writeText(
      new URL(props.uriPath, window.location.origin).toString(),
    );
    setTimeout(() => {
      setIsShowingCopyStatus(false);
    }, 2000);
  }
  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger
        onClick={handleCopyLink}
        onPointerEnter={() => {
          setIsHovering(true);
        }}
        onPointerLeave={() => {
          setIsHovering(false);
        }}
        onTouchEnd={() => {
          setIsHovering(false);
        }}
        className="group flex size-8 rounded-md bg-primary/30 p-1 center"
      >
        <motion.div className="transition-transform group-hover:scale-110 group-active:scale-95">
          <MingcuteLinkLine className="size-5 text-primary" />
        </motion.div>
      </Popover.Trigger>
      <AnimatePresence>
        {isOpen && (
          <Popover.Portal forceMount>
            <Popover.Content
              forceMount
              asChild
              side={"top"}
              sideOffset={4}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              onCloseAutoFocus={(e) => {
                e.preventDefault();
              }}
              collisionPadding={4}
            >
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex gap-2 rounded-md border border-gray-300 bg-popover p-2 text-content center dark:border-gray-700">
                  {isShowingCopyStatus ? (
                    <>
                      <MingcuteCheckboxLine className="size-[1.2em] text-green-500" />
                      <span className="text-sm text-comment">
                        Permanent link copied
                      </span>
                    </>
                  ) : (
                    <>
                      <MingcuteClipboardLine className="size-[1.2em]" />
                      <span className="text-sm text-comment">
                        Copy link to note
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
