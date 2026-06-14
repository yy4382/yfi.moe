import { siteConfig, siteDomain } from "@/config/site";

export type SeoInput = {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
  canonical?: string;
};

export function buildSeo({
  title,
  description,
  image = new URL("/base-og.webp", siteDomain).href,
  type = "website",
  noindex = false,
  canonical,
}: SeoInput) {
  const fullTitle = `${title} - ${siteConfig.title}`;
  return {
    title: fullTitle,
    meta: [
      { title: fullTitle },
      description ? { name: "description", content: description } : undefined,
      noindex ? { name: "robots", content: "noindex" } : undefined,
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:image", content: image },
      { property: "og:site_name", content: siteConfig.title },
      canonical ? { property: "og:url", content: canonical } : undefined,
      description
        ? { property: "og:description", content: description }
        : undefined,
      { name: "twitter:creator", content: "@yunfini" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: image },
      { name: "twitter:title", content: title },
      description
        ? { name: "twitter:description", content: description }
        : undefined,
    ].filter((item) => item !== undefined),
    links: canonical ? [{ rel: "canonical", href: canonical }] : [],
  };
}
