# Build step
FROM node:12-alpine as buildContainer

# Ebnvironement profile for the build 'dev', 'pre-prod' or 'prod'
ARG ENVIRONMENT_PROFILE=${ENVIRONMENT_PROFILE}
WORKDIR /app

# Copy package.json
COPY /package.json /package-lock.json ./

#COPY ./nginx.conf /app/

# Install dependencies
RUN npm i

# Copy the workspace and build the app
COPY / .

RUN npm run ca-central-front:build-$ENVIRONMENT_PROFILE

# Run step
FROM nginx:alpine

WORKDIR /app


# Get build result
COPY --from=buildContainer /app/dist/apps/ca-central-front /usr/share/nginx/html

# Copy the default nginx.conf
COPY /apps/ca-central-front/nginx.conf /etc/nginx/conf.d/default.conf
