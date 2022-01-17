# Build step
FROM node:12-alpine as builder
WORKDIR /app

# Copy package and package-lock.json file for modules installation
COPY /package.json /package-lock.json ./

# Run modules installation
RUN npm i

# copy the rest of the app
COPY / .

RUN npm run hn-hub:build

## Second Stage : Setup command to run your app using lightweight node image
FROM node:12-alpine
WORKDIR /app

# Set UTC timezone for the docker
ENV TZ=UTC


COPY --from=builder /app/package.json /app/package-lock.json ./

# dependency are needed and there are not build in chunck
RUN npm install --only=production

# copy dist
COPY --from=builder /app/dist/apps/hn-hub ./dist

EXPOSE 3001
CMD ["node", "dist/main"]
