# Build step
FROM node:14-alpine as buildContainer

# Ebnvironement profile for the build 'dev', 'pre-prod' or 'prod'
ARG ENVIRONMENT_PROFILE=${ENVIRONMENT_PROFILE}
WORKDIR /app

# Copy package.json
COPY /package.json /package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the workspace and build the app
COPY / .

RUN npm run ha-hub:build-$ENVIRONMENT_PROFILE

# Run step
FROM nginx:alpine

WORKDIR /app


# Get build result
COPY --from=buildContainer /app/dist/apps/ha-hub /usr/share/nginx/html

# Copy the default nginx.conf
COPY /apps/ha-hub/nginx.conf /etc/nginx/conf.d/default.conf
