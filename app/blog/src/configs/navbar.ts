import MingcuteDotGridLine from "~icons/mingcute/dot-grid-fill";
import MingcuteEdit4Line from "~icons/mingcute/edit-4-line";
import MingcuteHistoryAnticlockwiseLine from "~icons/mingcute/history-anticlockwise-line";
import MingcuteInformationLine from "~icons/mingcute/information-line";
import MingcuteChat1Line from "~icons/mingcute/chat-1-line";
export interface NavMenu {
  text: string;
  link?: string;
  icon?: string;
  iconSvg?: typeof MingcuteChat1Line;
  subMenu?: NavMenu[];
}

export const navMenu: NavMenu[] = [
  {
    text: "首页",
    link: "/",
    icon: "mingcute:dot-grid-fill",
    iconSvg: MingcuteDotGridLine,
    subMenu: [
      { text: "站志", link: "/site-history" },
      { text: "致谢", link: "/credits" },
    ],
  },
  {
    text: "文章",
    link: "/post",
    icon: "mingcute:edit-4-line",
    iconSvg: MingcuteEdit4Line,
    subMenu: [
      { text: "介绍 & 教程", link: "/categories/介绍 & 教程" },
      { text: "编程 & 技术", link: "/categories/编程 & 技术" },
      { text: "记录 & 分享", link: "/categories/记录 & 分享" },
      { text: "折腾 & 笔记", link: "/categories/折腾 & 笔记" },
    ],
  },
  {
    text: "碎碎念",
    link: "/note",
    icon: "mingcute:chat-1-line",
    iconSvg: MingcuteChat1Line,
  },
  {
    text: "时光机",
    link: "/achieve",
    icon: "mingcute:history-anticlockwise-line",
    iconSvg: MingcuteHistoryAnticlockwiseLine,
  },
  {
    text: "关于",
    link: "/about",
    icon: "mingcute:information-line",
    iconSvg: MingcuteInformationLine,
    subMenu: [
      { text: "关于本站", link: "/about" },
      { text: "我的项目", link: "/projects" },
      { text: "订阅 RSS", link: "/feed.xml" },
      { text: "看源码", link: "https://github.com/yy4382/yfi.moe" },
    ],
  },
];
