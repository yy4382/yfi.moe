import { cn } from "@/lib/utils/cn";

const navLinks = [
  {
    href: "/",
    label: "Home",
    active: (url: URL) => url.pathname === "/",
  },

  {
    href: "/post",
    label: "Posts",
    active: (url: URL) => url.pathname.startsWith("/post"),
  },
  {
    href: "/achieve",
    label: "Achieve",
    active: (url: URL) => url.pathname.startsWith("/achieve"),
  },
];

export function NavLinkList({ url }: { url: URL }) {
  return (
    <ul className="flex list-none flex-nowrap gap-4">
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            data-active={link.active(url)}
            className={cn([
              "data-[active=true]:text-accent-foreground",
              "text-muted-foreground transition-colors hover:text-accent-foreground",
            ])}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export { navLinks };
