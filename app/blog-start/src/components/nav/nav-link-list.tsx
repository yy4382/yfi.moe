"use client";

import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils/cn";

const navLinks = [
  {
    href: "/",
    label: "Home",
    active: (pathname: string) => pathname === "/",
  },

  {
    href: "/post",
    label: "Posts",
    active: (pathname: string) => pathname.startsWith("/post"),
  },
  {
    href: "/archive",
    label: "Archive",
    active: (pathname: string) => pathname.startsWith("/archive"),
  },
];

export function NavLinkList({ pathname }: { pathname: string }) {
  return (
    <ul className="flex list-none flex-nowrap gap-4">
      {navLinks.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            data-active={link.active(pathname)}
            className={cn([
              "data-[active=true]:text-accent-foreground",
              "text-muted-foreground transition-colors hover:text-accent-foreground",
            ])}
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { navLinks };
