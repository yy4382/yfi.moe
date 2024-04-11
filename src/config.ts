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
    subMenu: [
      { text: "介绍 & 教程", link: "/categories/介绍 & 教程" },
      { text: "编程 & 技术", link: "/categories/编程 & 技术" },
      { text: "记录 & 分享", link: "/categories/记录 & 分享" },
      { text: "折腾 & 笔记", link: "/categories/折腾 & 笔记" },
    ],
  },

  {
    text: "时间轴",
    link: "/achieve",
    icon: "mingcute:history-anticlockwise-line",
  },
  {
    text: "更多",
    icon: "mingcute:information-line",
    link: "#",
    subMenu: [
      { text: "关于本站", link: "/about" },
      { text: "我的项目", link: "/projects" },
      { text: "订阅 RSS", link: "/feed.xml" },
    ],
  },
];

export const algoliaConfig = {
  appId: "1348UVS1GQ",
  readonlyKey: "c1c21db7f7677a90c797ea5f411d8940",
};
