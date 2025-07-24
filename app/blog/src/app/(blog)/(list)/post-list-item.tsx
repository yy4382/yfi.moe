import type { PostData } from "@/lib/content-layer/collections";
import Link from "next/link";
import { Markdown } from "@/components/elements/markdown/markdown";
import { PostAttrTags, PostAttrTime } from "../(article)/article-attr";
import type { ContentLayerListItem } from "@/lib/content-layer/define-collection";
import { cn } from "@/lib/utils/cn";

export function EntryListItem({
  post,
  className,
}: {
  post: ContentLayerListItem<PostData>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "main-container border-container @container h-full border-b",
        className,
      )}
    >
      <div className="px-6 py-8 @xl:px-10 @4xl:px-16 @4xl:py-12 @6xl:px-32">
        <Link href={`/post/${post.id}`}>
          <h2 className="hover:text-accent-foreground mb-2 text-lg font-bold transition-colors @xl:text-xl @4xl:text-3xl">
            {post.data.title}
          </h2>
        </Link>
        <div className="text-comment flex flex-wrap gap-2 text-[0.8rem] lg:gap-3">
          <PostAttrTime date={post.data.date} updated={post.data.updated} />
          <PostAttrTags tags={post.data.tags} />
        </div>
        <div className="prose dark:prose-invert mt-4 hidden max-w-[90ch] @4xl:block">
          <Markdown text={post.data.description} />
        </div>
      </div>
    </div>
  );
}
