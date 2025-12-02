import { useMediaQuery } from "foxact/use-media-query";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { useMemo, type PropsWithChildren } from "react";
import {
  usePageIsOver,
  usePageScrollDirection,
} from "@/components/providers/scroll-detect";
import { Logo } from "./logo";
import { NavLinkList } from "./nav-link-list";
import { NavLinksDrawer } from "./nav-links-drawer";

const variants = {
  appear: (direction: "up" | "down") => {
    return {
      y: direction === "up" ? -20 : 20,
      opacity: 0,
    };
  },
  disappear: (direction: "up" | "down") => {
    return {
      y: direction === "up" ? 20 : -20,
      opacity: 0,
    };
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export type NavbarProps = PropsWithChildren<{
  url: URL;
  postInfo?: {
    title: string;
    tags: string[];
  };
}>;

export function Navbar({ url, postInfo, children }: NavbarProps) {
  const showPostInfo = usePageIsOver(300);
  const direction = usePageScrollDirection();

  const shouldShow = showPostInfo && Boolean(postInfo);
  const isDesktop = useMediaQuery("(width >= 768px)", true);

  const animateConfig: HTMLMotionProps<"div"> = {
    variants: variants,
    initial: "appear",
    animate: "visible",
    exit: "disappear",
    custom: direction,
    transition: {
      type: "spring",
      visualDuration: 0.2,
      bounce: 0.1,
    },
  };

  const linkListPart = useMemo(() => {
    if (isDesktop) {
      return <NavLinkList url={url} />;
    }
    if (shouldShow) {
      return <div></div>;
    }
    return <NavLinkList url={url} />;
  }, [isDesktop, shouldShow, url]);

  const logoPart = useMemo(() => {
    if (isDesktop) {
      return <Logo>{children}</Logo>;
    }
    if (shouldShow) {
      return <NavLinksDrawer url={url} />;
    }
    return <Logo>{children}</Logo>;
  }, [isDesktop, shouldShow]);

  return (
    <header className="fixed inset-x-0 top-0 z-30 h-[var(--navbar-height)] border-b border-container bg-background/70 backdrop-blur-lg">
      <section className="main-container flex h-full items-center justify-between px-6 py-4 text-content">
        <div className="flex min-w-0 shrink grow items-center gap-4">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={isDesktop ? String(false) : String(shouldShow)}
              initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {logoPart}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={String(shouldShow)}
              className="min-w-0 shrink grow"
              {...animateConfig}
            >
              {shouldShow ? (
                <div className="flex flex-col">
                  <small className="min-w-0 truncate text-xs">
                    <span className="text-gray-600/60 dark:text-gray-300/60">
                      {postInfo!.tags.map((tag) => `#${tag}`).join(" / ")}
                    </span>
                  </small>
                  <h2 className="min-w-0 truncate text-[1.1rem] leading-normal font-medium">
                    {postInfo!.title}
                  </h2>
                </div>
              ) : (
                <a href="/" className="text-2xl font-bold">
                  <span>Yunfi</span>
                </a>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={isDesktop ? String(false) : String(shouldShow)}
            {...animateConfig}
          >
            {linkListPart}
          </motion.div>
        </AnimatePresence>
      </section>
    </header>
  );
}
