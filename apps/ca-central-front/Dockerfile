# Build step
FROM node:18-alpine3.17 as buildContainer

# Environment profile for the build 'dev', 'pre-prod' or 'prod'
ARG ENVIRONMENT_PROFILE=${ENVIRONMENT_PROFILE}

WORKDIR /app

# Copy package.json
COPY /package.json /package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the workspace and build the app
COPY / .

RUN npm run ca-central-front:build-$ENVIRONMENT_PROFILE

# Run step
FROM nginx:alpine

# Get build result
COPY --from=buildContainer /app/dist/apps/ca-central-front /usr/share/nginx/html

# Copy the default nginx.conf
COPY /apps/ca-central-front/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entry point
COPY apps/lab-front/entrypoint.sh /entrypoint.sh

RUN sed -i -e 's/\r$//' /entrypoint.sh && \
    sed -i -e 's/\r$//' /etc/nginx/conf.d/default.conf && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]

