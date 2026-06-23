# docker file based on the following tutorial :
# https://blog.logrocket.com/containerized-development-nestjs-docker/

# Build step
FROM oven/bun:1-alpine AS builder
WORKDIR /app

# Copy package and lockfile for modules installation
COPY /package.json /bun.lock ./

# Run modules installation
RUN bun install --frozen-lockfile

# copy the rest of the app
COPY . .

RUN bun run cn-space-api:build

## Second Stage : Setup command to run your app using lightweight image
FROM oven/bun:1-alpine
WORKDIR /app

# Set UTC timezone for the docker
ENV TZ=UTC

# Install ssh
RUN apk add openrc openssh

COPY --from=builder /app/package.json /app/bun.lock ./

# dependency are needed and there are not build in chunck
# ignore-scripts is needed to avoid running the postinstall script (like prepare husky)
RUN bun install --frozen-lockfile --production --ignore-scripts

# copy dist
COPY --from=builder /app/dist/apps/cn-space-api ./dist

# Health check used by Docker / CapRover to route traffic only when the app is ready.
# start-period gives NestJS time to boot without counting early failures.
HEALTHCHECK --interval=10s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/cn-main"]
