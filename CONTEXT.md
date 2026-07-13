# Blog Content

The language for source material transformed into content used by the blog.

## Language

### Content collection

**Content collection**:
An independently ingested set of related blog data persisted by Astro. Each collection reconciles independently according to its source shape.
_Avoid_: Content type, loader store

### File-set collection

**File-set collection**:
A content collection in which each selected raw file represents one independently reconcilable entry.
_Avoid_: Directory loader, glob collection

### Structured-file collection

**Structured-file collection**:
A content collection encoded by one raw file and reconciled as a whole.
_Avoid_: Single-file loader, file collection

### Image metadata entry

**Image metadata entry**:
The dimensions and presentation metadata for one image. Its image URL is its identity within the image-metadata collection.
_Avoid_: Image metadata wrapper, metadata array

### Content ingestion

**Content ingestion**:
The lifecycle by which source material becomes the blog's current collection data using Astro-native reconciliation semantics.
_Avoid_: Content loading, fetching

### Raw content acquisition

**Raw content acquisition**:
Retrieving and selecting source material before its meaning or presentation is interpreted. Acquisition may be local or remote and may apply source-specific selection and normalization.
_Avoid_: Content parsing, content ingestion

### Entry metadata extraction

**Entry metadata extraction**:
Deriving the identity and collection data needed to validate an entry while preserving its raw Markdown body.
_Avoid_: Markdown rendering, raw content acquisition

### Markdown processing

**Markdown processing**:
Turning stored raw Markdown into consumer-specific derived output such as article HTML, feed HTML, summaries, or a table of contents. This occurs after content ingestion and is independent of acquisition source.
_Avoid_: Entry metadata extraction, raw content acquisition

### Source revision

**Source revision**:
A source's identity for a particular version of its material, used to avoid reacquiring unchanged remote content.
_Avoid_: Last SHA, freshness marker

### Markdown rendering

**Markdown rendering**:
The transformation of Markdown source into a destination-appropriate representation.
_Avoid_: Markdown utility, Markdown publishing

### Rendering mode

**Rendering mode**:
A named, complete set of rendering rules selected according to where the result will appear. A new mode represents a new rendering intent; callers cannot override its rules, and each mode defines an output tailored to its callers' needs.
_Avoid_: Preset, renderer options

### Mode option

**Mode option**:
A semantic variation within one rendering mode that exists only when required by the blog's behavior. Its name describes a difference in rendering intent or content, never a Markdown-processing mechanism.
_Avoid_: Plugin option, renderer flag, preset override

### Embedded element

**Embedded element**:
A named semantic element, with agreed properties, that Markdown rendering asks a destination to realize. Its presentation and interactivity belong to the destination, which must support every embedded element its selected mode can produce; a malformed recognized element fails rendering.
_Avoid_: React component, placeholder tag

### Article mode

**Article mode**:
The rendering mode for a full post presented on the blog. It produces an article outline whose references match the rendered headings.

### Article outline

**Article outline**:
The ordered heading references of a rendered article, including each heading's text, depth, and anchor.
_Avoid_: TOC data, separately parsed headings

### Image metadata

**Image metadata**:
Intrinsic dimensions and placeholder information associated with an image source. Article rendering may receive this data from its destination, while retaining ownership of how it enriches the rendered image.
_Avoid_: File data, image plugin options

### Comment mode

**Comment mode**:
The rendering mode that converts reader-authored discussion into sanitized HTML. External links are treated as user-generated content and isolated from the blog's trust and navigation context.

### Excerpt mode

**Excerpt mode**:
The rendering mode that converts caller-selected Markdown excerpt content into formatted HTML when no authored plain-text description is available. Authored descriptions bypass Markdown rendering.

### Feed mode

**Feed mode**:
The rendering mode that converts one post body into feed-appropriate HTML. It converts recognized embedded elements into useful static fallbacks rather than exposing authoring syntax, while warning that the feed representation may provide less functionality than the article; constructing and delivering the syndicated feed remains caller behavior.
_Avoid_: RSS preset
