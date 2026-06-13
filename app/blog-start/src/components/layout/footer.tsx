"use client";

import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { siteConfig, siteDomain } from "@/config/site";

export function Footer() {
  return (
    <div className="main-container flex flex-col-reverse items-center justify-between gap-6 px-6 py-4 md:flex-row">
      <Link to="/" className="flex gap-4 text-2xl font-bold">
        <img src={logo} alt="logo" className="h-8 w-8 rounded-lg" />
        Yunfi
      </Link>
      <div className="flex w-full flex-shrink flex-grow flex-col items-start gap-8 md:w-[unset] md:items-end md:gap-2">
        <ul className="flex flex-col items-start gap-x-6 gap-y-1 self-center text-comment md:self-end lg:flex-row lg:items-end">
          <li>
            <span className="inline-flex items-center font-medium text-content">
              关于
              <span className="i-lucide-chevron-right size-4" />
            </span>
            <span className="inline-flex gap-2">
              <Link to="/about">关于我</Link>
              <a href="/about#关于本站">关于本站</a>
              <a href="https://github.com/yy4382/yfi.moe">本站源码</a>
            </span>
          </li>
          <li>
            <span className="inline-flex items-center font-medium text-content">
              联系
              <span className="i-lucide-chevron-right size-4" />
            </span>
            <span className="inline-flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard
                    .writeText("yy4382@gmail.com")
                    .then(() => toast.success("复制邮箱成功"))
                    .catch(() =>
                      toast.error("复制失败，可能您没有使用 HTTPS 访问"),
                    );
                }}
              >
                发邮件
              </button>
              <a href="https://t.me/YunfiDiscuz">Telegram</a>
              <a href="https://github.com/yy4382">GitHub</a>
            </span>
          </li>
        </ul>
        <div className="flex flex-col items-center self-center text-sm md:items-end md:self-end">
          <span className="inline-flex items-center gap-x-1 text-comment">
            <span className="inline-flex items-center gap-0.5">
              <span className="i-lucide-copyright size-4" />
              2023-2024
              <span>
                <a href={siteDomain} className="underline">
                  {" "}
                  {siteConfig.title}
                </a>
                .
              </span>
            </span>
            <span className="opacity-70">|</span>
            <a href="/feed.xml" className="inline-flex items-center gap-0.5">
              <span className="i-lucide-rss size-4" />
              RSS
            </a>
            <span className="opacity-70">|</span>
            <a
              href="/sitemap-index.xml"
              className="inline-flex items-center gap-0.5"
            >
              <span className="i-lucide-map size-4" />
              Site Map
            </a>
          </span>
          <span className="text-comment">
            Powered by{" "}
            <a href="https://tanstack.com/start" className="underline">
              TanStack Start
            </a>
            . See all{" "}
            <Link to="/credits" className="underline">
              Credits
            </Link>
            .
          </span>
        </div>
      </div>
    </div>
  );
}
