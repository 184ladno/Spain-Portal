# Use the lightweight nginx image to serve a static site
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy site files into nginx's web root
COPY . /usr/share/nginx/html

# Expose port 80 for HTTP
EXPOSE 80

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]