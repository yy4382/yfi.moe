import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import type { ContentEntry, PageData, PostData } from "@/lib/content/source";

type SortedPostsOptions = {
  noDrafts: boolean;
};

function normalizeSortedPostsOptions(options?: Partial<SortedPostsOptions>) {
  return options?.noDrafts === undefined
    ? undefined
    : { noDrafts: options.noDrafts };
}

const sortedPostsOptionsSchema = z
  .object({
    noDrafts: z.boolean().optional(),
  })
  .optional();

export const getPosts = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentEntry<PostData>[]> => {
    const { getPosts: loadPosts } = await import("@/lib/content/source");
    return loadPosts();
  },
);

export const getPages = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentEntry<PageData>[]> => {
    const { getPages: loadPages } = await import("@/lib/content/source");
    return loadPages();
  },
);

export const getImageMeta = createServerFn({ method: "GET" }).handler(
  async (): Promise<ImageMeta[]> => {
    const { getImageMeta: loadImageMeta } =
      await import("@/lib/content/source");
    return loadImageMeta();
  },
);

export const getSortedPosts = createServerFn({ method: "GET" })
  .validator(sortedPostsOptionsSchema)
  .handler(async ({ data: options }): Promise<ContentEntry<PostData>[]> => {
    const { getSortedPosts: loadSortedPosts } =
      await import("@/lib/content/source");
    return loadSortedPosts(normalizeSortedPostsOptions(options));
  });

export const getPost = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(
    async ({ data: slug }): Promise<ContentEntry<PostData> | undefined> => {
      const { getPost: loadPost } = await import("@/lib/content/source");
      return loadPost(slug);
    },
  );

export const getPage = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(
    async ({ data: slug }): Promise<ContentEntry<PageData> | undefined> => {
      const { getPage: loadPage } = await import("@/lib/content/source");
      return loadPage(slug);
    },
  );

export const getAdjacentPosts = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(
    async ({
      data: currentSlug,
    }): Promise<{
      prev?: ContentEntry<PostData>;
      next?: ContentEntry<PostData>;
    }> => {
      const { getAdjacentPosts: loadAdjacentPosts } =
        await import("@/lib/content/source");
      return loadAdjacentPosts(currentSlug);
    },
  );

export const getSeriesPosts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      seriesId: z.string(),
      options: sortedPostsOptionsSchema,
    }),
  )
  .handler(async ({ data }): Promise<ContentEntry<PostData>[]> => {
    const { getSeriesPosts: loadSeriesPosts } =
      await import("@/lib/content/source");
    return loadSeriesPosts(
      data.seriesId,
      normalizeSortedPostsOptions(data.options),
    );
  });

export const getSimilarPosts = createServerFn({ method: "GET" })
  .validator(
    z.object({
      currentSlug: z.string(),
      limit: z.number().optional(),
      options: sortedPostsOptionsSchema,
    }),
  )
  .handler(
    async ({
      data,
    }): Promise<{ post: ContentEntry<PostData>; score: number }[]> => {
      const { getSimilarPosts: loadSimilarPosts } =
        await import("@/lib/content/source");
      return loadSimilarPosts(
        data.currentSlug,
        data.limit,
        normalizeSortedPostsOptions(data.options),
      );
    },
  );
