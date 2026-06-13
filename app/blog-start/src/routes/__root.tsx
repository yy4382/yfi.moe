import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import markdownCss from "@repo/markdown/style?url";
import { Analytics } from "@/components/layout/analytics";
import { LoadingIndicator } from "@/components/layout/loading-indicator";
import { NoFlashThemeScript } from "@/components/layout/no-flash-theme-script";
import { QueryProvider } from "@/components/providers/query-provider";
import { siteConfig } from "@/config/site";
import appCss from "@/styles/global.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width" },
      { name: "color-scheme", content: "light dark" },
      { name: "generator", content: "TanStack Start" },
      { title: siteConfig.title },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: markdownCss },
      { rel: "sitemap", href: "/sitemap-index.xml" },
      { rel: "alternate", type: "application/rss+xml", href: "/feed.xml" },
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        href: "/favicon-32.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        href: "/favicon-16.png",
      },
      { rel: "icon", href: "/favicon.ico" },
      {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/apple-touch-icon-180.png",
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  return (
    <RootDocument pathname={pathname}>
      <QueryProvider>
        <Outlet />
        <Toaster theme="system" />
      </QueryProvider>
    </RootDocument>
  );
}

function RootDocument({
  children,
  pathname,
}: Readonly<{ children: ReactNode; pathname: string }>) {
  return (
    <html lang="zh-Hans" suppressHydrationWarning>
      <head>
        <NoFlashThemeScript />
        <HeadContent />
        <Analytics pathname={pathname} />
      </head>
      <body className="m-0 overflow-x-hidden bg-background bg-fixed p-0 text-content">
        <LoadingIndicator />
        {children}
        <Scripts />
      </body>
    </html>
  );
}
