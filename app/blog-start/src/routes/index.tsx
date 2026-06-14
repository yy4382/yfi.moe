import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import logo from "@/assets/logo.png";
import { NavLayout } from "@/components/layout/nav-layout";
import { Section } from "@/components/ui/section";
import { authorName, contactInfo, projects } from "@/config/author";
import { getSortedPosts } from "@/lib/content/server";
import { cn } from "@/lib/utils/cn";
import { buildSeo } from "@/lib/utils/seo";

export const Route = createFileRoute("/")({
  loader: async () => {
    const posts = await getSortedPosts();
    const firstDate = posts.at(-1)!.data.publishedDate;
    return {
      firstDate,
      statistics: {
        articles: posts.length,
        words: posts.reduce((acc, post) => {
          return acc + countWords(post.body);
        }, 0),
        tags: [...new Set(posts.map((post) => post.data.tags).flat())].length,
      },
    };
  },
  head: () =>
    buildSeo({
      title: "首页",
      description: "笔记与分享，代码和生活",
      canonical: "https://yfi.moe",
    }),
  component: HomePage,
});

function countWords(content: string) {
  const withoutCodeBlocks = content.replace(/```[\s\S]*?```/g, " ");
  const cjkChars =
    withoutCodeBlocks.match(
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
    )?.length ?? 0;
  const latinWords =
    withoutCodeBlocks
      .replace(
        /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
        " ",
      )
      .match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g)?.length ?? 0;

  return cjkChars + latinWords;
}

function HomePage() {
  const { firstDate, statistics } = Route.useLoaderData();
  return (
    <NavLayout>
      <Section
        className="flex min-h-96 flex-col center gap-4 md:min-h-[40rem]"
        bg="grid"
      >
        <div className="flex center gap-4 md:gap-8">
          <img
            src={logo}
            alt="logo"
            width={80}
            height={80}
            className="rounded-md"
          />
          <h1 className="text-5xl font-bold lg:text-8xl">{authorName}</h1>
        </div>
      </Section>
      <Section className="min-h-18" />
      <Section className="relative pt-20 pb-16 sm:pt-8">
        <span className="section-number">01</span>
        <h2 className="mb-2 px-8 text-3xl font-bold sm:px-10">文章</h2>
        <p className="mb-12 max-w-[65ch] px-8 sm:px-10">
          从 {format(new Date(firstDate), "yyyy 年 M 月 d 日")}
          的第一篇文章开始，本站已经更新了……
        </p>
        <div className="dashed flex flex-col">
          <div className="grid-row-3 sm:grid-row-1 relative grid place-items-stretch border-y border-container sm:grid-cols-3">
            <div className="flex flex-col center border-b border-container py-8 sm:border-r sm:border-b-0">
              <div className="text-3xl font-bold text-heading">
                {statistics.articles} 篇
              </div>
              <div className="text-comment">文章</div>
            </div>
            <div className="flex flex-col center border-b border-container py-8 sm:border-r sm:border-b-0">
              <div className="text-3xl font-bold text-heading">
                {(statistics.words / 10000).toFixed(2)} 万
              </div>
              <div className="text-comment">字数</div>
            </div>
            <div className="flex flex-col center border-container py-8">
              <div className="text-3xl font-bold text-heading">
                {statistics.tags} 个
              </div>
              <div className="text-comment">标签</div>
            </div>
          </div>
          <Link
            className="flex center gap-1 color-transition-card-btn py-6 font-semibold"
            to="/post"
          >
            文章列表 <span className="i-mingcute-external-link-line size-5" />
          </Link>
        </div>
      </Section>
      <Section className="min-h-18" />
      <Section className="relative pt-20 pb-16 sm:pt-8">
        <span className="section-number">02</span>
        <h2 className="mb-2 px-8 text-3xl font-bold sm:px-10">项目</h2>
        <p className="mb-12 max-w-[65ch] px-8 sm:px-10">
          在{" "}
          <a href="https://github.com/yy4382" className="underline">
            GitHub
          </a>{" "}
          上有更多开源项目，不妨点个 Star 吧。
        </p>
        <div className="dashed flex flex-col">
          {projects.map((project) => (
            <div
              key={project.title}
              className={cn(
                "group grid min-h-48 grid-cols-[1fr_5rem] grid-rows-1 *:py-8 sm:grid-cols-[1fr_10rem] lg:grid-cols-[12rem_1fr_10rem]",
                "border-b border-container-light",
              )}
            >
              <div className="hidden center border-r border-container-light lg:flex">
                <img src={project.icon} alt="" width={100} height={100} />
              </div>
              <div className="flex flex-col justify-center gap-2 border-r border-container-light px-8 sm:px-12">
                <div className="mb-4 flex items-center justify-start lg:hidden">
                  <img src={project.icon} alt="" width={64} height={64} />
                </div>
                <p className="text-comment">{project.desc}</p>
                <h3 className="text-xl font-bold">{project.title}</h3>
              </div>
              <div className="grid grid-cols-1 place-items-stretch !py-0 font-bold text-comment/80 group-hover:text-content">
                {project.links.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "flex center color-transition-card-btn",
                      index !== project.links.length - 1 &&
                        "border-b border-container-light",
                    )}
                  >
                    <div className="inline-flex gap-2">
                      <span className={`${link.icon} size-6!`} />{" "}
                      <span className="hidden sm:inline">{link.text}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
          <a
            className="flex center gap-1 color-transition-card-btn py-6 font-semibold"
            href="https://github.com/yy4382"
          >
            更多 <span className="i-mingcute-external-link-line size-5" />
          </a>
        </div>
      </Section>
      <Section className="min-h-18" />
      <Section className="relative pt-18 pb-8 sm:pt-8">
        <span className="section-number">03</span>
        <div className="relative flex size-full flex-col items-start justify-center gap-6 px-8 sm:flex-row sm:items-center sm:px-10">
          <h2 className="text-3xl font-bold">联系我</h2>
          <div className="flex gap-4">
            {contactInfo.map((contact) => (
              <a
                key={contact.name}
                href={contact.link}
                target="_blank"
                rel="noreferrer"
                aria-label={contact.name}
                style={{ backgroundColor: contact.color }}
                className="size-10 rounded-full p-2"
              >
                <span className={`${contact.icon} size-6! text-white!`} />
              </a>
            ))}
          </div>
        </div>
      </Section>
    </NavLayout>
  );
}
