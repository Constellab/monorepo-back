#!/bin/sh

# Entry point of the docker file
# Create the environment.json file from env variables
echo "{\"apiBaseUrl\" : \"$API_URL\",  \"devApiBaseUrl\" : \"$LAB_DEV_API_URL\", \"codelabUrl\" : \"$CODELAB_URL\", \"virtualHost\" : \"$VIRTUAL_HOST\",  \"spaceFrontUrl\" : \"$CENTRAL_FRONT_URL\", \"spaceApiUrl\" : \"$CENTRAL_API_URL\",  \"communityFrontUrl\" : \"$COMMUNITY_FRONT_URL\",  \"communityApiUrl\" : \"$COMMUNITY_API_URL\"}" > /usr/share/nginx/html/assets/environment.json

# Execute the nginx docker entry point
. /docker-entrypoint.sh
