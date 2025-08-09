# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

Monorepo blog system with four main components:

1. **Blog Frontend** (`app/blog/`) - Next.js 15.4.1 with App Router, Drizzle ORM, custom comment system
2. **Backend API** (`app/backend/`) - Hono server with Better-auth, PostgreSQL via Drizzle ORM
3. **Shared API types** (`lib/api/`) - Shared TypeScript types and validation schemas
4. **Markdown Library** (`lib/markdown/`) - Unified.js-based markdown processing with custom plugins

## System Architecture

### Content Management

- **GitHub-based CMS**: Articles/pages stored in private GitHub repos
- **Runtime fetching**: Content fetched at build-time and runtime with Redis caching
- **Content structure**: YAML frontmatter + markdown body with tags, series, published status
- **Cache invalidation**: Webhook-based content refresh via `CONTENT_REFRESH_TOKEN`

### Backend Services

- **Authentication**: Better-auth with GitHub OAuth, magic links
- **Comments**: Full CRUD API with markdown support, email notifications, moderation
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Email**: Nodemailer with React Email templates for notifications
- **API**: RESTful endpoints under `/api/v1/*`

### Frontend Features

- **Next.js 15.4.1**: App Router, React 19, server components
- **Comments**: Custom system with real-time updates, markdown support
- **SEO**: OpenGraph images, RSS feeds, sitemap.xml
- **Performance**: Redis caching, bundle analyzer, PostHog analytics
- **Styling**: Tailwind CSS v4 with custom components

## Development Commands

### Root Commands

```bash
pnpm dev          # Start all services (Next.js + backend API)
pnpm build        # Build all packages with Turbo
pnpm check-types  # Type checking across monorepo
```

### Blog Frontend (`app/blog/`)

```bash
pnpm dev          # Next.js dev server (port 3000)
pnpm build        # Build + run migrations + static generation
pnpm start        # Production server
pnpm lint         # ESLint with Next.js rules
pnpm check-types  # TypeScript checking
```

### Backend API (`app/backend/`)

```bash
pnpm dev          # Hono server with hot reload (port 3001)
pnpm check-types  # TypeScript checking
pnpm lint         # ESLint
```

### Markdown Library (`lib/markdown/`)

```bash
pnpm test         # Vitest unit tests
pnpm check-types  # TypeScript checking
```

## Environment Setup

Copy `.env.example` and configure required variables:

### GitHub Content

- `ARTICLE_PAT` - GitHub PAT for private content repos
- `POST_GH_INFO` - Format: `owner__repo__ref__path` (e.g., `user__blog-posts__main__posts`)
- `PAGE_GH_INFO` - Same format for pages

### Database & Cache

- `DATABASE_URL` - PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` - Redis for caching
- `UPSTASH_REDIS_REST_TOKEN` - Redis auth token

### Authentication

- `BETTER_AUTH_SECRET` - Better-auth encryption key
- `GITHUB_CLIENT_ID` - GitHub OAuth app ID
- `GITHUB_CLIENT_SECRET` - GitHub OAuth secret

### Email & Notifications

- `EMAIL_NOTIFICATION_ENABLED` - Enable email notifications
- `EMAIL_FROM` - Sender email address
- `SMTP_*` - SMTP configuration

### Local Development

Use `docker-compose.yaml` for local services:

```bash
docker-compose up -d  # PostgreSQL, Redis, MailHog
```

Local service URLs:

- PostgreSQL: `postgres://postgres:postgres@localhost:5432/main`
- Redis: `http://localhost:8079` (via serverless-redis-http)
- MailHog: `http://localhost:8025` (email testing)

## Key Directories

### Blog Frontend (`app/blog/`)

- `src/app/` - App Router pages and API routes
- `src/lib/content-layer/` - GitHub content fetching and caching
- `src/components/elements/comment/` - Comment system UI
- `src/lib/auth/` - Better-auth integration
- `public/` - Static assets and OG images

### Backend API (`app/backend/`)

- `src/index.ts` - Hono server entry
- `src/modules/comments/` - Comments API with validation
- `src/auth/` - Better-auth configuration
- `src/notification/` - Email notification system
- `src/db/schema.ts` - Drizzle database schema

### Shared Libraries

- `lib/api/` - Shared TypeScript types and validation schemas
- `lib/markdown/` - Unified.js markdown processing pipeline
- `lib/helpers/` - Utility functions (gravatar, result types)

## Database Management

```bash
cd app/backend
pnpm drizzle-kit generate  # Generate migrations
pnpm drizzle-kit migrate   # Run migrations
```

## Testing

```bash
# Backend tests
cd app/backend && pnpm test

# Markdown library tests
cd lib/markdown && pnpm test

# Frontend tests
cd app/blog && pnpm test  # if available
```

## Deployment

- **Primary**: Vercel (configured via `vercel.json`)
- **Build**: Turbo monorepo with environment variable handling
- **Database**: Neon PostgreSQL with Drizzle migrations
