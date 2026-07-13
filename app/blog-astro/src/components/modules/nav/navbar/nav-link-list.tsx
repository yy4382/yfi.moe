import * as stylex from "@stylexjs/stylex";
import { colors, motion, spacing } from "@repo/design-tokens/tokens.stylex";

const navLinks = [
  { href: "/", label: "Home", active: (url: URL) => url.pathname === "/" },
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
      {navLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            data-active={link.active(url)}
            {...stylex.props(styles.link, link.active(url) && styles.active)}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

const styles = stylex.create({
  list: {
    display: "flex",
    flexWrap: "nowrap",
    gap: spacing.lg,
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  link: {
    color: colors.textMuted,
    textDecoration: "none",
    transitionDuration: motion.durationFast,
    transitionProperty: "color",
    ":hover": { color: colors.accentText },
  },
  active: { color: colors.accentText },
});

export { navLinks };
