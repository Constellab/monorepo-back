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
- to run the image use the cn-space-api repository and run the command : `docker compose -f docker-compose-dev.yml up -d cn-space-api` (the maria db image must be running)

## Authorization Server configuration

This application is the single OAuth Authorization Server for machine clients
([ADR-0001](../../docs/adr/0001-space-api-is-the-single-authorization-server.md)): it mounts
`BlOAuthServerModule`, publishes its discovery document at
`/.well-known/oauth-authorization-server` and its signing keys at `/.well-known/jwks.json`.

Its configuration is read while Nest builds the injector, so **a missing required value
stops the process at startup** rather than turning into registrations or authorization
requests being refused later for no visible reason. The full commentary for each value is in
[`src/environments/cn-dev.env`](src/environments/cn-dev.env).

| Variable                              | Required | Purpose                                                                                                                        |
| ------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `MCP_JWT_PRIVATE_KEY_BASE64`          | yes      | Base64 PEM RSA key signing MCP access tokens. Its public half is published; not `JWT_SECRET`.                                  |
| `OAUTH_ALLOWED_REDIRECT_URIS`         | yes      | Comma-separated non-loopback redirect URIs a client may register. Loopback is always allowed.                                  |
| `API_URL`                             | yes      | The issuer, and the base of every advertised endpoint. Clients record it at registration.                                      |
| `FRONT_DOMAIN`                        | yes      | Where the browser is sent: `<front>/login?returnUrl=…` with no session, `<front>/oauth/consent?consent_id=…` for the approval. |
| `QUEUE_SERVICE_{HOST,PORT,PASSWORD}`  | yes      | Redis, which backs the client, authorization-code and pending-consent stores.                                                  |
| `MCP_ACCESS_TOKEN_DURATION_SECONDS`   | no       | Access token lifetime; defaults to the value in `cn-jwt.config.ts` (1 h).                                                      |
| `MCP_JWT_PREVIOUS_PRIVATE_KEY_BASE64` | no       | During a key rotation only: the retired key, still published and accepted, never signing.                                      |

Nothing is granted to a machine client without the user approving it: `/authorize` parks the
request and sends the browser to the consent page, which describes it through
`/oauth/authorize/consent/details` and posts the answer back. Approving records one **Grant**
per Resource in the `oauth_grant` table — see the migration file, which must run before the
application starts. A client that already holds a Grant for everything it is asking for is
sent straight back with a code, so a user is asked once per client and Resource, not once per
connection.

## Initialize the database

- Open the `cn-app.module.ts` file and set `synchronize: true` in the TypeOrmModule configuration (only for dev environment)
- Serve the application using `cn-space-api:serve` command, the database will be automatically created and initialized with the default data.
- After the database is initialized, set back `synchronize: false` to avoid accidental database schema changes in the future.
- Then in db, call the script `db-init.sql` to initialize the database with the default data.
