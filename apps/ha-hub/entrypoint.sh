#!/bin/sh

# Entry point of the docker file
# Create the environment.json file from env variables
echo "{\"apiUrl\" : \"$API_URL\",  \"constellabApiUrl\" : \"$CONSTELLAB_API_URL\", \"constellabFrontUrl\" : \"$CONSTELLAB_FRONT_URL\", \"communityFrontUrl\" : \"$COMMUNITY_FRONT_URL\"}" > /usr/share/nginx/html/assets/environment.json

# Execute the nginx docker entry point
. /docker-entrypoint.sh
