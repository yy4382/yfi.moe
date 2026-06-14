import { createServerFn } from "@tanstack/react-start";
import { staticFunctionMiddleware } from "@tanstack/start-static-server-functions";
import { z } from "zod";
import type { ImageMeta } from "@repo/markdown/plugins/rehype-image-metadata";
import {
  getAdjacentPosts as loadAdjacentPosts,
  getImageMeta as loadImageMeta,
  getPage as loadPage,
  getPages as loadPages,
  getPost as loadPost,
  getPosts as loadPosts,
  getSeriesPosts as loadSeriesPosts,
  getSimilarPosts as loadSimilarPosts,
  getSortedPosts as loadSortedPosts,
} from "@/lib/content/source";
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

export const getPosts = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async (): Promise<ContentEntry<PostData>[]> => {
    return loadPosts();
  });

export const getPages = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async (): Promise<ContentEntry<PageData>[]> => {
    return loadPages();
  });

export const getImageMeta = createServerFn({ method: "GET" })
  .middleware([staticFunctionMiddleware])
  .handler(async (): Promise<ImageMeta[]> => {
    return loadImageMeta();
  });

export const getSortedPosts = createServerFn({ method: "GET" })
  .validator(sortedPostsOptionsSchema)
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data: options }): Promise<ContentEntry<PostData>[]> => {
    return loadSortedPosts(normalizeSortedPostsOptions(options));
  });

export const getPost = createServerFn({ method: "GET" })
  .validator(z.string())
  .middleware([staticFunctionMiddleware])
  .handler(
    async ({ data: slug }): Promise<ContentEntry<PostData> | undefined> => {
      return loadPost(slug);
    },
  );

export const getPage = createServerFn({ method: "GET" })
  .validator(z.string())
  .middleware([staticFunctionMiddleware])
  .handler(
    async ({ data: slug }): Promise<ContentEntry<PageData> | undefined> => {
      return loadPage(slug);
    },
  );

export const getAdjacentPosts = createServerFn({ method: "GET" })
  .validator(z.string())
  .middleware([staticFunctionMiddleware])
  .handler(
    async ({
      data: currentSlug,
    }): Promise<{
      prev?: ContentEntry<PostData>;
      next?: ContentEntry<PostData>;
    }> => {
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
  .middleware([staticFunctionMiddleware])
  .handler(async ({ data }): Promise<ContentEntry<PostData>[]> => {
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
  .middleware([staticFunctionMiddleware])
  .handler(
    async ({
      data,
    }): Promise<{ post: ContentEntry<PostData>; score: number }[]> => {
      return loadSimilarPosts(
        data.currentSlug,
        data.limit,
        normalizeSortedPostsOptions(data.options),
      );
    },
  );
