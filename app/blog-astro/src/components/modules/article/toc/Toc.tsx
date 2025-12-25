"use client";

import { ListIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect, useRef, useMemo } from "react";
import type { MarkdownHeading } from "@repo/markdown/parse";
import {
  Popover,
  PopoverPortal,
  PopoverPositioner,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/motion-popover";
import { throttle } from "@/lib/utils/debounce";
import TocEntry from "./TocEntry";

function useHeading(headingsInput: MarkdownHeading[]) {
  const [headings] = useState<MarkdownHeading[]>(headingsInput);
  const [isVisible, setIsVisible] = useState<boolean[]>(
    Array(headings.length).fill(false),
  );
  const headersRef = useRef<HTMLElement[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastActiveIndexRef = useRef<number>(0);

  useEffect(() => {
    const headersWithUn: (HTMLElement | null)[] = headings.map((heading) =>
      document.getElementById(heading.slug),
    );
    headersRef.current = headersWithUn.filter(
      (header): header is HTMLElement => header !== null,
    );

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = headings.findIndex(
            (heading) => entry.target.id === heading.slug,
          );
          if (index === -1) return;
          setIsVisible((prev) => {
            const newIsVisible = [...prev];
            newIsVisible[index] = entry.isIntersecting;
            return newIsVisible;
          });
        });
      },
      {
        rootMargin: "-80px 0px 0px 0px",
      },
    );

    headersRef.current.forEach((header) => {
      if (header) {
        observerRef.current?.observe(header);
      }
    });

    return () => {
      headersRef.current.forEach((header) => {
        if (header) {
          observerRef.current?.unobserve(header);
        }
      });
    };
  }, [headings]);

  const activeIndex = useMemo(() => {
    const index = isVisible.findIndex((visible) => visible);
    if (index !== -1) {
      // eslint-disable-next-line react-hooks/refs
      lastActiveIndexRef.current = index;
      return index;
    }
    // eslint-disable-next-line react-hooks/refs
    return lastActiveIndexRef.current;
  }, [isVisible]);

  return activeIndex;
}

const Toc: React.FC<{
  headings: MarkdownHeading[];
}> = ({ headings }) => {
  const activeIndex = useHeading(headings);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const thresholdRef = useRef(60);

  useEffect(() => {
    const navbarHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--navbar-height",
      ),
    );
    if (!isNaN(navbarHeight)) {
      thresholdRef.current = navbarHeight - 20;
    }
  }, []);

  useEffect(() => {
    const checkPosition = throttle(() => {
      if (!buttonRef.current || !isOpen) return;

      const rect = buttonRef.current.getBoundingClientRect();
      if (rect.top < thresholdRef.current && rect.top >= 0) {
        setIsOpen(false);
      }
    }, 100);

    window.addEventListener("scroll", checkPosition, { passive: true });
    return () => window.removeEventListener("scroll", checkPosition);
  }, [isOpen]);

  return (
    <Popover modal={false} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="flex size-10 center border-b border-l border-container bg-background"
        ref={buttonRef}
      >
        <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <ListIcon className="size-6 text-heading" />
        </motion.span>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverPositioner sideOffset={5} className="z-50">
          <PopoverPopup
            transition={{
              type: "spring",
              visualDuration: 0.15,
              bounce: 0.2,
            }}
          >
            <div className="toc-card w-76 border border-container bg-background px-6 py-8">
              <TocEntry headings={headings} activeIndex={activeIndex} />
            </div>
          </PopoverPopup>
        </PopoverPositioner>
      </PopoverPortal>
    </Popover>
  );
};

export default Toc;
