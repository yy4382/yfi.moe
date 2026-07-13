# Use package-owned vanilla CSS icons

Icons use the existing `i-lucide-*` and `i-mingcute-*` class contract backed by finite vanilla CSS mask rules rather than imported icon components or a Tailwind plugin. Each package owns and transitively imports uncompiled source CSS for only the glyphs it renders, the application performs final bundling and emission, and StyleX remains responsible for icon size, color, spacing, and interaction styling.
