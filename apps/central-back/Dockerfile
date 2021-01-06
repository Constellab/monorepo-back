# docker file based on the following tutorial :
# https://blog.logrocket.com/containerized-development-nestjs-docker/

# Build step
FROM node:12-alpine as builder
WORKDIR /app

# Copy package and package-lock.json file for modules installation
COPY ./package.json ./package-lock.json ./

# Run modules installation
RUN npm ci

# copy the rest of the app
COPY . .
RUN npm run build

# Second Stage : Setup command to run your app using lightweight node image
FROM node:12-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./

RUN npm install --only=production


COPY --from=builder /app/dist ./dist

#COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/main"]
