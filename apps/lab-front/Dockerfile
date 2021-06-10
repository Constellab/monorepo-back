
# Dockerfile used by the gitlab ci
FROM nginx:alpine
# Copy the dist front-pegase-manager
COPY dist/apps/lab-front /usr/share/nginx/html

# Copy the default nginx.conf
COPY apps/lab-front/nginx.conf /etc/nginx/conf.d/default.conf

# Copy the entry point
COPY apps/lab-front/entrypoint.sh /entrypoint.sh

# Expose the 81 port, use expose because in prod we use a specific nginx server that
# does not work with port but expose
EXPOSE 81

RUN sed -i -e 's/\r$//' /entrypoint.sh
RUN sed -i -e 's/\r$//' /etc/nginx/conf.d/default.conf
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]

