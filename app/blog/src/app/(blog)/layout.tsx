import logo from "@/assets/logo.png";
import LinkActive from "@/components/ui/link-active";
import { siteConfig, siteDomain } from "@/config/site";
import clsx from "clsx";
import {
  ChevronRightIcon,
  CopyrightIcon,
  MapIcon,
  RssIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CopyEmail from "./copy-email";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="m-0 overflow-x-hidden bg-bg bg-fixed p-0 text-content">
      <div className="grid min-h-[100lvh] grid-rows-[auto_auto_1fr_auto]">
        <Navbar />
        <div className="w-full">{children}</div>
        <section className="h-full min-h-12 bg-grid border-b border-container" />
        <Footer />
      </div>
    </div>
  );
}

function Navbar() {
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
              href="/posts"
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

function Footer() {
  return (
    <div className="main-container flex flex-col-reverse items-center justify-between gap-6 px-6 py-4 md:flex-row">
      <Link href="/" className="flex gap-4 text-2xl font-bold" prefetch={false}>
        <Image
          src={logo}
          alt="logo"
          className="h-8 w-8 rounded-lg"
          width={32}
          height={32}
        />
        Yunfi
      </Link>
      <div className="flex w-full flex-shrink flex-grow flex-col items-start gap-8 md:w-[unset] md:items-end md:gap-2">
        <ul className="flex flex-col items-start gap-x-6 gap-y-1 text-comment lg:flex-row lg:items-end">
          <li>
            <span className="inline-flex items-center font-medium text-content">
              关于
              <ChevronRightIcon size={16} />
            </span>
            <span className="inline-flex gap-2">
              <Link href="/about" prefetch={false}>
                关于我
              </Link>
              <Link href="/site-history" prefetch={false}>
                关于本站
              </Link>
              <Link href="https://github.com/yy4382/yfi.moe" prefetch={false}>
                本站源码
              </Link>
            </span>
          </li>
          <li>
            <span className="inline-flex items-center font-medium text-content">
              联系
              <ChevronRightIcon size={16} />
            </span>
            <span className="inline-flex gap-2">
              <CopyEmail email="yy4382@gmail.com">发邮件</CopyEmail>
              <a href="https://t.me/YunfiDiscuz">Telegram</a>
              <a href="https://github.com/yy4382">GitHub</a>
            </span>
          </li>
        </ul>
        <div className="flex flex-col items-center self-center text-sm md:items-end md:self-end">
          <span className="inline-flex items-center gap-x-1 text-comment">
            <span className="inline-flex items-center gap-0.5">
              <CopyrightIcon size={16} /> 2023-2024
              <span>
                <a href={siteDomain} className="underline">
                  {siteConfig.title}
                </a>
                .
              </span>
            </span>
            <span className="opacity-70">|</span>
            <Link
              href="/feed.xml"
              className="inline-flex items-center gap-0.5"
              prefetch={false}
            >
              <RssIcon size={16} />
              RSS
            </Link>
            <span className="opacity-70">|</span>
            <Link
              href="/sitemap.xml"
              className="inline-flex items-center gap-0.5"
              prefetch={false}
            >
              <MapIcon size={16} />
              Site Map
            </Link>
          </span>
          <span className="text-comment">
            Powered by{" "}
            <a href="https://nextjs.org" className="underline">
              Next.js
            </a>
            . See all{" "}
            <Link href="/credits" className="underline" prefetch={false}>
              Credits
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
