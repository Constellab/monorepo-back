# Build step
FROM node:22-alpine3.22 as builder
WORKDIR /app

# Copy package and package-lock.json file for modules installation
COPY /package.json /package-lock.json ./

# Run modules installation
RUN npm ci

# copy the rest of the app
COPY . .

RUN npm run hn-community-api:build

## Second Stage : Setup command to run your app using lightweight node image
FROM node:22-alpine3.22
WORKDIR /app

# Set UTC timezone for the docker
ENV TZ=UTC


COPY --from=builder /app/package.json /app/package-lock.json ./

# dependency are needed and there are not build in chunck
# ignore-scripts is needed to avoid running the postinstall script (like prepare husky)
RUN npm ci --only=production --ignore-scripts

# copy dist
COPY --from=builder /app/dist/apps/hn-community-api ./dist

CMD ["node", "dist/hn-main"]
