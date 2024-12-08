import { useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion, AnimatePresence } from "motion/react";

export default function (props: {
  content: React.ReactNode;
  trigger: React.ReactNode;
  useContentContainer?: boolean;
  controlledOpen?: boolean;
  onHoverStatusChange?: (hovering: boolean) => void;
  onTriggerClick?: () => void;
}) {
  const { controlledOpen, onHoverStatusChange, onTriggerClick } = props;
  const [isHovering, setIsHovering] = useState(false);
  const isOpen = controlledOpen ?? isHovering;

  function handleHoveringChange(hovering: boolean) {
    setIsHovering(hovering);
    onHoverStatusChange?.(hovering);
  }

  return (
    <Popover.Root open={isOpen}>
      <Popover.Trigger
        onClick={onTriggerClick}
        onPointerEnter={() => {
          handleHoveringChange(true);
        }}
        // On mobile, onPointerLeave is triggered when user lifts finger from the screen,
        // but onMouseLeave is triggered when user clicks outside the trigger.
        // So we need to check if onTriggerClick is defined to determine whether to trigger onPointerLeave or onMouseLeave.
        onPointerLeave={() => {
          if (onTriggerClick !== undefined) handleHoveringChange(false);
        }}
        onMouseLeave={() => {
          if (onTriggerClick === undefined) handleHoveringChange(false);
        }}
      >
        {props.trigger}
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
                className={
                  props.useContentContainer
                    ? "shape-card border-2 bg-card p-2 text-sm text-content dark:border-gray-700"
                    : ""
                }
              >
                {props.content}
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
}
