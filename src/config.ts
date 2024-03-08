export interface SeoConfig {
  title: string;
  description?: string;
  openGraph?: {
    basic: {
      type: string;
      title: string;
      image: string;
    };
  };
  twitter?: {
    creator?: string;
  };
}
export class Seo {
  config: SeoConfig;
  constructor(
    title: string,
    description?: string,
    image?: string,
    type: string = "website",
  ) {
    this.config = {
      title: title,
      description: description,
      openGraph: {
        basic: {
          type: type,
          title: title,
          image: image || "https://blog.yfi.moe/favicon.png",
        },
      },
      twitter: {
        creator: "@yunfini",
      },
    } as SeoConfig;
  }
  get(): SeoConfig {
    return this.config;
  }
}

export interface TocItem {
  depth: number;
  slug: string;
  text: string;
}
export interface SiteConfig {
  title: string;
}
export const siteConfig: SiteConfig = {
  title: "Yunfi",
};
export interface NavMenu {
  text: string;
  link: string;
  subMenu?: NavMenu[];
}
export const navMenu: NavMenu[] = [
  {
    text: "首页",
    link: "/",
  },
  {
    text: "文章",
    link: "/post/1",
  },
  {
    text: "时间轴",
    link: "/achieve",
  },
  {
    text: "关于",
    link: "/about",
  },
];
