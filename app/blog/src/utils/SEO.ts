import { siteDomain } from "@configs/site";
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
    image = new URL("/icon-512.png", siteDomain).href,
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
    },
    noindex,
    twitter: {
      creator: "@yunfini",
      card: config.image ? "summary_large_image" : "summary",
      image,
      title,
      description,
    },
  };
}
