# Monorepo back

This project contains all the gencovery code for Nest back app.

All the app and libraries hava a prefix to simplify search

## Package manager

This repository uses [Bun](https://bun.sh) **exclusively** (lockfile: `bun.lock`).
Do not use `npm`, `yarn`, `pnpm` or `npx`.

```bash
bun install          # install dependencies
bun add <pkg>        # add a dependency
bun run <script>     # run a package.json script
bunx <bin>           # run a local binary (nest, jest, ...)
```

## Apps

### Space back : Cn

The nest app for the space (constellab).

Prefix: Cn

To build the app, push a tag with the version number and the prefix 'cn\_'.
For example, to build the version 1.0.0, push the tag `cn_1.0.0`.

Then execute the Bun script `bun run cn-space-api:caprover-deploy-preprod` or `bun run cn-space-api:caprover-deploy-prod`
to deploy the app to caprover. Be careful of the image tag.

To build the image locally : `docker build -t cn-space-api-test -f apps/cn-space-api/Dockerfile .`

### Community back (hn-community-api) : Hn

The community nest app containing the documentation.

Prefix : Hn

## Libraries

### core-lib : Cl

Typescript library for font and back for services, helpers, classes

Prefix : Cl

### back-core-lib : Bl

Library for nest apps that contain generic back classes
