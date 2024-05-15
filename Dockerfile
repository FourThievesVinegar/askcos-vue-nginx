# Stage 1: Get the Production version of Vue
FROM node:18-alpine as build

RUN apk add --no-cache git

# Set the working directory inside the container
WORKDIR /askcos_vue

# Copy package.json and package-lock.json (or yarn.lock) to the container
COPY ./askcos_vue/package*.json ./

# Install dependencies
RUN npm install

# Copy all the application files to the container
COPY ./askcos_vue ./

COPY .git/ ./.git/

# Build the production version of the application
RUN npm run build

# Stage 2: Serve the built application using Nginx
FROM nginx:1.25.5-alpine as prod-build

RUN rm -rf /usr/share/nginx/html/*

# COPY --from=build askcos_vue/nginx.conf /etc/nginx/nginx.conf
COPY --from=build askcos_vue/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]

