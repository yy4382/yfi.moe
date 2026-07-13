# Co-locate StyleX in Astro components

Astro components define their StyleX styles in their own `.astro` files and apply them with `stylex.attrs()` instead of moving styles into companion modules or converting static components to React. The application may own a thin, replaceable Astro integration when maintained community tooling cannot compile current StyleX across Astro, framework components, and internal workspace sources; preserving local style reasoning is worth this narrowly tested build-tool seam.
