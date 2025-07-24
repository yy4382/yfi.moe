import { Card } from "@/components/ui/card";
import { authorName, contactInfo } from "@/config/author";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { format } from "date-fns";
import { postCollection } from "@/lib/content-layer/collections";
import { projects } from "@/config/author";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import readingTime from "reading-time";
import Link from "next/link";
import { Suspense } from "react";

export const dynamic = "error";

export default function Home() {
  return (
    <>
      <Card
        className="flex min-h-96 flex-col center gap-4 md:min-h-[40rem]"
        bg="grid"
      >
        <div className="flex center gap-4 md:gap-8">
          <Image
            src={logo}
            alt="logo"
            width={80}
            height={80}
            className="rounded-md"
          />
          <h1 className="text-5xl font-bold lg:text-8xl">{authorName}</h1>
        </div>
      </Card>
      <Card className="min-h-18" />
      <Suspense fallback={<StatisticsSkeleton />}>
        <Statistics />
      </Suspense>
      <Card className="min-h-18" />
      <Projects />
      <Card className="min-h-18" />
      <ContactInfo />
    </>
  );
}

async function Statistics() {
  const posts = await postCollection.getCollectionWithBody();
  const firstDate = posts[0].data.date;
  const statistics = {
    articles: posts.length,
    words: posts.reduce((acc, post) => {
      const readingTimeResult = readingTime(post.body);
      return acc + readingTimeResult.words;
    }, 0),
    tags: [...new Set(posts.map((post) => post.data.tags).flat())].length,
  };

  return (
    <StatisticsSection
      firstDateString={format(firstDate, "yyyy 年 M 月 d 日")}
      statistics={{
        articles: statistics.articles.toString(),
        words: (statistics.words / 10000).toFixed(2),
        tags: statistics.tags.toString(),
      }}
    />
  );
}

function StatisticsSkeleton() {
  return (
    <StatisticsSection
      firstDateString={<LoadingCharacter length={4} />}
      statistics={{
        articles: <LoadingCharacter length={2} />,
        words: <LoadingCharacter length={2} />,
        tags: <LoadingCharacter length={2} />,
      }}
    />
  );
}

function LoadingCharacter({ length }: { length: number }) {
  return (
    <span
      className="inline-block h-[1em] animate-pulse bg-gray-200 dark:bg-gray-800 mx-1 rounded-md"
      style={{ width: `${length}ch` }}
    />
  );
}

type StatisticsSectionProps = {
  firstDateString: React.ReactNode;
  statistics: {
    articles: React.ReactNode;
    words: React.ReactNode;
    tags: React.ReactNode;
  };
};
function StatisticsSection({
  firstDateString,
  statistics,
}: StatisticsSectionProps) {
  return (
    <Card className="relative pt-20 pb-16 sm:pt-8">
      <span className="section-number">01</span>
      <h2 className="mb-2 px-8 text-3xl font-bold sm:px-10">文章</h2>
      <p className="mb-12 max-w-[65ch] px-8 sm:px-10 inline-flex items-center">
        从 {firstDateString}
        的第一篇文章开始，本站已经更新了……
      </p>
      <div className="dashed flex flex-col">
        <div className="grid-row-3 sm:grid-row-1 relative grid place-items-stretch border-y border-container sm:grid-cols-3">
          <div className="flex flex-col center border-b border-container py-8 sm:border-r sm:border-b-0">
            <div className="text-3xl font-bold text-heading inline-flex items-center">
              {statistics.articles} 篇
            </div>
            <div className="text-comment">文章</div>
          </div>
          <div className="flex flex-col center border-b border-container py-8 sm:border-r sm:border-b-0">
            <div className="text-3xl font-bold text-heading inline-flex items-center">
              {statistics.words} 万
            </div>
            <div className="text-comment">字数</div>
          </div>
          <div className="flex flex-col center border-container py-8">
            <div className="text-3xl font-bold text-heading inline-flex items-center">
              {statistics.tags} 个
            </div>
            <div className="text-comment">标签</div>
          </div>
        </div>
        <Link
          className="flex center gap-1 card-btn py-6 font-semibold"
          href="/posts"
        >
          文章列表 <ExternalLink size={20} />
        </Link>
      </div>
    </Card>
  );
}

function Projects() {
  return (
    <Card className="relative pt-20 pb-16 sm:pt-8">
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
        {projects.map((p) => (
          <div
            className={cn(
              "group grid min-h-48 grid-cols-[1fr_5rem] grid-rows-1 *:py-8 sm:grid-cols-[1fr_10rem] lg:grid-cols-[12rem_1fr_10rem]",
              "border-b border-container-light",
            )}
            key={p.title}
          >
            <div className="hidden center border-r border-container-light lg:flex">
              <p.icon className="size-[100px]" />
            </div>
            <div className="flex flex-col justify-center gap-2 border-r border-container-light px-8 sm:px-12">
              <div className="mb-4 flex items-center justify-start lg:hidden">
                <p.icon className="size-[64px]" />
              </div>
              <p className="text-comment">{p.desc}</p>
              <h3 className="text-xl font-bold">{p.title}</h3>
            </div>
            <div className="grid grid-cols-1 place-items-stretch !py-0 font-bold text-comment/80 group-hover:text-content">
              {p.links.map((l, i) => (
                <a
                  href={l.href}
                  target="_blank"
                  className={cn(
                    "flex center card-btn",
                    i !== p.links.length - 1 &&
                      "border-b border-container-light",
                  )}
                  key={l.href}
                >
                  <div className="inline-flex gap-2">
                    <l.icon className="size-6" />{" "}
                    <span className="hidden sm:inline">{l.text}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
        <a
          className="flex center gap-1 card-btn py-6 font-semibold"
          href="https://github.com/yy4382"
        >
          更多 <ExternalLink size={20} />
        </a>
      </div>
    </Card>
  );
}

function ContactInfo() {
  return (
    <Card className="relative pt-18 pb-8 sm:pt-8">
      <span className="section-number">03</span>
      <div className="relative flex size-full flex-col items-start justify-center gap-6 px-8 sm:flex-row sm:items-center sm:px-10">
        <h2 className="text-3xl font-bold">联系我</h2>
        <div className="flex gap-4">
          {contactInfo.map((c) => {
            return (
              <a
                href={c.link}
                target="_blank"
                aria-label={c.name}
                style={{ backgroundColor: c.color }}
                className="rounded-full p-2"
                key={c.name}
              >
                <c.icon className="size-6" style={{ color: "white" }} />
              </a>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
