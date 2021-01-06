# Build step
FROM node:12-alpine as buildContainer

# Ebnvironement profile for the build 'dev', 'pre-prod' or 'prod'
ARG ENVIRONMENT_PROFILE=${ENVIRONMENT_PROFILE}
WORKDIR /app

# Copy package.json
COPY ./package.json ./package-lock.json /app/

# Install dependencies
RUN npm ci

# Copy code and build the app
COPY . /app

RUN npm run build-$ENVIRONMENT_PROFILE

# Run step
FROM nginx:alpine

WORKDIR /app

#COPY --from=buildContainer /app/package.json /app

# Get build result
COPY --from=buildContainer /app/dist/central-front /usr/share/nginx/html

# Copy the default nginx.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
