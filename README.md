# Monorepo back

This project contains all the gencovery code for Nest back app.

All the app and libraries hava a prefix to simplify search

## Apps

### Central back : Cn
The nest app for the central (constellab). 

Prefix: Cn

To build the app, push a tag with the version number and the prefix 'cn_'.
For example, to build the version 1.0.0, push the tag `cn_1.0.0`.

Then execute the npm script ```cn-central-back:caprover-deploy-preprod``` or ```cn-central-back:caprover-deploy-prod```
to deploy the app to caprover. Be careful of the image tag.

To build the image locally : ```docker build -t cn-central-back-test -f apps/cn-central-back/Dockerfile .```

### Hub back (hn-hub) : Hn
The hub nest app containing the documentation.

Prefix : Hn

## Libraries

### core-lib : Cl
Typescript library for font and back for services, helpers, classes

Prefix : Cl

### common-model : Cm
Typescript library for font and back to share models (interfaces, classes)

Prefix : Cm

### back-core-lib : Bl
Library for nest apps that contain generic back classes
