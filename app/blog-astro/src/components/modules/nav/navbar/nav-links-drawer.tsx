import * as stylex from "@stylexjs/stylex";
import { MenuIcon } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
// https://github.com/emilkowalski/vaul/issues/602#issuecomment-3011987408
// also, since vaul doesn't export css, we have to patch it (using pnpm patch)
import "vaul/style.css";
import { navLinks } from "./nav-link-list";
import { styles } from "./nav-links-drawer.stylex";

export function NavLinksDrawer({ url }: { url: URL }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;

    // Disable smooth scrolling so Radix's scroll restoration does not animate.
    root.style.scrollBehavior = "auto";

    return () => {
      root.style.scrollBehavior = previousScrollBehavior;
    };
  }, [open]);

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger
        {...stylex.props(styles.trigger)}
        onClick={(e) => {
          // https://github.com/shadcn-ui/ui/discussions/5953#discussioncomment-11919155
          e.currentTarget.blur();
        }}
      >
        <MenuIcon />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay {...stylex.props(styles.overlay)}>
          <Drawer.Content {...stylex.props(styles.content)}>
            <div {...stylex.props(styles.panel)}>
              <div aria-hidden {...stylex.props(styles.handle)} />
              <div {...stylex.props(styles.body)}>
                <Drawer.Title {...stylex.props(styles.title)}>
                  前往……
                </Drawer.Title>
                <VisuallyHidden.Root>
                  <Drawer.Description>导航链接</Drawer.Description>
                </VisuallyHidden.Root>
                <ul {...stylex.props(styles.list)}>
                  {navLinks.map((link) => {
                    const active = link.active(url);
                    return (
                      <li key={link.href} {...stylex.props(styles.item)}>
                        <a
                          href={link.href}
                          data-active={active}
                          {...stylex.props(
                            styles.link,
                            active && styles.active,
                          )}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Overlay>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
