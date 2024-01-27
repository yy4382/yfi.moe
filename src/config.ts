
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
    text: "Home",
    link: "/1",
  },
  {
    text: "Achieve",
    link: "/achieve",
  },
  {
    text: "Tags",
    link: "/tags",
  },
  {
    text: "About",
    link: "/about",
  },
];
