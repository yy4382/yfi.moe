export const data = {
  navMain: [
    {
      title: "Comments",
      url: "/admin/comments",
    },
    {
      title: "Users",
      url: "/admin/users",
    },

    {
      title: "Analytics",
      url: "/admin/analytics",
      items: [
        {
          title: "Umami",
          url: "/admin/analytics/umami",
        },
        {
          title: "Posthog",
          url: "/admin/analytics/posthog",
        },
      ],
    },
  ],
};

type NavItem = {
  title: string;
  url: string;
  items?: NavItem[];
};
type Breadcrumb = { title: string; url: string };

/**
 * Return the breadcrumb (array of {title, url}) that leads to the
 * *deepest*‑nested nav item whose `url` starts with `urlPrefix`.
 *
 * If there is no match, the function returns an empty array.
 */
export function breadcrumbForPrefix(
  urlPrefix: string,
  nav: NavItem[],
): Breadcrumb[] {
  let best: { length: number; trail: Breadcrumb[] } = { length: -1, trail: [] };

  function dfs(items: NavItem[], trail: Breadcrumb[]) {
    for (const item of items) {
      const nextTrail = [...trail, { title: item.title, url: item.url }];

      if (item.url.startsWith(urlPrefix) && item.url.length > best.length) {
        best = { length: item.url.length, trail: nextTrail };
      }

      if (item.items) dfs(item.items, nextTrail);
    }
  }

  dfs(nav, []);
  return best.trail;
}
