import { siteConfig, siteDomain } from "@configs/site";
import type { SEOProps } from "astro-seo";

export function getSeo(config: {
  title: string;
  description?: string;
  image?: string;
  type?: string;
  noindex?: boolean;
}): SEOProps {
  const {
    title,
    description,
    image = new URL("/base-og.webp", siteDomain).href,
    type = "website",
    noindex = false,
  } = config;

  return {
    title,
    description,
    openGraph: {
      basic: {
        type,
        title,
        image,
      },
      optional: {
        siteName: siteConfig.title,
        description,
      },
    },
    noindex,
    twitter: {
      creator: "@yunfini",
      card: "summary_large_image",
      image,
      title,
      description,
    },
  };
}
