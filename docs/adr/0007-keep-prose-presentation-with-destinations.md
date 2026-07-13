# Keep prose presentation with destinations

`@repo/markdown` owns semantic rendering but no UI stylesheet. `blog-astro` owns article prose presentation and `@repo/comment` owns comment prose presentation, both consuming shared semantic design tokens while remaining free to choose different density and interaction rules; the existing `@repo/markdown/style` export is retired during the StyleX migration.
