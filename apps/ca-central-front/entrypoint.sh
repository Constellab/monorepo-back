#!/bin/sh

# Entry point of the docker file
# Create the environment.json file from env variables
echo "{\"apiUrl\" : \"$API_URL\",  \"communityApiUrl\" : \"$COMMUNITY_API_URL\", \"communityFrontUrl\" : \"$COMMUNITY_FRONT_URL\", \"frontDomain\" : \"$FRONT_DOMAIN\"}" > /usr/share/nginx/html/assets/environment.json

# Execute the nginx docker entry point
. /docker-entrypoint.sh
