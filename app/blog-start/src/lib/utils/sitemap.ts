import { siteDomain } from "@/config/site";
import type { ContentEntry, PageData, PostData } from "@/lib/content/source";

export function renderSitemapIndex() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${new URL("/sitemap-0.xml", siteDomain)}</loc>
  </sitemap>
</sitemapindex>
`;
}

export function renderUrlSet({
  posts,
  pages,
  tags,
  postPages,
  tagPages,
}: {
  posts: ContentEntry<PostData>[];
  pages: ContentEntry<PageData>[];
  tags: string[];
  postPages: number;
  tagPages: Record<string, number>;
}) {
  const urls = [
    "/",
    "/post",
    ...Array.from(
      { length: Math.max(0, postPages - 1) },
      (_, index) => `/post/${index + 2}`,
    ),
    ...posts.flatMap((post) => [`/post/${post.id}`, `/post/${post.id}/og.png`]),
    "/archive",
    ...pages.map((page) => `/${page.id}`),
    ...tags.flatMap((tag) => [
      `/tags/${tag}`,
      ...Array.from(
        { length: Math.max(0, (tagPages[tag] ?? 1) - 1) },
        (_, index) => `/tags/${tag}/${index + 2}`,
      ),
    ]),
    "/account/notification",
    "/feed.xml",
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${new URL(url, siteDomain)}</loc>
  </url>`,
  )
  .join("\n")}
</urlset>
`;
}
