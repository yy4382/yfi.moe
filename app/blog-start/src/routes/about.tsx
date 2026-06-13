import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/article/page-shell";
import { contactInfo } from "@/config/author";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    buildSeo({
      title: "关于",
      type: "article",
      canonical: "https://yfi.moe/about",
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <PageShell title="关于" useComment pathname="/about">
      <h2 id="关于我">关于我</h2>
      <p>
        目前是本科学生（很快就不是了），专业计科，平时常折腾一些个人前端项目。
      </p>
      <h4 id="网名由来">网名由来</h4>
      <p>
        最初追溯到小学的时候脸滚键盘打出的用户名 <code>yunfinibol</code>
        ；后来逐步简化，常用的就是 <code>Yunfi</code> 了。
      </p>
      <blockquote>
        <p>
          可以从一些别的地方看到简称演化的痕迹：比如 Docker Hub
          上的用户名还是完整的 <code>yunfinibol</code>；Twitter 的 handle 则是{" "}
          <code>yunfini</code>。
        </p>
      </blockquote>
      <h3 id="链接">链接 🔗</h3>
      <div className="not-prose my-4 flex gap-4">
        {contactInfo.map((contact) => (
          <a
            key={contact.name}
            href={contact.link}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2"
          >
            <div
              aria-label={contact.name}
              style={{ backgroundColor: contact.color }}
              className="size-8.5 rounded-full p-1.5 transition-transform group-hover:scale-105 group-active:scale-95"
            >
              <span className={`${contact.icon} size-full! text-white!`} />
            </div>
            <span>{contact.name}</span>
          </a>
        ))}
      </div>
      <h2 id="关于本站">关于本站</h2>
      <p>不定期分享经验、经历。</p>
      <p>
        从 <Link to="/archive">Archive</Link> 页面可以看到，2025
        年来更新频率越来越低了，之后会考虑提高更新频率。
      </p>
      <p>
        还维护着一个{" "}
        <Link to="/$page" params={{ page: "site-history" }}>
          站志：本站历史小记
        </Link>{" "}
        页面，记录本站的一些历史。
      </p>
      <h4 id="站点相关-q--a">站点相关 Q &amp; A 💬</h4>
      <ol>
        <li>
          <p>
            <strong>Q</strong>: 有 RSS 吗？
            <br />
            <strong>A</strong>: 有。<a href="/feed.xml">RSS</a> 链接。
          </p>
        </li>
        <li>
          <p>
            <strong>Q</strong>: 没有站内搜索？
            <br />
            <strong>A</strong>: 确实没有。之前使用过
            pagefind，但是效果一般，就去掉了。作为 workaround，可以在 Google
            搜索中添加 <code>site:yfi.moe</code> 后缀来搜索本站内容。
          </p>
        </li>
        <li>
          <p>
            <strong>Q</strong>: 为什么选择了 <code>yfi.moe</code> 作为域名？
            <br />
            <strong>A</strong>：yfi 是网名 Yunfi 的缩写，顶级域名{" "}
            <code>moe</code> 则是因为喜欢。
          </p>
        </li>
        <li>
          <p>
            <strong>Q</strong>：使用的是什么主题？
            <br />
            <strong>A</strong>：自己写的 Astro
            站点，很难说有一个“主题”概念。网站本身在{" "}
            <a href="https://github.com/yy4382/yfi.moe">
              yy4382/yfi.moe - GitHub
            </a>{" "}
            开放源代码访问。
          </p>
        </li>
        <li>
          <p>
            <strong>Q</strong>：采用的技术栈，以及页面设计来源？
            <br />
            <strong>A</strong>：请看 <Link to="/credits">Credits</Link> 页面。
          </p>
        </li>
        <li>
          <p>
            <strong>Q</strong>：文章版权？
            <br />
            <strong>A</strong>：大部分文章使用{" "}
            <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en">
              CC BY-NC-SA 4.0
            </a>{" "}
            许可证；具体可以在每篇文章末尾的版权卡片上看到。
          </p>
        </li>
        <li>
          <p>
            <strong>Q</strong>：隐私收集？
            <br />
            <strong>A</strong>
            ：会收集一些基本信息，如浏览时间、IP 地址等，主要用于统计访问量。
          </p>
        </li>
      </ol>
    </PageShell>
  );
}
