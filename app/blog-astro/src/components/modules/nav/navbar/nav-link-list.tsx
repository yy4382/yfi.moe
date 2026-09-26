import * as stylex from "@stylexjs/stylex";
import { styles } from "./nav-link-list.stylex";

const navLinks = [
  {
    href: "/",
    label: "Home",
    active: (url: URL) => url.pathname === "/",
  },

  {
    href: "/post",
    label: "Posts",
    active: (url: URL) => url.pathname.startsWith("/post"),
  },
  {
    href: "/archive",
    label: "Archive",
    active: (url: URL) => url.pathname.startsWith("/archive"),
  },
];

export function NavLinkList({ url }: { url: URL }) {
  return (
    <ul {...stylex.props(styles.list)}>
      {navLinks.map((link) => {
        const active = link.active(url);
        return (
          <li key={link.href}>
            <a
              href={link.href}
              data-active={active}
              {...stylex.props(styles.link, active && styles.active)}
            >
              {link.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export { navLinks };
