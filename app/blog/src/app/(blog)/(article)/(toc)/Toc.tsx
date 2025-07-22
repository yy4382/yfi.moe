"use client";

import TocEntry from "./TocEntry";
import { useState, useEffect, useRef, useMemo } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { motion } from "motion/react";
import type { MarkdownHeading } from "@repo/markdown/parse";
import { ListIcon } from "lucide-react";

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
      lastActiveIndexRef.current = index;
      return index;
    }
    return lastActiveIndexRef.current;
  }, [isVisible]);

  return activeIndex;
}

const Toc: React.FC<{
  headings: MarkdownHeading[];
}> = ({ headings }) => {
  const activeIndex = useHeading(headings);

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <button className="flex size-10 center border-b border-l border-container bg-bg">
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ListIcon className="size-6 text-heading" />
          </motion.span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={5}
        asChild
        collisionPadding={5}
        align="end"
        side="bottom"
        alignOffset={-10}
      >
        <div className="toc-card w-76 border border-container bg-bg px-6 py-8">
          <TocEntry headings={headings} activeIndex={activeIndex} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Toc;
