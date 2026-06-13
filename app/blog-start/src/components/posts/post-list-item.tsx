import { Link } from "@tanstack/react-router";
import { PostAttrTags } from "@/components/posts/post-attr-tags";
import { PostAttrTime } from "@/components/posts/post-attr-time";
import type { ContentEntry, PostData } from "@/lib/content/source";
import { cn } from "@/lib/utils/cn";

export type PostListItemData = ContentEntry<PostData> & {
  descriptionHtml: string;
};

export function PostListItem({
  post,
  className,
}: {
  post: PostListItemData;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "@container main-container h-full border-b border-container",
        className,
      )}
    >
      <div className="px-6 py-8 @xl:px-10 @4xl:px-16 @4xl:py-12 @6xl:px-32">
        <Link to="/post/$slug" params={{ slug: post.id }}>
          <h2 className="mb-2 text-lg font-bold transition-colors hover:text-accent-foreground @xl:text-xl @4xl:text-3xl">
            {post.data.title}
          </h2>
        </Link>
        <div className="flex flex-wrap gap-2 text-[0.8rem] text-comment lg:gap-3">
          <PostAttrTime {...post.data} />
          <PostAttrTags tags={post.data.tags} />
        </div>
        <div
          className="prose mt-4 hidden max-w-[90ch] @4xl:block dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.descriptionHtml }}
        />
      </div>
    </div>
  );
}
