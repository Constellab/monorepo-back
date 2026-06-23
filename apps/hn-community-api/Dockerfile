# Build step
FROM oven/bun:1.3.14-alpine AS builder
WORKDIR /app

# Copy package and lockfile for modules installation
COPY /package.json /bun.lock ./

# Run modules installation
RUN bun install --frozen-lockfile

# copy the rest of the app
COPY . .

RUN bun run hn-community-api:build

## Second Stage : Setup command to run your app using lightweight image
FROM oven/bun:1.3.14-alpine
WORKDIR /app

# Set UTC timezone for the docker
ENV TZ=UTC


COPY --from=builder /app/package.json /app/bun.lock ./

# dependency are needed and there are not build in chunck
# ignore-scripts is needed to avoid running the postinstall script (like prepare husky)
RUN bun install --frozen-lockfile --production --ignore-scripts

# copy dist
COPY --from=builder /app/dist/apps/hn-community-api ./dist

# Health check used by Docker / CapRover to route traffic only when the app is ready.
# start-period gives NestJS time to boot without counting early failures.
HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3333/health || exit 1

CMD ["node", "dist/hn-main"]
