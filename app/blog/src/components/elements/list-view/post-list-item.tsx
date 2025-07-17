import type { PostData } from "@/lib/content-layer/collections";
import Link from "next/link";
import { Markdown } from "../markdown/markdown";
import { PostAttrTags, PostAttrTime } from "../article-view/article-attr";
import type { ContentLayerListItem } from "@/lib/content-layer/define-collection";

export function EntryListItem({
  post,
}: {
  post: ContentLayerListItem<PostData>;
}) {
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
          <Markdown text={post.data.description} />
        </div>
      </div>
    </div>
  );
}
