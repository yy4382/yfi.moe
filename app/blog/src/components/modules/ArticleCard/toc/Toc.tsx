import TocEntry from "./TocEntry";
import { useState, useEffect, useRef, useMemo } from "react";
import type { MarkdownHeading } from "astro";
import MingcuteListCheckLine from "~icons/mingcute/list-check-line";
import {
  Root as DpRoot,
  Trigger as DpTrigger,
  Portal as DpPortal,
  Content as DpContent,
} from "@radix-ui/react-dropdown-menu";

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
    <DpRoot modal={false}>
      <DpTrigger asChild>
        <button className="flex size-10 center border-b border-l border-container bg-bg">
          <MingcuteListCheckLine className="size-6 text-heading" />
        </button>
      </DpTrigger>
      <DpPortal>
        <DpContent sideOffset={5} asChild collisionPadding={5}>
          <div className="toc-card w-76 border border-container bg-bg px-6 py-8">
            <TocEntry headings={headings} activeIndex={activeIndex} />
          </div>
        </DpContent>
      </DpPortal>
    </DpRoot>
  );
};

export default Toc;
