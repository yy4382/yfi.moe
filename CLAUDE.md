# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for a personal blog site (yfi.moe) built with modern web technologies. The repository contains three main applications and two shared libraries.

## Monorepo Structure

- **/app/blog**: Main blog site built with Astro, React, and Tailwind CSS
- **/app/api**: Backend API built with Hono.js and Drizzle ORM
- **/app/admin**: Admin dashboard built with React, TanStack Router, and Vite
- **/lib/markdown**: Shared markdown processing utilities
- **/lib/api-datatypes**: Shared TypeScript schemas and types for API communication

## Development Commands

### Root Commands (from repository root)
```bash
# Development
pnpm dev          # Start all services in development mode
pnpm build        # Build all packages
pnpm check-types  # Type check all packages

# Build for production
pnpm build:vercel # Build with Vercel configuration (includes git submodules)
```

### Individual Package Commands

#### Blog (`/app/blog`)
```bash
pnpm dev          # Start Astro dev server (port 4321)
pnpm build        # Build static site
pnpm preview      # Preview built site
pnpm check-types  # Type checking with Astro
```

#### API (`/app/api`)
```bash
pnpm dev          # Start API server with hot reload (port 3000)
pnpm build        # Build for production
pnpm start        # Start production server
```

#### Admin (`/app/admin`)
```bash
pnpm dev          # Start Vite dev server (port 4320)
pnpm build        # Build for production
pnpm serve        # Preview built admin
pnpm test         # Run tests with Vitest
```

### Testing
```bash
# Run tests for specific packages
pnpm --filter admin test        # Admin tests
pnpm --filter api test          # API tests (when available)
```

## Architecture Details

### Blog (`/app/blog`)
- **Framework**: Astro with React integration
- **Styling**: Tailwind CSS v4 with custom color system
- **Content**: Articles stored in separate git submodule (`blog-posts`)
- **Features**: Static site generation, RSS feeds, sitemap, comment system
- **Icons**: Astro-icon for Astro components, unplugin-icons for React
- **Animation**: Framer Motion (imported as `motion/react`)

### API (`/app/api`)
- **Framework**: Hono.js on Node.js
- **Database**: SQLite with libsql client
- **ORM**: Drizzle ORM with migrations
- **Auth**: Better-auth for user management
- **Schema**: Shared types in `/lib/api-datatypes`
- **Tables**: Users, sessions, accounts, verification, comments

### Admin (`/app/admin`)
- **Framework**: React with TypeScript
- **Routing**: TanStack Router (file-based routing)
- **State**: TanStack Query for server state
- **Styling**: Tailwind CSS v4 with custom components
- **Build**: Vite with React plugin

### Shared Libraries
- **markdown**: Unified-based markdown processing with remark/rehype plugins
- **api-datatypes**: Zod schemas for API validation, shared between frontend and backend

## Environment Variables

Key environment variables used across the project:
- `ARTICLE_PAT`: GitHub token for accessing private article repo
- `POST_GH_INFO`: GitHub info for post metadata
- `PAGE_GH_INFO`: GitHub info for page metadata
- `LOCAL_PREVIEW`: Boolean for local development preview
- `VERCEL_ENV`: Vercel environment (production/preview/development)

## Development Setup

1. Install dependencies: `pnpm install`
2. Initialize git submodules: `git submodule init && git submodule update`
3. Start development: `pnpm dev`
4. Access services:
   - Blog: http://localhost:4321
   - API: http://localhost:3000
   - Admin: http://localhost:4320

## Deployment

The site is configured for Vercel deployment. The `build:vercel` script handles submodule initialization and builds all packages for production deployment.