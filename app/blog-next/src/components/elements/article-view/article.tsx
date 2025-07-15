import "server-only";

import { cn } from "@/lib/utils/cn";
import { Card } from "../../ui/card";
import {
  PostAttrTags,
  PostAttrTagsProps,
  PostAttrTime,
  PostAttrTimeProps,
} from "./article-attr";
import { Markdown } from "../markdown/markdown";
// @ts-expect-error svg source not added in types
import Sign from "@/assets/signature-yunfi.svg?source";
import { ClassValue } from "clsx";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Post } from "@/lib/content-layer/collections";
import { markdownToHeadings } from "@repo/markdown/parse";
import Toc from "./toc/Toc";
import { PrevNextIndicator } from "./prev-next-indicator";

type ArticleHeroProps = {
  title: string;
} & Partial<PostAttrTagsProps> &
  PostAttrTimeProps;
function ArticleHero({ title, tags, date, updated }: ArticleHeroProps) {
  return (
    <Card
      className="mx-auto flex flex-col center gap-6 py-24"
      padding="article"
    >
      <h1 className="text-center text-3xl font-bold text-heading">{title}</h1>
      <div className="flex gap-2 text-[0.8rem] text-comment lg:gap-3 flex-col md:flex-row items-center">
        <PostAttrTime date={date} updated={updated} />
        {tags && <PostAttrTags tags={tags} />}
      </div>
    </Card>
  );
}

function ArticleContent({ text }: { text: string }) {
  const headings = markdownToHeadings(text);
  return (
    <div className="border-b border-container">
      <div className="@container main-container h-full relative">
        <div className="sticky top-0 z-50">
          <div className="flex justify-end">
            <Toc headings={headings} />
          </div>
        </div>
        <div className="px-4 py-18">
          <div className="mx-auto prose break-words prose-gray dark:prose-invert prose-headings:scroll-mt-8">
            <Markdown text={text} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyrightCard() {
  return (
    <Card className="overflow-hidden py-10" padding="article">
      <div className="mx-auto prose max-w-[75ch] !text-sm dark:prose-invert prose-p:text-comment/80 prose-a:!text-content/90">
        <div
          className="signature-wrapper float-right"
          dangerouslySetInnerHTML={{ __html: Sign }}
        ></div>
        <p className="!mt-0 !mb-2">
          本文使用“
          <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.en">
            署名-非商业性使用-相同方式共享 4.0 国际(CC BY-NC-SA 4.0)
          </a>
          ”进行许可。
        </p>
        <p className="!mt-0">
          商业转载请联系站长获得授权，非商业转载请注明本文出处及文章链接。
          如果您再混合、转换或者基于本作品进行创作，您必须基于
          <a href="https://creativecommons.org/share-your-work/licensing-considerations/compatible-licenses/">
            相同的
          </a>
          协议分发您贡献的作品。
        </p>
      </div>
    </Card>
  );
}

function PrevNext({ prev, next }: { prev?: Post; next?: Post }) {
  return (
    <div className="border-b border-container">
      <div
        className={cn(
          "main-container grid items-stretch",
          prev && next && "lg:grid-cols-2 grid-cols-1",
          prev && !next && "grid-cols-1",
          !prev && next && "grid-cols-1",
        )}
      >
        {prev && (
          <PrevNextBtn
            postId={prev.id}
            title={prev.data.title}
            className="border-b lg:border-r lg:border-b-0"
          />
        )}
        {next && <PrevNextBtn postId={next.id} title={next.data.title} right />}
      </div>
    </div>
  );
}
type PrevNextBtnProps = {
  postId: string;
  title: string;
  right?: boolean;
  className?: ClassValue;
};
function PrevNextBtn({ postId, title, right, className }: PrevNextBtnProps) {
  const Icon = right ? ChevronRightIcon : ChevronLeftIcon;
  return (
    <div className={cn("@container", "group")}>
      <Link
        className={cn([
          "flex items-center h-full",
          "border-container",
          "card-btn",
          "gap-4 px-6 py-6 @lg:gap-8 @lg:px-16 @lg:py-8",
          right && "flex-row-reverse",
          className,
        ])}
        href={`/post/${postId}`}
      >
        <PrevNextIndicator>
          <Icon
            size={36}
            className="shrink-0 transition-transform group-hover:scale-120 group-active:scale-95"
          />
        </PrevNextIndicator>

        <div className={right ? "flex flex-col items-end" : ""}>
          <p className="text-sm text-comment">上一篇</p>
          <p className="@lg:text-lg">{title}</p>
        </div>
      </Link>
    </div>
  );
}

export { ArticleHero, ArticleContent, CopyrightCard, PrevNext };
