import { useState } from "react";
import { motion } from "framer-motion";
import MingcuteLinkLine from "@assets/icons/mingcute-link-line.svg?react";
import MingcuteCheckboxLine from "@assets/icons/mingcute-checkbox-line.svg?react";
import MingcuteClipboardLine from "@assets/icons/mingcute-clipboard-line.svg?react";
import MingcuteCloseSquareLine from "@assets/icons/mingcute-close-square-line.svg?react";
import Tooltip from "@comp/ui/Tooltip/Tooltip";

export default function (props: { uriPath: string }) {
  const [isHovering, setIsHovering] = useState(false);
  const [isShowingCopyStatus, setIsShowingCopyStatus] = useState(false);
  const isOpen = isHovering || isShowingCopyStatus;

  const [isCopySuccess, setIsCopySuccess] = useState(true);
  function handleCopyLink() {
    setIsShowingCopyStatus(true);
    try {
      navigator.clipboard.writeText(
        new URL(props.uriPath, window.location.origin).toString(),
      );
      setIsCopySuccess(true);
    } catch (error) {
      console.error(error);
      setIsCopySuccess(false);
    }
    setTimeout(() => {
      setIsShowingCopyStatus(false);
    }, 2000);
  }
  return (
    <Tooltip
      controlledOpen={isOpen}
      onHoverStatusChange={(hovering) => {
        setIsHovering(hovering);
      }}
      onTriggerClick={() => {
        handleCopyLink();
      }}
      useContentContainer
      trigger={
        <div className="group flex size-8 rounded-md bg-primary/30 p-1 center">
          <motion.div className="transition-transform group-hover:scale-110 group-active:scale-95">
            <MingcuteLinkLine className="size-5 text-primary" />
          </motion.div>
        </div>
      }
      content={
        <div className="flex gap-2 center">
          {isShowingCopyStatus ? (
            isCopySuccess ? (
              <>
                <MingcuteCheckboxLine className="size-[1.2em] text-green-500" />
                <span className="text-sm text-comment">
                  Permanent link copied
                </span>
              </>
            ) : (
              <>
                <MingcuteCloseSquareLine className="size-[1.2em] text-red-500" />
                <span className="text-sm text-comment">Copy link failed</span>
              </>
            )
          ) : (
            <>
              <MingcuteClipboardLine className="size-[1.2em]" />
              <span className="text-sm text-comment">Copy link to note</span>
            </>
          )}
        </div>
      }
    ></Tooltip>
  );
}
