# Space Back

This is the application for the API of space in Nest.js

## Serve

To serve the api use the command in package.json `cn-space-api:serve`

## Build

To build the api use the command `cn-space-api:build`, then the command
`cn-space-api:serve-prod` can be used to serve the prod built.

The commands `cn-space-api:caprover-deploy-preprod` and `cn-space-api:caprover-deploy-prod`
are used to deploy the api in pre-prod or prod using caprover.

## Build dev docker image

To build the api in a local docker :

- build the docker image : `cn-space-api:build-image-dev`
- to run the image use the cn-space-api repository and run the command : `docker-compose -f docker-compose-dev.yml up -d cn-space-api` (the maria db image must be running)
