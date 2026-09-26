# StyleX migration maintenance comparison

This comparison uses commit `d6512bdb6dbb3ae65cc2bacd90ee8406a802d1e8` (the pre-migration `HEAD`) as the Tailwind baseline and the current working tree as the StyleX implementation. It measures authored source only. Generated `dist` output and package sizes are intentionally excluded; those are reported from the final production builds.

The quantitative tables describe the initial migration acceptance snapshot on
2026-09-19. The subsequent shared-layer configuration cleanup is documented in
[the migration notes](./stylex.md#shared-layer-contract-2026-09-26).

## Scope and counting rules

The source scope is limited to `app/blog-astro/src/**` and `lib/comment/src/**`.

- A **migrated rendering unit** is a changed `.astro`, `.tsx`, or `.mdx` file in that scope. This is a file-level measure, not a count of every nested React function.
- A **dedicated style file** is either `*.stylex.ts` or `.css` in that scope.
- LOC is physical lines, including comments and blank lines. This avoids subjective decisions about whether a declaration or selector is “logic.”
- A **literal class line** contains a `class=` or `className=` assignment. Remaining lines include semantic prose/icon markers and compatibility plumbing; they are not assumed to be Tailwind utilities.
- A **style attachment line** contains a class assignment, a typed style prop assignment (`styles`, `outerStyles`, or `containerStyles`), or a `stylex.props(...)`/`stylex.attrs(...)` call.
- Dependency changes compare only direct declarations in the root, app, and comment `package.json` files. Transitive lockfile entries are not counted.

The source metrics can be reproduced by listing the baseline with `git ls-tree -r --name-only HEAD -- app/blog-astro/src lib/comment/src`, reading baseline contents with `git show HEAD:<path>`, and comparing them with the same files in the working tree. The lexical attachment expressions are:

```text
literal class:       \bclass(?:Name)?\s*=
style attachment:    \b(class|className|styles|outerStyles|containerStyles)\s*=
                     or stylex\.(props|attrs)\(
```

## Quantitative result

| Measure                                            | `HEAD` Tailwind | Current StyleX |          Change |
| -------------------------------------------------- | --------------: | -------------: | --------------: |
| Migrated rendering units                           |               0 |             53 |             +53 |
| Rendering units importing StyleX directly          |               0 |             51 |             +51 |
| StyleX definition files                            |               0 |             49 |             +49 |
| Dedicated style files                              |               2 |             55 |             +53 |
| Dedicated style LOC                                |             344 |          4,769 |          +4,425 |
| Ordinary CSS files                                 |               2 |              6 |              +4 |
| Ordinary CSS LOC                                   |             344 |          1,876 |          +1,532 |
| StyleX definition LOC                              |               0 |          2,893 |          +2,893 |
| Literal class lines in rendering files             |             429 |             79 |   -350 (-81.6%) |
| Style attachment lines in rendering files          |             429 |            465 |     +36 (+8.4%) |
| Production source files in the measured extensions |             119 |            171 |             +52 |
| Production source LOC in the measured extensions   |           9,269 |         13,927 | +4,658 (+50.3%) |

The 53 migrated units are the 37 app units recorded in the inventory (31 components and six pages) plus 16 comment-library units. Of these, 35 app units and all 16 comment units import StyleX directly. Two app composition files consume migrated typed style APIs without needing their own StyleX import.

There are 33 app StyleX definition files and 16 comment StyleX definition files. The current six ordinary CSS boundaries are:

| Boundary           |   LOC | Reason it remains ordinary CSS                     |
| ------------------ | ----: | -------------------------------------------------- |
| `foundation.css`   |   296 | Browser reset and global element behavior          |
| `tokens.css`       |   250 | Shared theme/custom-property contract              |
| `icons.css`        |   184 | Runtime semantic icon markers and exact masks      |
| `prose-stylex.css` | 1,027 | Markdown-generated HTML and typography descendants |
| `reactions.css`    |    54 | Reaction popover state/side animation composition  |
| `ui.css`           |    65 | Primitive pseudo-elements and structural selectors |

The LOC result should be read literally: the migration substantially increases authored style code and file count. Style declarations that were compressed into utility strings are now explicit, and the migration preserves the generated typography/icon behavior that Tailwind plugins previously supplied. The benefit is stronger ownership and static checking, not fewer lines.

## Direct dependency change

Across the three measured manifests, 11 direct declarations were removed and four were added, a net reduction of seven declarations.

| Manifest              | Added                | Removed                                                                                                                                                       |
| --------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root development      | —                    | `prettier-plugin-tailwindcss`                                                                                                                                 |
| Astro app runtime     | `@stylexjs/stylex`   | `@tailwindcss/typography`, `@tailwindcss/vite`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss`, `tailwindcss-animated`, `tw-animate-css` |
| Astro app development | `@stylexjs/unplugin` | `@egoist/tailwindcss-icons`                                                                                                                                   |
| Comment runtime       | `@stylexjs/stylex`   | —                                                                                                                                                             |
| Comment development   | `@stylexjs/unplugin` | —                                                                                                                                                             |
| Comment peer          | —                    | `tailwind-merge`                                                                                                                                              |

There are two newly introduced package identities: `@stylexjs/stylex` and `@stylexjs/unplugin`. They are declared in both packages because the app and comment library compile independently. `clsx` is no longer an app dependency but remains in the comment package for the temporary `className` compatibility surface, so it has not disappeared from the workspace entirely.

## Maintainability gains

Component state, media queries, pseudo states, and theme branches now live beside the component in named StyleX definitions. Reviewers can find a component's declarations without decoding long utility strings or tracing Tailwind plugin output. Atomic declarations are statically compiled, and invalid property/value shapes surface during TypeScript or StyleX compilation.

Shared component customization is now explicit. Eight primitive modules declare 31 `StyleXStyles`-typed override props, and ten rendering modules make 27 override assignments. This replaces arbitrary utility-string composition for `Section`, comment primitives, and transitions. The API makes the override channel discoverable and catches non-StyleX values, while still allowing broad style overrides; it does not enforce semantic variants as narrowly as a dedicated variant type would.

Literal class assignments fell from 429 lines to 79. The remaining assignments mainly join StyleX-generated class names with required semantic markers such as `prose`, icon names, `not-prose`, raw generated-content hooks, and comment-library compatibility `className` values. This reduces dependence on utility-token spelling and removes `tailwind-merge`, but it does not eliminate string composition.

The comment library now owns and exports its compiled stylesheet. The app imports `@repo/comment/css` explicitly instead of asking Tailwind to scan another package's source. This makes the package boundary visible and lets another consumer load the same component CSS without copying the blog's Tailwind configuration.

## Added maintenance cost

The Astro app has a small custom StyleX integration and a shared root layer contract. It fixes stylesheet extraction for Astro, disables CSS splitting for the current pipeline, injects the development virtual stylesheet, and forces a full reload when a `*.stylex.ts` file changes. These behaviors are migration infrastructure that must be checked when Astro, Vite, or StyleX is upgraded.

The comment package has its own StyleX compiler configuration because it ships JavaScript and CSS independently. It uses both a `comment` CSS-layer namespace and the `c` atomic-class prefix. Both are necessary: a layer prefix alone does not prevent identical atomic hashes from the app and library from matching the same element and changing responsive precedence. Future library build changes must preserve both forms of isolation.

Generated Markdown cannot receive per-node StyleX props because the renderer deliberately remains UI-independent and emits HTML that is inserted at runtime. The 1,027-line prose stylesheet therefore remains a selector-based contract. The same applies to runtime icon marker classes in `icons.css`. These files preserve exact behavior, but they retain the usual global-CSS risks: selector drift, ordering dependencies, and weaker static linkage between a producer's marker and a consumer's rule.

The typed override API also creates more visible plumbing. The measured number of style attachment lines rises from 429 to 465, and the source tree gains 52 files and 4,658 physical lines. Smaller component markup and typed declarations may be easier to review locally, but the repository has more artifacts to navigate and more compiler-specific concepts to learn.

## Maintenance assessment

The migration trades compact Tailwind syntax and plugin-provided behavior for explicit component ownership, typed composition, and an independently consumable comment stylesheet. The strongest improvement is at package and component boundaries: styles no longer depend on Tailwind source scanning, arbitrary utility merging, or app-only plugin configuration.

The trade is substantial authored surface area. Exact preservation of reset, typography, icons, generated HTML, and responsive behavior accounts for most of the increase. Future work should judge maintainability through defect rate and change locality rather than LOC reduction. Useful follow-up indicators are the number of files touched for a visual change, StyleX/type failures caught before screenshots, remaining compatibility `className` callers, and regressions in the visual matrix.

The workspace still resolves a transitive `tailwindcss` dependency for the unchanged backend `react-email` package. Removing the app/comment Tailwind toolchain does not require removing that independent email tool.
