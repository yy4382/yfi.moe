import * as stylex from "@stylexjs/stylex";
import { useMediaQuery } from "foxact/use-media-query";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { useMemo, type PropsWithChildren } from "react";
import { colors, spacing, typography } from "@repo/design-tokens/tokens.stylex";
import {
  usePageIsOver,
  usePageScrollDirection,
} from "@/components/providers/scroll-detect";
import { layout } from "@/styles/shared.stylex";
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
  }, [isDesktop, shouldShow, children, url]);

  return (
    <header {...stylex.props(styles.header)}>
      <section {...stylex.props(layout.mainContainer, styles.section)}>
        <div {...stylex.props(styles.leading)}>
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={isDesktop ? String(false) : String(shouldShow)}
              initial={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
              animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
              exit={{ opacity: 0, filter: "blur(4px)", scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              {...stylex.props(styles.motionItem)}
            >
              {logoPart}
            </motion.div>
          </AnimatePresence>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={String(shouldShow)}
              {...stylex.props(styles.titleArea)}
              {...animateConfig}
            >
              {shouldShow ? (
                <div {...stylex.props(styles.postInfo)}>
                  <small {...stylex.props(styles.ellipsis, styles.tags)}>
                    <span>
                      {postInfo!.tags.map((tag) => `#${tag}`).join(" / ")}
                    </span>
                  </small>
                  <h2 {...stylex.props(styles.ellipsis, styles.postTitle)}>
                    {postInfo!.title}
                  </h2>
                </div>
              ) : (
                <a href="/" {...stylex.props(styles.brand)}>
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

const styles = stylex.create({
  header: {
    backdropFilter: "blur(16px)",
    backgroundColor: "color-mix(in srgb, var(--color-canvas) 70%, transparent)",
    borderBottomColor: colors.borderDefault,
    borderBottomStyle: "solid",
    borderBottomWidth: "1px",
    height: "var(--navbar-height)",
    insetInline: 0,
    position: "fixed",
    top: 0,
    zIndex: 30,
  },
  section: {
    alignItems: "center",
    color: colors.textPrimary,
    display: "flex",
    height: "100%",
    justifyContent: "space-between",
    paddingBlock: spacing.lg,
    paddingInline: spacing.xl,
  },
  leading: {
    alignItems: "center",
    display: "flex",
    flexGrow: 1,
    flexShrink: 1,
    gap: spacing.lg,
    minWidth: 0,
  },
  motionItem: { flexShrink: 0 },
  titleArea: { flexGrow: 1, flexShrink: 1, minWidth: 0 },
  postInfo: { display: "flex", flexDirection: "column" },
  ellipsis: {
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  tags: { color: colors.textMuted, fontSize: typography.sizeXs, opacity: 0.7 },
  postTitle: {
    fontSize: "1.1rem",
    fontWeight: typography.weightMedium,
    lineHeight: typography.lineNormal,
    margin: 0,
  },
  brand: {
    fontSize: typography.sizeXxl,
    fontWeight: typography.weightBold,
    textDecoration: "none",
  },
});
