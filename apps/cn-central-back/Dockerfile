# docker file based on the following tutorial :
# https://blog.logrocket.com/containerized-development-nestjs-docker/

# Build step
FROM node:14-alpine as builder
WORKDIR /app

# Copy package and package-lock.json file for modules installation
COPY /package.json /package-lock.json ./

# Run modules installation
RUN npm ci

# copy the rest of the app
COPY / .

RUN npm run cn-central-back:build

## Second Stage : Setup command to run your app using lightweight node image
FROM node:14-alpine
WORKDIR /app

# Set UTC timezone for the docker
ENV TZ=UTC


COPY --from=builder /app/package.json /app/package-lock.json ./

# dependency are needed and there are not build in chunck
RUN npm ci --only=production

# copy dist
COPY --from=builder /app/dist/apps/cn-central-back ./dist

EXPOSE 3001
CMD ["node", "dist/main"]
