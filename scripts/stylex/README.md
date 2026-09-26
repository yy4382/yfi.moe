# StyleX visual regression harness

This harness gives the Tailwind-to-StyleX migration a deterministic local
content source and two independent kinds of evidence:

- full-page screenshots for every public HTML route shape;
- focused screenshots for visible components and interaction states.

It never edits application source or uses live article data. Astro receives
`file://` URLs for the fixture posts, pages, and image metadata. GitHub card and
comment requests are intercepted in the browser so captures do not depend on
the network.

## Capture the Tailwind baseline

Run this before changing the component being migrated:

```sh
node scripts/stylex/capture.mjs --mode before
```

The command starts its own Astro server on port 4179. If a server with the
fixture environment is already running, point at it instead:

```sh
node scripts/stylex/capture.mjs --mode before --base-url http://127.0.0.1:4179
```

For a fast component iteration, limit the capture scope:

```sh
node scripts/stylex/capture.mjs --mode before --scope components
node scripts/stylex/capture.mjs --mode after --scope components
```

## Capture StyleX and compare

```sh
node scripts/stylex/capture.mjs --mode after
node scripts/stylex/compare.mjs
```

Outputs default to `artifacts.local/stylex/`. `comparison.json` contains exact
dimensions, changed-pixel counts, percentages, and mean absolute RGBA channel
delta. The command exits non-zero for any changed pixel, dimension mismatch,
or missing/failed capture. The migration acceptance result uses exact comparison
with zero pixel tolerance.

## Determinism

The browser uses Chromium at device scale 1, `zh-CN`, `Asia/Shanghai`, reduced
motion, a clock that starts at `2026-09-19T06:00:00Z` and then progresses
normally, desktop/mobile viewports, and light/dark color schemes. Navigation
moves the pointer to the neutral top-left position. The harness waits for
network idle and fonts, suppresses CSS timing, and preserves the settled
application Motion state during screenshots.

Hydrated comments wait at least 2.5 seconds, then require ten consecutive
samples with identical list-header, first-comment, section, document,
inline-height, opacity, transform, and filter output. Failure to stabilize
fails the capture. About/article full-page evidence freezes viewport-unit
declarations to their original computed values, proves this did not change the
original geometry, expands only the viewport height, and proves the final
document/comment geometry is still identical before taking a native
`fullPage: false` screenshot. Other pages use Chromium's native full-page
capture. Native screenshots must themselves be byte-identical for two
consecutive frames; no image stitching or comparison tolerance is used.

The default `--clock native-date` mode offsets only `Date` through an init
script. Native `performance`, timers, RAF, and Web Animations continue
unchanged, so Motion reaches the same settled output as a real browser. The
diagnostic `--clock playwright` mode remains available, but it patches browser
timing APIs and is not used for long-page acceptance screenshots. Every report
and screenshot record stores its clock mode.

To replace the 24 clock- or pointer-sensitive scenarios after a full run while
preserving the other 276 matching captures:

```sh
node scripts/stylex/capture.mjs --mode before --append \
  --target article,about,copy-button-success,copy-button-error,prev-next,footer-copy-error \
  --clock native-date \
  --build-dir artifacts.local/stylex/baseline-dist
node scripts/stylex/capture.mjs --mode after --append \
  --target article,about,copy-button-success,copy-button-error,prev-next,footer-copy-error \
  --clock native-date \
  --build-dir artifacts.local/stylex/.build-sixth
```

The fixtures contain 16 posts to exercise both post and tag pagination. Their
dates span several years. The main article covers article metadata, nested TOC,
reading progress, series cards, prose, alerts, code/copy UI, a mocked GitHub
card, copyright, recommendations, adjacent posts, and the comment shell.

## Route coverage

The matrix covers `/`, both post-list pages, ordinary and paginated tag routes,
`/archive`, `/about`, `/credits`, a page-collection route, a representative
article route, `/404`, and notification settings with both missing and valid
query parameters. One fixture exercises each dynamic route template; it does
not redundantly screenshot all 16 article slugs.

Non-HTML public outputs (`/feed.xml`, sitemap XML, and article OG PNG) should be
validated by build/tests rather than page screenshots. `/achieve` is a redirect
to the already-covered archive page.

## Honest coverage limits

[`coverage.json`](./coverage.json) is the intended component-state inventory.
Each capture also writes a runtime report, so a missing locator or failed state
cannot silently count as covered. The local API covers root and child comment
pagination, edit/delete/reaction success and error outcomes, both clipboard
outcomes, GitHub loading/rate-limit/error cards, and the admin spam badge/menu.
The 300-shot matrix includes every listed state in both themes and both
viewports where applicable. The remaining gap is the real OAuth/magic-link
transport; its visible login and dialog states are covered locally.

## Responsive and interaction verification

Run the focused breakpoint and input-state verifier after producing a candidate
build:

```sh
node scripts/stylex/verify-interactions.mjs \
  --before-build artifacts.local/stylex/baseline-dist \
  --after-build artifacts.local/stylex/.build-sixth
```

It compares exact light/dark screenshots at widths 639, 640, 1023, and 1280
for the home and post-list pages. It also compares keyboard focus, hover, the
mobile drawer, the mobile TOC, and the date popover, and asserts Escape closes
each overlay and the navbar link performs client navigation. Results are stored
under `artifacts.local/stylex/interactions/`.

## Cascade order regression

After `pnpm build:frontend`, run:

```sh
node scripts/stylex/verify-layer-order.mjs
```

This loads the emitted CSS in Chromium and verifies that the shared SSR layer
prelude precedes stylesheet links. Reversing the asset insertion order or adding
a late high-specificity reset must preserve app/comment precedence. The script
uses real generated atomic classes and does not enumerate compiler priority levels.
