# Repository Guidelines

## Design Guidelines

You tend to converge toward generic, "on distribution" outputs. In frontend design, this creates what users call the "AI slop" aesthetic. Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes. Draw from IDE themes and cultural aesthetics for inspiration.

Motion: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions.

Backgrounds: Create atmosphere and depth rather than defaulting to solid colors. Layer CSS gradients, use geometric patterns, or add contextual effects that match the overall aesthetic.

Avoid generic AI-generated aesthetics:

- Overused font families (Inter, Roboto, Arial, system fonts)
- Clichéd color schemes (particularly purple gradients on white backgrounds)
- Predictable layouts and component patterns
- Cookie-cutter design that lacks context-specific character

Interpret creatively and make unexpected choices that feel genuinely designed for the context. Vary between light and dark themes, different fonts, different aesthetics. You still tend to converge on common choices (Space Grotesk, for example) across generations. Avoid this: it is critical that you think outside the box!

## Development Information

### Project Structure & Module Organization

- Workspace uses `pnpm` workspace + Turborepo; install with `pnpm install` and run shared scripts from the repo root.
- `app/blog-astro/` contains the Astro UI with routes in `src/pages/` and shared pieces in `src/components/`.
- `app/backend/` hosts the Hono API with Drizzle schemas in `src/db/` and domain logic in `src/modules/`.
- Shared packages live in `lib/`: API contracts (`api`), markdown tooling (`markdown`), the React comment widget (`comment`), and utility helpers (`helpers`).

### Build, Test, and Development Commands

- `pnpm dev` in the root directory launches the main Turbo pipeline, running both frontend and backend; limit scope with `pnpm --filter <pkg> dev`.
- `pnpm build:frontend` and `pnpm build:backend` produce deployable artifacts for the Astro site and API server.
- Validating mechanisms includes `check-types`, `lint`, `test`.
  - For most cases, you should use `pnpm turbo run <task> --filter=<pkg>` to run the task for the specific package.
  - For the "last and final" check, you can use `pnpm turbo run  check-types lint test` to run the tasks for all packages.
  - For the "blog-astro" package, it doesn't have a `check-types` task, use `pnpm --filter blog-astro exec astro check` to validate the types.

### Coding Style & Naming Conventions

- Prettier (2-space indent, Tailwind plugin) with lint-staged enforces formatting; run `pnpm exec prettier --check .` if needed.
- Follow existing naming: `camelCase` for functions, `PascalCase` for React components, kebab-case for all filenames.
- Respect configured TS path aliases (`@/`, `~/`) and resolve ESLint warnings before review.

### Testing Guidelines

- Vitest backs all suites. Use turborepo to run tests.
- Co-locate new specs alongside source files using the existing `*.test.ts` or `__test__` conventions.

### Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, optional scopes) to match the history.
- Rebase before opening a PR, link related issues, and include screenshots or terminal logs for user-facing updates.
- Confirm impacted builds and test suites pass locally before requesting review.
