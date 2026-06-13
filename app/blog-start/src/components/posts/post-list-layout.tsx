import { ListHero } from "@/components/posts/list-hero";
import { Pagination } from "@/components/posts/pagination";
import type { PostListItemData } from "@/components/posts/post-list-item";
import { PostListItem } from "@/components/posts/post-list-item";

export type PaginationPage<T> = {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export function PostListLayout({
  paginationPage,
  baseUrl,
  title,
  desc,
}: {
  paginationPage: PaginationPage<PostListItemData>;
  baseUrl: "/post" | `/tags/${string}`;
  title: string;
  desc?: string;
}) {
  return (
    <div>
      <div className="border-b border-container">
        <ListHero title={title} desc={desc} />
        {paginationPage.data.map((post, index) => (
          <PostListItem
            key={post.id}
            post={post}
            className={
              index === paginationPage.data.length - 1 ? "border-b-0" : ""
            }
          />
        ))}
      </div>
      {paginationPage.lastPage > 1 && (
        <Pagination
          currentPage={paginationPage.currentPage}
          totalPages={paginationPage.lastPage}
          baseUrl={baseUrl}
        />
      )}
    </div>
  );
}
