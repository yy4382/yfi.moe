import clsx from "clsx";
import LinkActive from "@/components/ui/link-active";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";

export default function Navbar() {
  return (
    <header className="border-b border-container">
      <section className="main-container flex items-center justify-between px-6 py-4 text-content">
        <Link href="/" className="flex gap-4 text-2xl font-bold">
          <Image
            src={logo}
            alt="logo"
            className="h-8 w-8 rounded-lg"
            width={32}
            height={32}
          />
          Yunfi
        </Link>
        <ul className="flex list-none flex-nowrap gap-4">
          <li>
            <LinkActive
              href="/"
              className={clsx([
                "data-[active=true]:text-content-primary",
                "text-content-50 transition-colors hover:text-content-primary",
              ])}
            >
              Home
            </LinkActive>
          </li>
          <li>
            <LinkActive
              href="/post"
              className={clsx([
                "data-[active=true]:text-content-primary",
                "text-content-50 transition-colors hover:text-content-primary",
              ])}
            >
              Posts
            </LinkActive>
          </li>
        </ul>
      </section>
    </header>
  );
}
