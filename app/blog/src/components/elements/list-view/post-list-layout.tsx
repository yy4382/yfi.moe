import { Card } from "@/components/ui/card";
import type { PostData } from "@/lib/content-layer/collections";
import { EntryListItem } from "./post-list-item";
import { Pagination } from "./pagination";
import type { ContentLayerListItem } from "@/lib/content-layer/define-collection";

type ListLayoutProps = ListHeroProps & {
  posts: ContentLayerListItem<PostData>[];
  currentPage?: number;
  totalPages?: number;
  baseUrl: string;
};

export function ListLayout({
  posts,
  currentPage = 1,
  totalPages = 1,
  baseUrl,
  ...props
}: ListLayoutProps) {
  return (
    <div>
      <ListHero {...props} />
      {posts.map((post) => (
        <EntryListItem key={post.id} post={post} />
      ))}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseUrl={baseUrl}
        />
      )}
    </div>
  );
}

type ListHeroProps = {
  title: string;
  desc?: string;
};
export function ListHero({ title, desc }: ListHeroProps) {
  return (
    <Card
      className="flex h-52 flex-col items-start justify-center lg:h-96"
      padding="postList"
      bg="grid"
    >
      <h1 className="text-5xl font-bold text-heading @3xl:text-6xl">{title}</h1>
      {desc && <p className="mt-4 ml-1 text-lg text-content">{desc}</p>}
    </Card>
  );
}
