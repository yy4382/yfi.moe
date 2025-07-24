import "server-only";

import { cn } from "@/lib/utils/cn";
import { Section } from "@/components/ui/section";
import {
  PostAttrTags,
  PostAttrTagsProps,
  PostAttrTime,
  PostAttrTimeProps,
} from "./article-attr";
import { Markdown } from "@/components/elements/markdown/markdown";
// @ts-expect-error svg source not added in types
import Sign from "@/assets/signature-yunfi.svg?source";
import clsx, { ClassValue } from "clsx";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import type { PostData } from "@/lib/content-layer/collections";
import { markdownToHeadings } from "@repo/markdown/parse";
import Toc from "./(toc)";
import { PrevNextIndicator } from "./prev-next-indicator";
import type { ContentLayerListItem } from "@/lib/content-layer/define-collection";
import copyrightStyles from "./copyright.module.css";

type ArticleHeroProps = {
  title: string;
} & Partial<PostAttrTagsProps> &
  PostAttrTimeProps;
function ArticleHero({ title, tags, date, updated }: ArticleHeroProps) {
  return (
    <Section
      className="center mx-auto flex flex-col gap-6 py-24"
      padding="article"
    >
      <h1 className="text-heading text-center text-3xl font-bold">{title}</h1>
      <div className="text-comment flex flex-col items-center gap-2 text-[0.8rem] md:flex-row lg:gap-3">
        <PostAttrTime date={date} updated={updated} />
        {tags && <PostAttrTags tags={tags} />}
      </div>
    </Section>
  );
}

function ArticleContent({ text }: { text: string }) {
  const headings = markdownToHeadings(text);
  return (
    <div className="border-container border-b">
      <div className="main-container @container relative h-full">
        <div className="sticky top-0 z-50">
          <div className="flex justify-end">
            <Toc headings={headings} />
          </div>
        </div>
        <div className="px-4 py-18">
          <div className="prose prose-gray dark:prose-invert prose-headings:scroll-mt-8 mx-auto break-words">
            <Markdown text={text} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CopyrightCard() {
  return (
    <Section className="overflow-hidden py-10" padding="article">
      <div className="prose dark:prose-invert prose-p:text-comment/80 prose-a:!text-content/90 mx-auto max-w-[75ch] !text-sm">
        <div
          className={clsx(copyrightStyles.signatureWrapper, "float-right")}
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
    </Section>
  );
}

function PrevNext({
  prev,
  next,
}: {
  prev?: ContentLayerListItem<PostData>;
  next?: ContentLayerListItem<PostData>;
}) {
  return (
    <div className="border-container border-b">
      <div
        className={cn(
          "main-container grid items-stretch",
          prev && next && "grid-cols-1 lg:grid-cols-2",
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
          "flex h-full items-center",
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
          <p className="text-comment text-sm">上一篇</p>
          <p className="@lg:text-lg">{title}</p>
        </div>
      </Link>
    </div>
  );
}

export { ArticleHero, ArticleContent, CopyrightCard, PrevNext };
