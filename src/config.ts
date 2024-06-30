export interface TocItem {
  depth: number;
  slug: string;
  text: string;
}

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

export const algoliaConfig = {
  appId: "1348UVS1GQ",
  readonlyKey: "c1c21db7f7677a90c797ea5f411d8940",
};
