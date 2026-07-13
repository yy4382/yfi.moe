import * as stylex from "@stylexjs/stylex";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
import "vaul/style.css";
import {
  colors,
  radii,
  spacing,
  typography,
} from "@repo/design-tokens/tokens.stylex";
import { MaskIcon } from "@/components/ui/mask-icon";
import { navLinks } from "./nav-link-list";

export function NavLinksDrawer({ url }: { url: URL }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    return () => {
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        aria-label="打开导航"
        {...stylex.props(styles.trigger)}
        onClick={(event) => event.currentTarget.blur()}
      >
        <MaskIcon name="lucide-menu" style={styles.menuIcon} />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay {...stylex.props(styles.overlay)}>
          <Drawer.Content {...stylex.props(styles.content)}>
            <div {...stylex.props(styles.panel)}>
              <div aria-hidden {...stylex.props(styles.handle)} />
              <div {...stylex.props(styles.nav)}>
                <Drawer.Title {...stylex.props(styles.title)}>
                  前往……
                </Drawer.Title>
                <VisuallyHidden.Root>
                  <Drawer.Description>导航链接</Drawer.Description>
                </VisuallyHidden.Root>
                <ul {...stylex.props(styles.list)}>
                  {navLinks.map((link) => (
                    <li key={link.href} {...stylex.props(styles.item)}>
                      <a
                        href={link.href}
                        {...stylex.props(
                          styles.link,
                          link.active(url) && styles.active,
                        )}
                        data-active={link.active(url)}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Overlay>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

const styles = stylex.create({
  trigger: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: colors.borderDefault,
    borderRadius: radii.lg,
    borderStyle: "solid",
    borderWidth: "1px",
    color: colors.textPrimary,
    cursor: "pointer",
    display: "flex",
    height: "2rem",
    justifyContent: "center",
    width: "2rem",
  },
  menuIcon: { height: "1.25rem", width: "1.25rem" },
  overlay: {
    backgroundColor: colors.overlayScrim,
    inset: 0,
    position: "fixed",
    zIndex: 50,
  },
  content: {
    backgroundColor: colors.canvas,
    borderStartEndRadius: "10px",
    borderStartStartRadius: "10px",
    bottom: 0,
    display: "flex",
    flexDirection: "column",
    height: "fit-content",
    left: 0,
    marginTop: "6rem",
    outline: "none",
    position: "fixed",
    right: 0,
    zIndex: 60,
  },
  panel: {
    borderStartEndRadius: "10px",
    borderStartStartRadius: "10px",
    flex: 1,
    paddingBlock: spacing.lg,
    paddingInline: spacing.xxl,
  },
  handle: {
    backgroundColor: colors.borderStrong,
    borderRadius: radii.round,
    flexShrink: 0,
    height: "0.375rem",
    marginBottom: spacing.xxl,
    marginInline: "auto",
    width: "3rem",
  },
  nav: { marginBottom: spacing.xl, marginInline: "auto", maxWidth: "28rem" },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizeLg,
    fontWeight: typography.weightMedium,
    marginBottom: spacing.lg,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  item: { alignItems: "center", display: "flex", justifyContent: "flex-start" },
  link: {
    color: colors.textMuted,
    paddingBlock: "0.375rem",
    textDecoration: "none",
    ":hover": { color: colors.accentText },
  },
  active: { color: colors.accentText },
});
