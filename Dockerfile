# The Dockerfile builds the backend (app/backend) of the app.

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build --filter=@repo/backend
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm deploy --filter=@repo/backend --prod /prod/backend

FROM base AS backend
COPY --from=build /prod/backend /prod/backend
WORKDIR /prod/backend
EXPOSE 3001
CMD [ "pnpm", "start" ]
