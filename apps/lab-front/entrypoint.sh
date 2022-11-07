#!/bin/sh

# Entry point of the docker file
# Create the environment.json file from env variables
echo "{\"apiBaseUrl\" : \"$API_URL\",  \"devApiBaseUrl\" : \"$DEV_API_URL\", \"codeServerUrl\" : \"$CODE_SERVER_URL\", \"virtualHost\" : \"$VIRTUAL_HOST\",  \"centralFrontUrl\" : \"$CENTRAL_FRONT_URL\", \"centralApiUrl\" : \"$CENTRAL_API_URL\",  \"hubFrontUrl\" : \"$HUB_FRONT_URL\"}" > /usr/share/nginx/html/assets/environment.json

# Execute the nginx docker entry point
. /docker-entrypoint.sh
