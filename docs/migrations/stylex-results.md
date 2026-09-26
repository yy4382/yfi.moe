# StyleX migration results

Status: complete. All 300 main visual comparisons are pixel-identical, with no missing or failed captures.

## Implementation

53 rendering units were migrated across the Astro application and React comment
library. Component styles use 49 StyleX definition modules, typed style
composition, and build-time CSS extraction. Tailwind, its
typography/icon/animation plugins, Tailwind Merge, and the Tailwind Prettier
plugin have been removed from the UI build dependencies. The lockfile still
contains Tailwind transitively through the unchanged backend development tool
`react-email`; no authored backend source uses Tailwind, and that unrelated
package does not participate in the migrated UI build.

The browser reset, design tokens, semantic icon masks and generated Markdown
prose remain explicit CSS. The Markdown renderer's framework-independent contract
is unchanged. Existing page copy, including historical credits, is unchanged.

## Bundle sizes

Baseline commit: `d6512bdb6dbb3ae65cc2bacd90ee8406a802d1e8`.

Both builds use the same 16-post fixture collection, Node version, platform,
architecture, fonts and compression settings. Their lockfile hashes differ, as
expected for a dependency migration. Raw sizes exclude source maps. Gzip uses
level 9; Brotli uses quality 11. Each row below sums every file of that type in
`app/blog-astro/dist`; it excludes HTML, fonts, images and other resources and is
**not a single page's initial network transfer**. KiB = 1024 bytes.

| App CSS/JS output | Files before → after |   Before raw |    After raw |         Raw change | Before gzip | After gzip |       Gzip change |
| ----------------- | -------------------: | -----------: | -----------: | -----------------: | ----------: | ---------: | ----------------: |
| CSS               |                1 → 2 |   303.90 KiB |   306.15 KiB |  +2,306 B (+0.74%) |   86.02 KiB |  93.21 KiB | +7,360 B (+8.36%) |
| JavaScript        |              23 → 22 |   928.10 KiB |   893.62 KiB | −35,304 B (−3.71%) |  297.78 KiB | 288.96 KiB | −9,041 B (−2.96%) |
| CSS + JavaScript  |              24 → 24 | 1,232.00 KiB | 1,199.77 KiB | −32,998 B (−2.62%) |  383.81 KiB | 382.17 KiB | −1,681 B (−0.43%) |

Brotli CSS changes from 61.89 to 67.86 KiB; JavaScript changes from 260.93 to
253.19 KiB. The combined Brotli reduction is 0.55%.

The independently built comment package changes from 180.19 to 208.26 KiB raw JS
(+15.58%) and from 45.80 to 51.79 KiB gzip (+13.06%). It now also emits an
explicit 17.09 KiB raw stylesheet (4.89 KiB gzip). Its complete standalone output
therefore changes from 45.80 to 56.67 KiB gzip (+11,129 bytes, +23.73%). These
library output sizes must not be added to the application's network cost: the
application build already bundles the library JavaScript and imports its CSS.
The comment library's extra standalone JS carries compiled StyleX property maps;
it no longer relies on its consumer scanning Tailwind utility strings.

CSS grows by 0.74% raw, 8.36% gzip and 9.64% Brotli. The app now emits two CSS
files instead of one. This migration is therefore **not a substantial bundle-size
optimization**: total app CSS+JS gzip saves 1,681 bytes, while CSS alone becomes
larger.

The table reads `targets.blogAstro.totals.css` and `.javascript` from the two
bundle snapshots. It does not use the snapshots' root totals, which add the
standalone comment build to the already bundled app, or treat `resources` as a
separate CSS/JS category. In the snapshot schema, `resources` means every
non-document file and therefore already includes CSS and JavaScript.

## Maintainability

Type-checked property names and explicit `StyleXStyles` overrides replace utility
strings and Tailwind conflict resolution. Style ownership is local to components,
and comments export their CSS through an explicit package entry.

There are significant costs: dedicated style files increase from 2 to 55, and
measured production source grows from 9,269 to 13,927 physical lines (+50.3%).
Astro needs integration code for CSS extraction and HMR; the independently built
comment package requires separate class and cascade-layer namespaces. Generated
prose/icon rules are now maintained directly instead of by Tailwind plugins.
See [the detailed counting method and tradeoffs](./stylex-maintenance.md).

## Validation evidence

- Astro/StyleX development/production probe: eight layout, media, theme,
  hydration and dynamic-value cases pass; HMR edit/restore passes.
- Actual Astro development server: homepage rendering, navigation to posts,
  style application and browser error checks pass.
- Final application production build: 42 pages; comment library build passes.
- Final build and the sixth frozen visual candidate are byte-identical across
  all 475 application files (`final-build-equivalence.json`).
- Astro check: 105 files, zero errors/warnings/hints.
- Workspace checks: 21/21 tasks pass, including 163 tests. Node 26 requires
  `NODE_OPTIONS=--no-experimental-webstorage` for jsdom browser storage.
- Additional responsive/interaction suite: 26/26 exact image comparisons and
  20/20 assertions, including 639/640/1023/1280 widths, both themes, hover,
  keyboard focus, navigation and Escape dismissal.
- Main visual matrix: 300/300 pixel-identical comparisons, zero failures or
  missing captures: 56 full-page pairs and 244 component/state pairs. It includes
  admin spam badges/menus, loading states and failure states.

The screenshot harness uses deterministic local data and a controlled browser
clock, waits for stable rendered geometry and animation output, and requires two
consecutive identical native full-page captures. For the long about/article
pages, it preserves viewport-relative declarations at their original computed
values before expanding the capture viewport. Assertions verify unchanged page,
comment and footer geometry and complete page height. It neither composites
images nor allows pixel tolerance. These are settled-state checks; the separate
interaction suite verifies input and overlay behavior. Twenty-four scenes
(about/article, copy-code outcomes, adjacent-post cards and footer copy errors)
use a Date-only offset while retaining native animation timing; the other 276
use the same Playwright clock configuration on both sides. Each capture record
identifies its clock mode. This distinction avoids interference between simulated
animation timers and native Web Animations; it is not a pixel tolerance.

Artifacts are under `artifacts.local/stylex/`: `before-bundles.json`,
`after-bundles.json`, `comparison/comparison.json`, `interactions/report.json`,
`final-build-equivalence.json`, and the generated `report.html` image slider.
The baseline is frozen in `baseline-dist`; scripts do not fetch live articles or
send real comments, emails or authentication requests.
