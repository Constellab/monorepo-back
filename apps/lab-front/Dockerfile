
# Dockerfile used by the gitlab ci
FROM nginx:alpine
# Copy the dist front-pegase-manager
COPY dist/apps/lab-front /usr/share/nginx/html

# Copy the default nginx.conf
COPY apps/lab-front/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entry point
COPY apps/lab-front/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]

