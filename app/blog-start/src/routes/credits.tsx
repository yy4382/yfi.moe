import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/article/page-shell";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/credits")({
  head: () =>
    buildSeo({
      title: "致谢",
      type: "article",
      canonical: "https://yfi.moe/credits",
    }),
  component: CreditsPage,
});

function CreditsPage() {
  return (
    <PageShell title="致谢" pathname="/credits">
      <h2 id="技术栈">技术栈</h2>
      <p>网站用到的技术主要包括：</p>
      <ul>
        <li>
          Meta Framework 与主要模板语言:{" "}
          <a href="https://tanstack.com/start">TanStack Start</a>
        </li>
        <li>
          CSS Framework: <a href="https://tailwindcss.com/">Tailwind CSS</a>
        </li>
        <li>
          动态元素：<a href="https://react.dev/">React</a>
        </li>
        <li>
          Markdown 工具链：
          <a href="https://unifiedjs.com/">unified.js</a>
        </li>
      </ul>
      <p>后端（主要用于评论系统）：</p>
      <ul>
        <li>
          HTTP Router: <a href="https://hono.dev/">Hono</a>
        </li>
        <li>
          ORM: <a href="https://drizzle.team/">Drizzle</a>
        </li>
        <li>
          Auth: <a href="https://betterauth.dev/">BetterAuth</a>
        </li>
        <li>
          Database: <a href="https://github.com/tursodatabase/libsql">libsql</a>
        </li>
      </ul>
      <p>另一些值得一提的使用的库和工具：</p>
      <ul>
        <li>
          网页字体分割：
          <a href="https://github.com/KonghaYao/cn-font-split">cn-font-split</a>
        </li>
        <li>
          OpenGraph 图片生成：
          <a href="https://github.com/vercel/satori">satori</a>
        </li>
        <li>
          React 动画库：<a href="https://motion.dev/">Motion</a>
        </li>
      </ul>
      <p>这些都是开源项目，感谢它们的作者和维护者。</p>
      <h2 id="界面设计">界面设计</h2>
      <p>
        网站的主要设计参考的是 <a href="https://voidzero.dev">Void Zero</a>{" "}
        的落地页。
      </p>
      <p>
        评论区和一些动效设计参考了{" "}
        <a href="https://github.com/innei/Shiro">Shiro</a>。
      </p>
    </PageShell>
  );
}
