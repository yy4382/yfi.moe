# Repository Guidelines

## Project Structure & Module Organization

- Workspace uses `pnpm` + Turbo; install with `pnpm install` and run shared scripts from the repo root.
- `app/blog-astro/` contains the Astro UI with routes in `src/pages/` and shared pieces in `src/components/`.
- `app/backend/` hosts the Hono API with Drizzle schemas in `src/db/` and domain logic in `src/modules/`.
- Shared packages live in `lib/`: API contracts (`api`), markdown tooling (`markdown`), the React comment widget (`comment`), and utility helpers (`helpers`).
- `docker-compose.yaml` provisions Redis, an HTTP proxy, and MailHog for local integration testing.

## Build, Test, and Development Commands

- `pnpm dev` launches the main Turbo pipeline; limit scope with `pnpm --filter <pkg> dev`.
- `pnpm build:frontend` and `pnpm build:backend` produce deployable artifacts for the Astro site and API server.
- Run `pnpm --filter @repo/backend check-types` and `pnpm --filter lib/* build` to refresh package outputs; `pnpm --filter blog-astro astro preview` inspects release builds.
- Use `pnpm turbo run lint` (or package `lint` scripts) before committing cross-package changes.

## Coding Style & Naming Conventions

- Prettier (2-space indent, Tailwind plugin) with lint-staged enforces formatting; run `pnpm exec prettier --check .` if needed.
- Follow existing naming: `camelCase` for functions, `PascalCase` for React components, kebab-case for Astro template filenames.
- Respect configured TS path aliases (`@/`, `~/`) and resolve ESLint warnings before review.

## Testing Guidelines

- Vitest backs all suites. Run backend specs with `pnpm --filter @repo/backend vitest --run` (add `--coverage` for regressions) and markdown tests via `pnpm --filter @repo/markdown test`.
- The comment widget requires jsdom: `pnpm --filter @repo/comment vitest --run --environment jsdom`.
- Co-locate new specs alongside source files using the existing `*.test.ts` or `__test__` conventions.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, optional scopes) to match the history.
- Rebase before opening a PR, link related issues, and include screenshots or terminal logs for user-facing updates.
- Confirm impacted builds and test suites pass locally before requesting review.

## Environment & Tooling Notes

- Keep secrets listed in `turbo.json` (e.g., `ARTICLE_PAT`, `POSTHOG_KEY`) in local env files; never commit them.
- Ensure `docker-compose.yaml` ports are free before launching services, or override them in a local compose file.
- Target Node 20+ with `pnpm@10` to avoid lockfile drift and keep `vercel.json` font rewrites in mind when asset paths change.
