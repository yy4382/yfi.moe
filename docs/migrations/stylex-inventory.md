# StyleX migration inventory

This inventory defines the production styling surface and the visual evidence required by the Tailwind CSS to StyleX migration. It was recorded before production component migration. Generated Markdown presentation and global browser rules remain CSS-owned boundaries; removing Tailwind does not require converting those rules into component styles.

## Scope summary

| Area                             | Directly styled units | Notes                                                                            |
| -------------------------------- | --------------------: | -------------------------------------------------------------------------------- |
| `app/blog-astro/src/components`  |                    31 | Astro and React components with utility classes, class composition, or local CSS |
| `app/blog-astro/src/pages`       |                     6 | Pages with direct utility classes or styled component arguments                  |
| `lib/comment/src`                |                    16 | TSX files with direct `className`, `cn`, or `clsx` usage                         |
| Global and generated-content CSS |          4 boundaries | App global/prose CSS, Markdown package CSS, and component-owned global CSS       |

`lib/comment` does not currently ship its own implemented stylesheet. The app's Tailwind entry scans `lib/comment/src` through `@source`, even though the comment package declares a `./css` export. The StyleX migration must replace that implicit source-scanning contract with an explicit compiled-style contract and import.

## Architectural boundaries

ADR 0001, `Keep Markdown rendering UI-independent`, requires `@repo/markdown` to remain independent from StyleX, React, Astro, and other UI-framework lifecycle concerns. The Markdown renderer may emit semantic elements and properties. The blog destination owns their presentation and hydration.

The following output cannot be migrated by attaching a StyleX class to each node at authoring time:

- Article HTML produced from HAST and assigned with `set:html`.
- Comment HTML produced by `renderComment` and assigned with `dangerouslySetInnerHTML`.
- Excerpt HTML assigned with `set:html`.
- Shiki markup and inline syntax colors.
- GitHub alert markup and classes from `remark-github-alerts`.
- GFM tables, task lists, footnotes, lists, headings, blockquotes, and inline code.
- Embedded `copy-button` and `github-repo` elements, which the destination replaces with React UI.
- Link presentation markers currently emitted as `i-mingcute-*` and `prose-link-icon` classes.

Component layout and state styles should move to StyleX. Browser reset, font declarations, generated prose selectors, Shiki and GitHub alert rules, route progress, keyframes, and selectors for raw generated HTML may remain explicit CSS with no Tailwind directives.

## App component inventory

### Layout and shared primitives

- `components/layouts/BaseLayout.astro`: body styling, font variables, Sonner host, and global route-progress transition.
- `components/layouts/NavLayout.astro`: fixed-navbar page offset and layout composition.
- `components/layouts/page-layout.astro`: prose page shell and article typography classes.
- `components/ui/section.astro`: `cva` variants, container-query root, shared container borders/backgrounds, and arbitrary caller classes.
- `components/ui/motion-popover.tsx`: Base UI state attributes, portal positioning, backdrop theme, and Motion popup animation.

### Navigation

- `components/modules/nav/navbar.astro`: Astro/React navigation boundary.
- `components/modules/nav/navbar/navbar.tsx`: fixed translucent header, responsive content swaps, scroll-driven post title, and Motion transitions.
- `components/modules/nav/navbar/logo.tsx`: logo sizing and interactive link.
- `components/modules/nav/navbar/nav-link-list.tsx`: active/hover link states.
- `components/modules/nav/navbar/nav-links-drawer.tsx`: mobile drawer overlay, panel, drag handle, and active link states.
- `components/modules/nav/footer.astro`: responsive link columns, footer metadata, and icon utility classes.

### Post lists

- `components/modules/posts/list-hero.astro`: responsive list heading.
- `components/modules/posts/post-list-layout.astro`: item/pagination composition and conditional last border.
- `components/modules/posts/post-list-item.astro`: container-query spacing/type scale, excerpts, and hover state.
- `components/modules/posts/post-attr-tags.astro`: hash icon and tag hover state.
- `components/modules/posts/post-attr-time-tooltip.tsx`: Base UI popup, CSS-variable origin, and dynamically supplied icon class.
- `components/modules/posts/pagination.astro`: template-string state classes, page ellipsis, disabled buttons, and responsive controls.

### Article

- `components/modules/article/article-hero.astro`: responsive metadata layout.
- `components/modules/article/article-content.astro`: overlapping grid layers, article spacing, TOC, and reading progress.
- `components/modules/article/reading-progress.tsx`: responsive visibility, sticky track, and measured Motion values.
- `components/modules/article/toc/Toc.tsx`: measured sidebar/popover mode, dynamic inline position values, and sticky presentation.
- `components/modules/article/toc/TocEntry.tsx`: depth-dependent dynamic indentation, active marker pseudo-element, and hover/active states.
- `components/modules/article/series-card.astro`: series list, current-item state, and icon.
- `components/modules/article/similar-posts.astro`: container-query cards and parent-hover child color.
- `components/modules/article/prev-next.astro`: conditional grid, container-query cards, parent-hover icon transformations, and icons.
- `components/modules/article/copyright-card.astro`: prose modifiers, raw signature SVG selectors, light/dark stroke, and `grow` keyframes.

### Markdown destination UI

- `components/markdown/markdown-article.astro`: generated article HTML, prose shell, SSR replacement, and client hydration of embedded elements.
- `components/markdown/components/copy-button.tsx`: absolute placement, icon descendant rules, hover/tap Motion, and copy-state transition.
- `components/markdown/components/gh-card.tsx`: loading, error, empty, and populated states; dynamic language color; dark mode; and parent-hover image scale.

### Comments and management

- `components/modules/comments/comment.astro`: article-section placement of the comment island.
- `components/modules/management/subscribe.tsx`: subscription controls, status states, inputs, and buttons.

## Directly styled pages

- `pages/index.astro`: hero, statistics, project cards, contact icons, dynamic background colors, responsive grids, and local decoration selectors.
- `pages/archive.astro`: grouped archive list, truncation, container queries, and coarse-pointer spacing.
- `pages/404.astro`: call-to-action buttons and prose block.
- `pages/account/notification.astro`: constrained management layout.
- `pages/about.mdx`: `not-prose` contact links, dynamic colors/icons, and parent interaction states.
- `pages/post/[slug]/index.astro`: styled section separators and article composition.

The list and static content routes also require page-level coverage even when their route files contain no direct classes: `pages/post/[...page].astro`, `pages/tags/[tag]/[...page].astro`, `pages/[page].astro`, and `pages/credits.mdx`.

## Comment-library inventory

### Composition and transitions

- `comment/index.tsx`
- `components/transitions/auto-resize-height.tsx`

### Editor and identity boxes

- `comment/box/input-box.tsx`
- `comment/box/magic-link-dialog.tsx`
- `comment/box/user-box.tsx`
- `comment/box/visitor-box.tsx`

### Comment list and reactions

- `comment/list/index.tsx`
- `comment/list/comment-parent.tsx`
- `comment/list/comment-item.tsx`
- `comment/reactions.tsx`

### UI primitives

- `components/ui/button.tsx`
- `components/ui/dialog.tsx`
- `components/ui/dropdown-menu.tsx`
- `components/ui/input.tsx`
- `components/ui/label.tsx`
- `components/ui/tabs.tsx`

Components without direct classes, such as edit/new wrappers, providers, and comment dropdown composition, are still covered through their styled descendants and interactive states.

## Global CSS, icons, motion, and dynamic styles

### CSS boundaries

- `app/blog-astro/src/styles/global.css` imports Tailwind, typography, animation, and icon plugins; defines light/dark tokens, fonts, shadows, radii, reset rules, shared layout utilities, grid background, breakpoints, and form quirks.
- `app/blog-astro/src/styles/prose.css` overrides Tailwind typography link, code, blockquote, and prose-width behavior.
- `lib/markdown/src/style/index.css` imports GitHub alert themes and positions copy controls.
- `BaseLayout.astro` owns the font-family application and route-progress CSS.
- `copyright-card.astro` owns raw signature SVG selectors and animation.
- `index.astro` owns section decorations that rely on structural selectors.

### Icons

App Astro markup uses `@egoist/tailwindcss-icons` class names from Lucide and Mingcute. Several icon names come from `config/author.ts`; article link icons come from `@repo/markdown`. These need an explicit icon map, component, sprite, or standalone generated icon CSS before the Tailwind icon plugin can be removed. Comment-library icons use `~icons` SVG React components and only their sizing/color styles need migration.

### Motion

Motion for React is used by navbar transitions, popovers, reading progress, TOC controls, copy feedback, comment expansion, auto-resize, and identity controls. CSS animation helpers provide spinner, pulse, Radix/Base UI enter/exit, fade, slide, and zoom states. The signature and route progress use handwritten CSS. Static screenshots must wait for a stable state; interaction checks must separately cover opening, closing, focus, scroll, and reduced motion.

### Runtime composition

- `cn` combines `clsx` and `tailwind-merge` in both the app and comment package.
- `section.astro` uses `class-variance-authority` and accepts utility strings from callers.
- Pagination builds classes with template strings.
- TOC and reading progress combine static classes with measured inline values.
- Time tooltip receives an icon class string.
- Author/project/contact configuration stores icon class strings.
- Base UI and Radix primitives depend on `data-*`, `aria-*`, descendant, focus, and portal selectors.
- Parent states use `group-hover`, `group-active`, and `group-data-*`; child and file-input rules use arbitrary selectors.
- Container queries are functional behavior, especially in Section, list cards, similar/previous cards, and archive headings. They must not be replaced mechanically with viewport queries.

Two current class strings appear invalid: `group-hover:text-primary-foreground]` in `about.mdx` and `text-blue-70` in `comment/reactions.tsx`. The migration baseline is the current computed result. Any correction should be reviewed separately so it does not hide a migration difference.

## Migration batches

1. Prove production and development compilation for one Astro leaf and one hydrated React leaf. Include media queries, pseudo states, dynamic values, SSR HTML, hydration, and extracted CSS.
2. Replace global tokens and shared layout utilities while retaining explicit CSS for reset and generated content.
3. Migrate shared primitives and layouts, then navigation and list components.
4. Migrate article layout, TOC, progress, cards, and Markdown destination components.
5. Build and consume explicit StyleX output for `@repo/comment`; migrate primitives before composed comment states.
6. Replace icon generation, typography utilities, animation helpers, and every dynamic utility-string API.
7. Remove Tailwind plugins, `tailwind-merge`, and unused composition dependencies only after repository search and visual coverage are clean.

## Visual coverage matrix

Use fixed fixture content, time, fonts, network responses, viewport, and color scheme. Capture before and after at the same URL and state. Disable or settle motion for pixel comparison, then test motion and focus behavior separately.

| Surface                                              | Required states                                                                                       | Viewports/themes                         |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Home `/`                                             | Hero, statistics, project rows, project hover/active, contact icons, footer                           | 375, 768, 1280; light/dark               |
| Post list `/post/`                                   | Short/long titles, excerpt visibility, tags, date tooltip, first/middle/last pagination states        | 375, 768, 1280; light/dark               |
| Tag list `/tags/StyleX/`                             | Reused list plus tag-specific heading and multi-page pagination                                       | 375, 1280; light/dark                    |
| Archive `/archive`                                   | Multi-year groups, long-title truncation, hover, coarse-pointer spacing                               | 375, 1280; light/dark                    |
| Article `/post/stylex-migration`                     | Full prose fixture, all embedded elements, cards, series, similar, previous/next, copyright, footer   | 375, 768, 1280, 1600; light/dark         |
| Article navigation                                   | Mobile TOC popover, wide TOC sidebar, active heading, scroll navbar title, reading progress           | 375 and 1600; light/dark                 |
| Markdown embeds                                      | GitHub card loading/error/success, code copy idle/success, external-link icon kinds                   | 375 and 1280; light/dark                 |
| Comments                                             | Loading, empty, visitor, authenticated user, nested reply, edit, admin/spam, reaction inactive/active | 375 and 1280; light/dark                 |
| Comment overlays                                     | Emoji picker, action dropdown, login/signup dialog, validation, loading, email sent, toast            | 375 and 1280; light/dark; keyboard focus |
| Static content `/fixture-page`, `/about`, `/credits` | Prose, alert, inline code, links, `not-prose`, contact icons                                          | 375 and 1280; light/dark                 |
| Utility routes `/account/notification`, `/404`       | Form states, calls to action, prose and footer                                                        | 375 and 1280; light/dark                 |
| Global shell                                         | Initial navbar, route transition progress, responsive drawer, Sonner toast, footer                    | 375 and 1280; light/dark; reduced motion |

Component-level captures should crop or target the component root. Page-level captures should additionally cover the complete route. A missing backend or authenticated fixture is recorded as unavailable, not counted as a pass.

## Bundle evidence

Run equivalent clean production builds before and after migration, then record them with:

```sh
node scripts/stylex/measure-bundles.mjs before
node scripts/stylex/measure-bundles.mjs after
node scripts/stylex/measure-bundles.mjs compare
```

The snapshots include per-file and aggregate raw, gzip, and Brotli byte counts for CSS and JavaScript, plus separate resource and non-resource totals. Source maps are excluded. A missing or empty build directory is an error so the report cannot silently substitute zero-byte output.
