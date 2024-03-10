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
  link?: string;
  icon?: string;
  subMenu?: NavMenu[];
}
export const navMenu: NavMenu[] = [
  {
    text: "首页",
    link: "/",
    icon: "mingcute:dot-grid-fill",
    subMenu: [
      { text: "自述", link: "/" },
      { text: "高亮文章", link: "/#highlights" },
      { text: "最近文章", link: "/#recent" },
      { text: "首页项目", link: "/#projects" },
    ],
  },
  {
    text: "文章",
    link: "/post/1",
    icon: "mingcute:edit-4-line",
  },

  {
    text: "时间轴",
    link: "/achieve",
    icon: "mingcute:history-anticlockwise-line",
  },
  {
    text: "更多",
    icon: "mingcute:information-line",
    subMenu: [
      { text: "关于本站", link: "/about" },
      { text: "我的项目", link: "/projects" },
      { text: "订阅 RSS", link: "/feed.xml" },
    ],
  },
];
