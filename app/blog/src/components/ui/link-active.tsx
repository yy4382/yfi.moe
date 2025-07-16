"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps } from "react";

export default function LinkActive(prop: ComponentProps<typeof Link>) {
  const { href, ...rest } = prop;
  const pathname = usePathname();
  const active = isActive(href.toString(), pathname);
  return <Link href={href} {...rest} data-active={active} />;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === href;
  return pathname.startsWith(href);
}
