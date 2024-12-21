import DialogMobile from "@comp/ui/Dialog/Dialog";
import { card } from "@styles/tv";
import TocEntry from "./TocEntry";
import { useState, useEffect, useRef, useMemo } from "react";
import type { MarkdownHeading } from "astro";
import useBreakpoints, { breakpointsTailwind } from "@utils/useBreakpoints";
import MingcuteListCheckLine from "~icons/mingcute/list-check-line";
import { motion } from "motion/react";

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
        header.style.scrollMarginTop = "5rem";
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
  const breakpoints = useBreakpoints(breakpointsTailwind);
  const shouldMount = breakpoints.smaller("lg");

  const activeIndex = useHeading(headings);
  const [open, setOpen] = useState(false);

  const onClickLink = () => {
    setTimeout(() => {
      setOpen(false);
    }, 50);
  };

  const { base, heading } = card({ padding: "sm" });

  if (!shouldMount) {
    return (
      <div className={base()}>
        <div
          className={`${heading()} block pb-2 transition-[color] hover:text-primary`}
        >
          <h5>目录</h5>
        </div>
        <TocEntry
          headings={headings}
          activeIndex={activeIndex}
          onClickLink={onClickLink}
        />
      </div>
    );
  }

  return (
    <DialogMobile
      open={open}
      onOpenChange={setOpen}
      disableCloseAutoFocus
      triggerAsChild
      ariaDescription="table of contents"
      trigger={
        <motion.button
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            default: { type: "spring", bounce: 0.5, duration: 0.7, delay: 0.5 },
            opacity: { ease: "linear", duration: 0.3, delay: 0.5 },
          }}
          className="fixed right-4 bottom-4 z-20 shape-card border bg-card p-2 dark:border-gray-600"
          onClick={() => setOpen(true)}
        >
          <MingcuteListCheckLine className="size-6 text-heading" />
        </motion.button>
      }
    >
      <TocEntry
        headings={headings}
        activeIndex={activeIndex}
        onClickLink={onClickLink}
      />
    </DialogMobile>
  );
};

export default Toc;
