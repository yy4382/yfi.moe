import React, { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { motion, AnimatePresence, type PanInfo } from "motion/react";

const AnimatedDialog = (props: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disableCloseAutoFocus?: boolean;
  triggerAsChild?: boolean;
  ariaDescription: string;
}) => {
  const {
    trigger,
    children,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
    triggerAsChild,
  } = props;
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const onOpenChange = isControlled ? controlledOnOpenChange : setInternalOpen;

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.y > 100 && onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild={triggerAsChild}>{trigger}</Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20 bg-[rgba(0,0,0,0.3)]"
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              onCloseAutoFocus={(event) => {
                if (props.disableCloseAutoFocus) {
                  event.preventDefault();
                }
              }}
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{
                  y: "100%",
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  visualDuration: 0.3,
                }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 100 }}
                dragElastic={0.4}
                dragSnapToOrigin={true}
                onDragEnd={handleDragEnd}
                className="fixed inset-0 top-[unset] z-50 mt-24 h-fit max-h-[90vh] shape-card !rounded-b-none bg-card p-8 pt-9 focus-visible:outline-none"
              >
                <VisuallyHidden.Root>
                  <Dialog.Title>{props.ariaDescription}</Dialog.Title>
                  <Dialog.Description>
                    {props.ariaDescription}
                  </Dialog.Description>
                </VisuallyHidden.Root>
                {children}
                <Dialog.Close asChild>
                  <div className="absolute top-1 left-1/2 translate-x-[-50%] p-3 outline-none">
                    <div className="h-1 w-16 rounded-full bg-gray-300 outline-none" />
                  </div>
                </Dialog.Close>
                {/* Dialog bottom padding, avoid showing base layer content when open with spring animation */}
                <div className="absolute inset-x-0 top-8 -bottom-48 z-[-10] bg-card will-change-transform"></div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};

export default AnimatedDialog;
