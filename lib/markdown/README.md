# `@repo/markdown`

`@repo/markdown` is the blog monorepo's tailor-made Markdown rendering module. Callers select a named rendering mode; they do not assemble Unified presets, choose sync or async execution, or override Markdown-processing policy.

## Public interface

All modes are asynchronous. Each mode defines the result shape needed by its callers instead of conforming to one generic renderer result.

### Article mode

```ts
import { renderArticle } from "@repo/markdown/article";
import "@repo/markdown/style";

const { hast, outline } = await renderArticle(markdown, {
  imageMetadata,
});
```

Article mode returns a HAST root and an outline whose heading identifiers match the rendered headings. Image metadata is destination-supplied domain data; Article mode owns how it enriches images.

The destination works directly with HAST to realize the closed catalog of embedded elements. It owns UI components, HAST-to-UI conversion, serialization, SSR, hydration, and lifecycle. It must handle every embedded element Article mode can emit. The current catalog is:

- `copy-button`, with no properties;
- `github-repo`, with `user` and `repo` string properties.

A malformed recognized embedded element fails rendering. Adding an element requires coordinated catalog and destination changes.

Article mode currently requires the exported `@repo/markdown/style` stylesheet. Required styles for every mode must be listed in this README as the module evolves; importing them remains the caller's responsibility.

### Comment mode

```ts
import { renderComment } from "@repo/markdown/comment";

const html = await renderComment(markdown);
```

Comment mode returns sanitized HTML for reader-authored content. It preserves the current user-generated external-link policy, including isolation and `nofollow` behavior.

### Excerpt mode

```ts
import { renderExcerpt } from "@repo/markdown/excerpt";

const html = await renderExcerpt(selectedMarkdown);
```

The caller selects excerpt content. Excerpt mode converts that selected Markdown into formatted HTML. An authored plain-text description bypasses this mode and is displayed directly.

### Feed mode

```ts
import { renderFeed } from "@repo/markdown/feed";

const html = await renderFeed(postBody);
```

Feed mode renders one post body into feed-appropriate HTML. It gives every recognized embedded element a useful static fallback and retains the warning that feed content can provide less functionality than the article. The caller owns RSS item construction, feed metadata, limits, and delivery.

## Interface rules

- A new rendering intent becomes a new named mode.
- A semantic variation within an existing intent may become a mode option when the blog actually needs it.
- Option names describe content or rendering semantics, never processor mechanics.
- Callers cannot inject presets or override mode policy.
- Generic parser, preset, and wildcard plugin exports are not part of the public interface.
- Rendering behavior remains unchanged unless a mode contract above explicitly changes it.

Mode contract tests are the primary verification surface. Existing focused plugin tests remain useful internal tests and are retained.
