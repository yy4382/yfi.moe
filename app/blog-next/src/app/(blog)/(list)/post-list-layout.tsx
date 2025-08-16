import { Section } from "@/components/ui/section";
import type { PostData } from "@/lib/content-layer/collections";
import { EntryListItem } from "./post-list-item";
import { Pagination } from "./pagination";
import type { ContentLayerListItem } from "@/lib/content-layer/define-collection";

type ListLayoutProps = ListHeroProps & {
  posts: ContentLayerListItem<PostData>[];
  currentPage: number;
  totalPages: number;
  baseUrl: string;
};

export function ListLayout({
  posts,
  currentPage,
  totalPages,
  baseUrl,
  ...props
}: ListLayoutProps) {
  return (
    <div>
      <div className="border-container border-b">
        <ListHero {...props} />
        {posts.map((post, i) => (
          <EntryListItem
            key={post.id}
            post={post}
            className={i === posts.length - 1 ? "border-b-0" : ""}
          />
        ))}
      </div>
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
    <Section
      className="flex h-52 flex-col items-start justify-center lg:h-96"
      padding="postList"
      bg="grid"
    >
      <h1 className="text-heading text-5xl font-bold @3xl:text-6xl">{title}</h1>
      {desc && <p className="text-content mt-4 ml-1 text-lg">{desc}</p>}
    </Section>
  );
}
