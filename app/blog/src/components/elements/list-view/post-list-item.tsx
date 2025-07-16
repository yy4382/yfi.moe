import { Post } from "@/lib/content-layer/collections";
import Link from "next/link";
import { Markdown } from "../markdown/markdown";
import { PostAttrTags, PostAttrTime } from "../article-view/article-attr";

export function EntryListItem({ post }: { post: Post }) {
  return (
    <div className="@container main-container h-full border-b border-contain">
      <div className="px-6 @xl:px-10 @4xl:px-16 @6xl:px-32 py-8 @4xl:py-12">
        <Link href={`/post/${post.id}`}>
          <h2 className="mb-2 text-lg font-bold transition-colors hover:text-content-primary @xl:text-xl @4xl:text-3xl">
            {post.data.title}
          </h2>
        </Link>
        <div className="flex gap-2 text-[0.8rem] text-comment lg:gap-3 flex-wrap">
          <PostAttrTime date={post.data.date} updated={post.data.updated} />
          <PostAttrTags tags={post.data.tags} />
        </div>
        <div className="prose mt-4 hidden max-w-[90ch] @4xl:block dark:prose-invert">
          {post.data.description || <Markdown text={getDesc(post.body)} />}
        </div>
      </div>
    </div>
  );
}

function truncateAtClosestNewline(str: string, targetPosition = 150) {
  while (str.startsWith("\n")) {
    str = str.slice(1);
  }
  let newPosition = str.lastIndexOf("\n", targetPosition);

  if (newPosition === -1) {
    newPosition = str.indexOf("\n", targetPosition);
    if (newPosition === -1) {
      return str;
    }
  }

  // 截取字符串到换行符的位置
  return str.substring(0, newPosition);
}

function getDesc(
  content: string,
  config?: { length?: number; tryMore?: boolean },
) {
  const { length = 70, tryMore = true } = config || {};
  content = content.trim();
  if (tryMore) {
    const moreIndex = content.indexOf("<!--more-->");
    if (moreIndex !== -1) {
      content = content.substring(0, moreIndex).trim();
    } else {
      content = truncateAtClosestNewline(content, length);
    }
  } else {
    content = truncateAtClosestNewline(content, length);
  }
  return content;
}
