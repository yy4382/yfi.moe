# Tailwind CSS → StyleX migration

Status: complete. Astro/React compatibility verified; 53 rendering units migrated; UI Tailwind build integration removed. All 300 main visual comparisons are pixel-identical. See [results and size measurements](./stylex-results.md).

## Acceptance criteria

- Validate Astro development, static production CSS, React hydration, media queries, pseudo states, dynamic values, and shared styles before converting components.
- Preserve layout, fonts, colors, icons, responsive behavior, focus states and motion. No redesign.
- Capture each component before and after migration, then repeat page-level checks on desktop/mobile and light/dark themes. A missing capture is not a pass.
- Compare raw/gzip/Brotli CSS and JavaScript output from equivalent production builds, with the same content and build environment.
- Remove Tailwind tooling only after all callers, Markdown presentation hooks, and comment-library consumers have replacements.

## Sequence

1. Inventory styles and establish deterministic content/API fixtures and screenshots.
2. Run the isolated Astro/React compatibility probe in `scripts/stylex/probe`.
3. Record baseline build sizes and screenshot coverage before changing production styles.
4. Define shared tokens, reset, layout primitives, and StyleX compilation for Astro and the comment library. Preserve the Markdown/UI seam in ADR 0001.
5. Migrate primitive components, then layout/navigation, article/list components, embedded elements, comment UI, and page-specific styles. Review component screenshots after each batch; fix differences before continuing.
6. Replace Tailwind directives, typography, icons and animation helpers with explicit equivalents; remove unused dependencies and class-merging tools.
7. Run type/lint/test checks and production builds, repeat the full visual matrix, and report size and maintenance tradeoffs with evidence.

## Integration candidate

Use official `@stylexjs/unplugin` with style definitions in adjacent TypeScript modules, `stylex.attrs` in Astro, and `stylex.props` in React. This avoids depending on transformation of Astro frontmatter until proven supported. Version 0.19.0 satisfies the repository's seven-day dependency release-age policy; 0.19.1 does not as of 2026-09-19.

Official references:

- https://stylexjs.com/docs/learn/installation/vite/
- https://stylexjs.com/docs/api/javascript/attrs/
- https://docs.astro.build/en/guides/styling/

## Measurement rules

Screenshots use fixed viewport, color scheme, content and clock, wait for fonts and hydration, and report pixel differences. Motion settling must be identical before/after. Static end-state screenshots do not establish animation equivalence: verify opening/closing, focus, keyboard and responsive interactions separately. Unavailable authenticated/backend states must be recorded explicitly.

Global reset and generated Markdown prose are intentionally CSS-owned presentation boundaries, not excuses to retain a Tailwind runtime or rebuild a string-based utility interpreter. Component styles should be named by purpose and composed through typed StyleX APIs.

## Compatibility results (2026-09-19)

- Astro 7.0.3 / React integration 6.0.0 / StyleX 0.19.0: static build passes.
- Eight browser cases (development/production × 375/1280 px × light/dark) pass: SSR layout, media queries, hover, React hydration and dynamic width after click. Evidence: `artifacts.local/stylex/probe/results.json` and component PNGs.
- The default Astro CSS inlining produced HTML classes without the StyleX CSS. `build.inlineStylesheets: "never"` is required for the official plugin's emitted-asset injection.
- Imported `.stylex.ts` changes need an Astro full-page refresh to replace server-rendered class attributes; the CSS-only HMR runtime alone does not update that HTML. A small Vite hook now passes edit-and-restore HMR checks.
- Probe Vite cache is isolated from the application; sharing a symlinked dependency cache between simultaneous builds and development caused invalidated module fetches.
- Use a single CSS asset in the application build so every page receives the complete StyleX output, and verify all routes after integration.

## Component conventions

- Put `stylex.create` in a neighboring `*.stylex.ts` file. Page styles belong in `src/styles/pages`, outside Astro’s route directory. Astro spreads `stylex.attrs`, React spreads `stylex.props`.
- Keep existing semantic icon and prose classes at generated-HTML boundaries; component layout and appearance belong to named StyleX rules.
- Use the existing CSS custom properties for colors and font metrics so themes preserve their exact computed values.
- Keep container queries as container queries, including their original thresholds; preserve hover capability guards.
- Introduce typed style overrides for reusable components as their callers migrate. Use `styles` for style overrides; `className` passthrough is only for semantic hooks or external DOM integration.
- Read `artifacts.local/stylex/baseline-css` for exact current declarations, including invalid utilities that currently have no effect. Do not fix unrelated visual bugs during this migration.

- Full-page regression exposed route-dependent server/client CSS link ordering: a client CSS asset could define StyleX priority layers before Tailwind's reset, causing reset to override atomic declarations on page 2. Explicitly declare all baseline layers ahead of StyleX using `useCSSLayers.before`, so the cascade is independent of asset load order.

## Findings from migration checks

- Theme tokens are explicitly retained in `tokens.css`; styles no longer depend on a utility scanner to emit a variable. This also supplies the named line-height tokens used by StyleX.
- Use disjoint width intervals for multiple breakpoints on the same property. Overlapping container queries are sorted by generated declarations rather than mobile-first source order.
- The independently compiled comment library uses the class prefix `c` and namespaces its priority layers under `comment`; the app declares that layer before its own priorities. Each build therefore owns its priority indexes.
- The comment library exports `@repo/comment/css`, imported by the application layout. StyleX runtime stays external in the library and is resolved by the application.
- Vitest uses the official Rollup adapter for transformation. The Vite adapter installs an HMR interval that waits for an HTTP server close event, which never fires in Vitest's serverless environment.
- On Node 26, run tests with `NODE_OPTIONS=--no-experimental-webstorage` so jsdom supplies browser storage rather than Node's unavailable native storage getter.

Identical atomic class hashes in separately prioritized app/library layers can make the app’s default rule override a library media rule. Both class and layer namespaces are necessary; the screenshot matrix exposed this on dialog alignment and responsive input text.

## Shared layer contract (2026-09-26)

`stylex-layers.ts` at the repository root is the single source of top-level
cascade order. Both compiler configurations use `stylexLayers(namespace)`; the
app's internal priorities live under `app`, and the comment library's under
`comment`. The compiler chooses the priority sublayer names and count.

`BaseLayout` emits `stylexLayerOrder` as an inline CSS statement before all
stylesheet links, including the development virtual stylesheet. Keep this
statement ahead of CSS: a later ordering declaration cannot reorder layers
that have already been established. `foundation.css` owns reset/base rules,
not layer order. The comment library retains its independent `c` class prefix.
The root contract is a Turbo global dependency so a configuration change cannot
reuse stale compiled CSS from either package.

No custom CSS parser, generated source file, or additional Vite plugin is needed.
After building, run `node scripts/stylex/verify-layer-order.mjs` to check the
emitted SSR prelude, real app/comment atomic rules, both asset insertion orders,
and a late high-specificity reset. The follow-up screenshot matrix compares
28 desktop/mobile and light/dark cases against the frozen migration build; all
28 are pixel-identical. Evidence is in `artifacts.local/stylex-layer-contract/`.
