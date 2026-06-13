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

const getPostsFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentEntry<PostData>[]> => {
    const { getPosts } = await import("@/lib/content/source");
    return getPosts();
  },
);

const getPagesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ContentEntry<PageData>[]> => {
    const { getPages } = await import("@/lib/content/source");
    return getPages();
  },
);

const getImageMetaFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ImageMeta[]> => {
    const { getImageMeta } = await import("@/lib/content/source");
    return getImageMeta();
  },
);

const getSortedPostsFn = createServerFn({ method: "GET" })
  .validator(sortedPostsOptionsSchema)
  .handler(async ({ data: options }): Promise<ContentEntry<PostData>[]> => {
    const { getSortedPosts } = await import("@/lib/content/source");
    return getSortedPosts(normalizeSortedPostsOptions(options));
  });

const getPostFn = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(
    async ({ data: slug }): Promise<ContentEntry<PostData> | undefined> => {
      const { getPost } = await import("@/lib/content/source");
      return getPost(slug);
    },
  );

const getPageFn = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(
    async ({ data: slug }): Promise<ContentEntry<PageData> | undefined> => {
      const { getPage } = await import("@/lib/content/source");
      return getPage(slug);
    },
  );

const getAdjacentPostsFn = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(
    async ({
      data: currentSlug,
    }): Promise<{
      prev?: ContentEntry<PostData>;
      next?: ContentEntry<PostData>;
    }> => {
      const { getAdjacentPosts } = await import("@/lib/content/source");
      return getAdjacentPosts(currentSlug);
    },
  );

const getSeriesPostsFn = createServerFn({ method: "GET" })
  .validator(
    z.object({
      seriesId: z.string(),
      options: sortedPostsOptionsSchema,
    }),
  )
  .handler(async ({ data }): Promise<ContentEntry<PostData>[]> => {
    const { getSeriesPosts } = await import("@/lib/content/source");
    return getSeriesPosts(
      data.seriesId,
      normalizeSortedPostsOptions(data.options),
    );
  });

const getSimilarPostsFn = createServerFn({ method: "GET" })
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
      const { getSimilarPosts } = await import("@/lib/content/source");
      return getSimilarPosts(
        data.currentSlug,
        data.limit,
        normalizeSortedPostsOptions(data.options),
      );
    },
  );

export function getPosts() {
  return getPostsFn();
}

export function getPages() {
  return getPagesFn();
}

export function getImageMeta() {
  return getImageMetaFn();
}

export function getSortedPosts(options?: Partial<SortedPostsOptions>) {
  return getSortedPostsFn({ data: normalizeSortedPostsOptions(options) });
}

export function getPost(slug: string) {
  return getPostFn({ data: slug });
}

export function getPage(slug: string) {
  return getPageFn({ data: slug });
}

export function getAdjacentPosts(currentSlug: string) {
  return getAdjacentPostsFn({ data: currentSlug });
}

export function getSeriesPosts(
  seriesId: string,
  options?: Partial<SortedPostsOptions>,
) {
  return getSeriesPostsFn({
    data: { seriesId, options: normalizeSortedPostsOptions(options) },
  });
}

export function getSimilarPosts(
  currentSlug: string,
  limit?: number,
  options?: Partial<SortedPostsOptions>,
) {
  return getSimilarPostsFn({
    data: {
      currentSlug,
      limit,
      options: normalizeSortedPostsOptions(options),
    },
  });
}
