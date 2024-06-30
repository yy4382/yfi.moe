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
  },
  {
    text: "文章",
    link: "/post",
    icon: "mingcute:edit-4-line",
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
  },
];
