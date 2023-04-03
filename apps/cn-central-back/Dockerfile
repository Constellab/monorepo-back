# docker file based on the following tutorial :
# https://blog.logrocket.com/containerized-development-nestjs-docker/

# Build step
FROM node:18-alpine3.17 as builder
WORKDIR /app

# Copy package and package-lock.json file for modules installation
COPY /package.json /package-lock.json ./

# Run modules installation
RUN npm ci

# copy the rest of the app
COPY . .

RUN npm run cn-central-back:build

## Second Stage : Setup command to run your app using lightweight node image
FROM node:18-alpine3.17
WORKDIR /app

# Set UTC timezone for the docker
ENV TZ=UTC

# Install ssh
RUN apk add openrc openssh

COPY --from=builder /app/package.json /app/package-lock.json ./

# dependency are needed and there are not build in chunck
RUN npm ci --only=production

# copy dist
COPY --from=builder /app/dist/apps/cn-central-back ./dist

# Retrieve the ssh key from the build arg and write it to the authorized_keys file
ARG SSH_PRIVATE_KEY
RUN mkdir /root/.ssh \
    && echo "${SSH_PRIVATE_KEY}" > /root/.ssh/id_rsa  \
    && chmod 600 /root/.ssh/id_rsa

EXPOSE 3001
CMD ["node", "dist/main"]
