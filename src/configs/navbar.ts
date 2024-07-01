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
    subMenu: [{ text: "站志", link: "/site-history" }],
  },
  {
    text: "文章",
    link: "/post",
    icon: "mingcute:edit-4-line",
    subMenu: [
      { text: "介绍 & 教程", link: "/categories/介绍 & 教程" },
      { text: "编程 & 技术", link: "/categories/编程 & 技术" },
      { text: "记录 & 分享", link: "/categories/记录 & 分享" },
      { text: "折腾 & 笔记", link: "/categories/折腾 & 笔记" },
    ],
  },

  {
    text: "时光机",
    link: "/achieve",
    icon: "mingcute:history-anticlockwise-line",
  },
  {
    text: "关于",
    link: "/about",
    icon: "mingcute:information-line",
    subMenu: [
      { text: "关于本站", link: "/about" },
      { text: "我的项目", link: "/projects" },
      { text: "订阅 RSS", link: "/feed.xml" },
      { text: "看源码", link: "https://github.com/yy4382/yfi.moe"}
    ],
  },
];
