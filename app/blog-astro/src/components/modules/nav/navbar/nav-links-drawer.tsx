import { MenuIcon } from "lucide-react";
import { VisuallyHidden } from "radix-ui";
import { useEffect, useState } from "react";
import { Drawer } from "vaul";
// https://github.com/emilkowalski/vaul/issues/602#issuecomment-3011987408
// also, since vaul doesn't export css, we have to patch it (using pnpm patch)
import "vaul/style.css";
import { cn } from "@/lib/utils/cn";
import { navLinks } from "./nav-link-list";

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
        className="border-container flex size-8 items-center justify-center rounded-lg border"
        onClick={(e) => {
          // https://github.com/shadcn-ui/ui/discussions/5953#discussioncomment-11919155
          e.currentTarget.blur();
        }}
      >
        <MenuIcon />
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40">
          <Drawer.Content className="z-60 bg-background fixed bottom-0 left-0 right-0 mt-24 flex h-fit flex-col rounded-t-[10px] outline-none">
            <div className="flex-1 rounded-t-[10px] px-8 py-4">
              <div
                aria-hidden
                className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-gray-300"
              />
              <div className="mx-auto mb-6 max-w-md">
                <Drawer.Title className="text-heading mb-4 text-lg font-medium">
                  前往……
                </Drawer.Title>
                <VisuallyHidden.Root>
                  <Drawer.Description>导航链接</Drawer.Description>
                </VisuallyHidden.Root>
                <ul className="flex flex-col">
                  {navLinks.map((link) => (
                    <li
                      key={link.href}
                      className="flex items-center justify-start"
                    >
                      <a
                        href={link.href}
                        className={cn([
                          "data-[active=true]:text-accent-foreground",
                          "text-muted-foreground hover:text-accent-foreground py-1.5 transition-colors",
                        ])}
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
