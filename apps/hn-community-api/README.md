# Community Back

This is the application for the API of community in Nest.js

## Serve

To serve the api use the command in package.json `hn-community-api:serve`

## Build

To build the api use the command `hn-community-api:build`, then the command
`hn-community-api:serve-prod` can be used to serve the prod built.

The commands `hn-community-api:caprover-deploy-preprod` and `hn-community-api:caprover-deploy-prod`
are used to deploy the api in pre-prod or prod using caprover.

## Build dev docker image

To build the api in a local docker :

- build the docker image : `hn-community-api:build-image-dev`
- to run the image use the hn-community-api repository and run the command : `docker compose -f docker-compose-dev.yml up -d hn-community-api` (the maria db image must be running)

## Initialize the database

- Open the `hn-app.module.ts` file and set `synchronize: true` in the TypeOrmModule configuration (only for dev environment)
- Serve the application using `hn-community-api:serve` command, the database will be automatically created and initialized with the default data.
- After the database is initialized, set back `synchronize: false` to avoid accidental database schema changes in the future.
- Then in db, call the script `db-init.sql` to initialize the database with the default data.
