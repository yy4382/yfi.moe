import {
  ChevronRightIcon,
  CopyrightIcon,
  MapIcon,
  RssIcon,
} from "lucide-react";
import CopyEmail from "./copy-email";
import { siteConfig, siteDomain } from "@/config/site";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";

export default function Footer() {
  return (
    <div className="main-container flex flex-col-reverse items-center justify-between gap-6 px-6 py-4 md:flex-row">
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
      <div className="flex w-full flex-shrink flex-grow flex-col items-start gap-8 md:w-[unset] md:items-end md:gap-2">
        <ul className="flex flex-col items-start gap-x-6 gap-y-1 text-comment lg:flex-row lg:items-end">
          <li>
            <span className="inline-flex items-center font-medium text-content">
              关于
              <ChevronRightIcon size={16} />
            </span>
            <span className="inline-flex gap-2">
              <Link href="/about">关于我</Link>
              <Link href="/site-history">关于本站</Link>
              <Link href="https://github.com/yy4382/yfi.moe">本站源码</Link>
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
            <Link href="/feed.xml" className="inline-flex items-center gap-0.5">
              <RssIcon size={16} />
              RSS
            </Link>
            <span className="opacity-70">|</span>
            <Link
              href="/sitemap.xml"
              className="inline-flex items-center gap-0.5"
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
            <Link href="/credits" className="underline">
              Credits
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
