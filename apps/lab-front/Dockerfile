# Build step
FROM node:12-alpine as buildContainer

# Ebnvironement profile for the build 'dev', 'pre-prod' or 'prod'
ARG ENVIRONMENT_PROFILE=${ENVIRONMENT_PROFILE}
WORKDIR /app

# Copy package.json
COPY /package.json /package-lock.json ./

#COPY ./nginx.conf /app/

# Install dependencies
RUN npm ci

# Copy the workspace and build the app
COPY / .

RUN npm run lab-front:build-$ENVIRONMENT_PROFILE

# Run step
FROM nginx:alpine

WORKDIR /app


# Get build result
COPY --from=buildContainer /app/dist/apps/lab-front /usr/share/nginx/html

# Copy the default nginx.conf
COPY /apps/lab-front/nginx.conf /etc/nginx/conf.d/default.conf
