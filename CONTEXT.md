# Blog Content

The language for source material transformed into content used by the blog.

## Language

### Markdown rendering

**Markdown rendering**:
The transformation of Markdown source into a destination-appropriate representation.
_Avoid_: Markdown utility, Markdown publishing

**Rendering mode**:
A named, complete set of rendering rules selected according to where the result will appear. A new mode represents a new rendering intent; callers cannot override its rules, and each mode defines an output tailored to its callers' needs.
_Avoid_: Preset, renderer options

**Mode option**:
A semantic variation within one rendering mode that exists only when required by the blog's behavior. Its name describes a difference in rendering intent or content, never a Markdown-processing mechanism.
_Avoid_: Plugin option, renderer flag, preset override

**Embedded element**:
A named semantic element, with agreed properties, that Markdown rendering asks a destination to realize. Its presentation and interactivity belong to the destination, which must support every embedded element its selected mode can produce; a malformed recognized element fails rendering.
_Avoid_: React component, placeholder tag

**Article mode**:
The rendering mode for a full post presented on the blog. It produces an article outline whose references match the rendered headings.

**Article outline**:
The ordered heading references of a rendered article, including each heading's text, depth, and anchor.
_Avoid_: TOC data, separately parsed headings

**Image metadata**:
Intrinsic dimensions and placeholder information associated with an image source. Article rendering may receive this data from its destination, while retaining ownership of how it enriches the rendered image.
_Avoid_: File data, image plugin options

**Comment mode**:
The rendering mode that converts reader-authored discussion into sanitized HTML. External links are treated as user-generated content and isolated from the blog's trust and navigation context.

**Excerpt mode**:
The rendering mode that converts caller-selected Markdown excerpt content into formatted HTML when no authored plain-text description is available. Authored descriptions bypass Markdown rendering.

**Feed mode**:
The rendering mode that converts one post body into feed-appropriate HTML. It converts recognized embedded elements into useful static fallbacks rather than exposing authoring syntax, while warning that the feed representation may provide less functionality than the article; constructing and delivering the syndicated feed remains caller behavior.
_Avoid_: RSS preset
