import MingcuteDotGridLine from "@comp/icons/MingcuteDotGridLine.vue";
import MingcuteEdit4Line from "@comp/icons/MingcuteEdit4Line.vue";
import MingcuteHistoryAnticlockwiseLine from "@comp/icons/MingcuteHistoryAnticlockwiseLine.vue";
import MingcuteInformationLine from "@comp/icons/MingcuteInformationLine.vue";
export interface NavMenu {
  text: string;
  link?: string;
  icon?: string;
  vueIcon?: unknown;
  subMenu?: NavMenu[];
}

export const navMenu: NavMenu[] = [
  {
    text: "首页",
    link: "/",
    icon: "mingcute:dot-grid-fill",
    vueIcon: MingcuteDotGridLine,
    subMenu: [{ text: "站志", link: "/site-history" }],
  },
  {
    text: "文章",
    link: "/post",
    icon: "mingcute:edit-4-line",
    vueIcon: MingcuteEdit4Line,
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
    vueIcon: MingcuteHistoryAnticlockwiseLine,
  },
  {
    text: "关于",
    link: "/about",
    icon: "mingcute:information-line",
    vueIcon: MingcuteInformationLine,
    subMenu: [
      { text: "关于本站", link: "/about" },
      { text: "我的项目", link: "/projects" },
      { text: "订阅 RSS", link: "/feed.xml" },
      { text: "看源码", link: "https://github.com/yy4382/yfi.moe" },
    ],
  },
];
