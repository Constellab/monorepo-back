# Central Back

This is the application for the API of central in Nest.js


## Serve
To serve the api use the command in package.json ```central-back:serve```


## Build
To build the api use the command ```central-back:build```, then the command 
```central-back:serve-prod``` can be used to serve the prod built.

The commands ```central-back:caprover-deploy-preprod``` and ```central-back:caprover-deploy-prod```
are used to deploy the api in pre-prod or prod using caprover.

## Build dev docker image

To build the api in a local docker : 
 - build the docker image : ```central-back:build-image-dev``` 
 - to run the image use the central-back repository and run the command : ```docker-compose -f docker-compose-dev.yml up -d central-back```  (the maria db image must be running)
