#!/bin/sh

# Add the ssh private key to the container
mkdir /root/.ssh
echo "$SSH_PRIVATE_KEY" > /root/.ssh/id_rsa
chmod 600 /root/.ssh/id_rsa

echo "$OUTSCALE_ACCESS_KEY_ID" > /root/.ssh/outscale_rsa
chmod 600 /root/.ssh/outscale_rsa

# start node
node dist/main
