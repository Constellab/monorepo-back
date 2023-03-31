# Build step
FROM node:18-alpine3.17 as buildContainer

WORKDIR /app

# Copy package.json
COPY /package.json /package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the workspace and build the app
COPY ./ .

RUN npm run ha-hub:build-prod

# Run step
FROM nginx:alpine

WORKDIR /app


# Get build result
COPY --from=buildContainer /app/dist/apps/ha-hub /usr/share/nginx/html

# Copy the default nginx.conf
COPY /apps/ha-hub/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entry point
COPY apps/ha-hub/entrypoint.sh /entrypoint.sh

RUN sed -i -e 's/\r$//' /entrypoint.sh && \
    sed -i -e 's/\r$//' /etc/nginx/conf.d/default.conf && \
    chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]


