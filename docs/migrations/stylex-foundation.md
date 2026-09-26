# StyleX foundation CSS

This document records the global CSS that must survive the Tailwind removal. The
three stylesheets described here are migration inputs and are not imported by the
application yet. Keeping them disconnected lets component screenshots continue to
use the frozen Tailwind baseline until the controlled switchover.

## Files and ownership

- `app/blog-astro/src/styles/foundation.css` contains the theme variables,
  Tailwind-compatible reset, base element rules, and the small global quirks used
  by the current app. It deliberately contains no general-purpose utility classes.
- `app/blog-astro/src/styles/prose-stylex.css` contains the generated-content
  typography contract: `.prose`, `.prose-sm`, `.prose-gray`, dark-mode inversion,
  the existing prose element modifiers, and the app's article overrides.
- `app/blog-astro/src/styles/icons.css` contains the exact data-URI masks emitted
  in the baseline for the 16 icon classes still present in templates or generated
  Markdown. Every icon retains an intrinsic `1em` square; component StyleX styles
  may override its rendered dimensions.

The font files and generated `@font-face` rules remain owned by `BaseLayout` and
the Vite font integration. They are intentionally absent from the foundation.

The Markdown package remains UI-framework independent, as required by
`docs/adr/0001-keep-markdown-rendering-ui-independent.md`. The renderer continues
to produce semantic HTML and stable class markers; the Astro destination owns the
prose and icon presentation. `remark-github-alerts` styles and `.copy-code-pre`
remain in `@repo/markdown/style` and are not duplicated here.

## Cascade layers

`foundation.css` declares this complete order before any rules are evaluated:

```css
@layer reset, theme, base, prose, icons, priority1, priority2, priority3, priority4, priority5, priority6, priority7, priority8, priority9, priority10;
```

The first five layers hold global contracts. StyleX with `useCSSLayers` emits its
atomic declarations into the `priority*` layers, so component declarations win
without specificity escalation. At switchover, import the files in this order:

1. `foundation.css`
2. `prose-stylex.css`
3. `icons.css`
4. StyleX output

The explicit layer statement fixes priority even if the bundler later changes the
physical order of individual rules. Repeated StyleX `@layer priorityN` statements
are harmless because the first layer-order declaration controls the cascade.

## Former custom utilities

These project-specific utilities should become explicit StyleX component styles.
The foundation exposes the values needed to reproduce them exactly:

| Former utility              | Style contract                                                                                                                                          | Foundation values                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `center`                    | `align-items: center; justify-content: center` on the component's existing flex/grid display                                                            | No token required                                                                                                      |
| `main-container`            | Border-box, centered, `width` and `max-width: 100vw`; from `40rem`, `width: calc(100vw - 100px)` plus 1px inline borders; from `80rem`, `width: 1120px` | `--layout-page-gutter: 50px`, `--layout-page-max-width: 1120px`, `--container-border`                                  |
| `bg-grid`                   | Two 1px linear gradients, `background-size: 14px 14px`, `background-position: -1px -1px`, border-box sizing                                             | `--container-light-border`                                                                                             |
| `color-transition-card-btn` | Color/background transition for 150ms with `cubic-bezier(0.4, 0, 0.2, 1)`; hover uses accent background and accent foreground                           | `--default-transition-duration`, `--default-transition-timing-function`, `--color-accent`, `--color-accent-foreground` |
| `prose-link-icon`           | A `0.75lh` square aligned to `text-bottom`                                                                                                              | Icon mask classes still provide their independent `1em` intrinsic baseline                                             |

Other palette, typography, radius, shadow, layout, transition, and easing values
needed by component migrations are named in the `theme` layer. Components should
reference those variables from StyleX instead of rebuilding a runtime utility
interpreter.

## Generated HTML and icons

The prose stylesheet intentionally retains selector-based presentation for HTML
that is not authored as Astro or React components: articles, excerpts, and comment
content. Its modifiers are a bounded generated-content API rather than a generic
utility set.

The icon stylesheet is also a compatibility boundary. In particular, Markdown
may emit `i-mingcute-*` markers at runtime, so those selectors cannot be replaced
only with build-time component imports. The remaining Lucide and Mingcute classes
can move to an explicit icon map later, after all template callers have migrated.
Until then the exact baseline masks avoid glyph or view-box drift.

## Intentionally omitted CSS

The migration does not carry over Tailwind's general utility selector set, its
`--tw-*` transform/filter/gradient machinery, or its registered custom properties.
Those rules existed to implement utilities and should disappear as components move
to StyleX. Animation keyframes or helpers should be retained only by the component
that still uses them.

`artifacts.local/stylex/utility-reference.json` is a mechanical index of the
baseline utility rules. Each entry records selectors, declarations, `!important`,
and surrounding layer/media/support/container conditions. It is migration evidence
for exact component conversions and is not production input.

The source baseline is
`artifacts.local/stylex/baseline-css/app-blog-astro/NavLayout.DNl-0o3q.css`
(SHA-256 `4f6b015894c7ac72d975574a4aa749db68e5bc13b8e7a172325503f42532aeea`).
The new files have been checked with both PostCSS parsing and Lightning CSS
transformation. Visual equivalence remains gated by the component and full-app
screenshot comparisons before these files replace `global.css`.
