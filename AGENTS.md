# Repository Guidelines

## Project Structure & Module Organization

- Workspace uses `pnpm` workspace + Turborepo; install with `pnpm install` and run shared scripts from the repo root.
- `app/blog-astro/` contains the Astro UI with routes in `src/pages/` and shared pieces in `src/components/`.
- `app/backend/` hosts the Hono API with Drizzle schemas in `src/db/` and domain logic in `src/modules/`.
- Shared packages live in `lib/`: API contracts (`api`), markdown tooling (`markdown`), the React comment widget (`comment`), and utility helpers (`helpers`).

## Build, Test, and Development Commands

- `pnpm dev` in the root directory launches the main Turbo pipeline, running both frontend and backend; limit scope with `pnpm --filter <pkg> dev`.
- `pnpm build:frontend` and `pnpm build:backend` produce deployable artifacts for the Astro site and API server.
- Use `pnpm turbo run lint check-types test` (or use turborepo `--filter=<pkg> task` to run specific tasks) to validate code quality and run tests.

## Coding Style & Naming Conventions

- Prettier (2-space indent, Tailwind plugin) with lint-staged enforces formatting; run `pnpm exec prettier --check .` if needed.
- Follow existing naming: `camelCase` for functions, `PascalCase` for React components, kebab-case for all filenames.
- Respect configured TS path aliases (`@/`, `~/`) and resolve ESLint warnings before review.

## Testing Guidelines

- Vitest backs all suites. Use turborepo to run tests.
- Co-locate new specs alongside source files using the existing `*.test.ts` or `__test__` conventions.

## Commit & Pull Request Guidelines

- Use Conventional Commits (`feat:`, `fix:`, optional scopes) to match the history.
- Rebase before opening a PR, link related issues, and include screenshots or terminal logs for user-facing updates.
- Confirm impacted builds and test suites pass locally before requesting review.
