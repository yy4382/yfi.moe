# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a monorepo blog system with three main components:

1. **Blog Frontend** (`app/blog/`) - Next.js 15.4.1 blog with content from GitHub
2. **Backend API** (`app/backend/`) - Hono/Elysia API server with Drizzle ORM
3. **Markdown Library** (`lib/markdown/`) - Shared markdown processing utilities

## Key Architecture Details

### Content Management

- **GitHub-based content**: Articles and pages stored in separate private GitHub repos
- **ContentLayer pattern**: Uses `GithubCollection` class for fetching content from GitHub via PAT
- **Content structure**: Posts have metadata (title, description, tags, series, published status) + markdown body
- **File-based CMS**: Markdown files in GitHub repos with YAML frontmatter

### Backend Services

- **Comments system**: RESTful API for comments with CRUD operations, user auth, and moderation
- **Authentication**: Better-auth integration for user management
- **Database**: Drizzle ORM with LibSQL (SQLite-compatible)
- **API routes**: RESTful endpoints under `/api/v1/comments/*`

### Frontend Features

- **Next.js App Router**: Server components and static generation
- **Content fetching**: Runtime GitHub content fetching with caching
- **Comments integration**: Custom comment system replacing Waline
- **RSS feeds**: Automatic RSS generation
- **SEO optimized**: OpenGraph images, sitemap, metadata

## Development Commands

### Root Level (Monorepo)

```bash
pnpm dev          # Start all services in dev mode
pnpm build        # Build all packages
pnpm check-types  # Type checking across all packages
```

### Individual Services

#### Blog Frontend (`cd app/blog`)

```bash
pnpm dev          # Next.js dev server (port 3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # ESLint check
```

#### Backend API (`cd app/backend`)

```bash
pnpm dev          # Start API server with hot reload (port 3001)
pnpm build        # Build for production
pnpm tsc --noEmit # Type checking
```

#### Markdown Library (`cd lib/markdown`)

```bash
pnpm test         # Run Vitest tests
pnpm check-types  # TypeScript checking
```

## Environment Setup

Required environment variables:

- `ARTICLE_PAT` - GitHub personal access token for content repos
- `POST_GH_INFO` - Format: `owner__repo__ref__path` for posts
- `PAGE_GH_INFO` - Format: `owner__repo__ref__path` for pages
- `NEXT_PUBLIC_WALINE_URL` - Comment system URL (deprecated, moving to custom backend)

## Key Files & Directories

### Content Sources

- `app/blog/src/lib/content-layer/collections.ts` - Content fetching logic
- `app/blog/src/lib/content-layer/github-loader.ts` - GitHub API integration

### Backend

- `app/backend/src/index.ts` - Main server entry
- `app/backend/src/modules/comments/` - Comments API implementation
- `app/backend/src/db/schema.ts` - Database schema definitions

### Frontend

- `app/blog/src/app/` - Next.js app router pages
- `app/blog/src/components/elements/comment/` - Comment system UI
- `app/blog/src/lib/content-layer/` - Content management

### Shared Libraries

- `lib/markdown/src/` - Markdown processing utilities
- `@repo/backend` - Shared backend client
- `@repo/markdown` - Shared markdown processing

## Testing

Backend tests use Vitest:

```bash
cd app/backend
pnpm test
```

Markdown library tests:

```bash
cd lib/markdown
pnpm test
```

## Database Management

Backend uses Drizzle ORM:

```bash
cd app/backend
pnpm drizzle-kit generate  # Generate migrations
pnpm drizzle-kit migrate   # Run migrations
```

## Deployment

- **Vercel**: Primary deployment target with `vercel.json`
- **Turbo**: Monorepo build system with environment variable handling
