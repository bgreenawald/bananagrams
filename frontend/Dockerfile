FROM node:14-slim as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm install && npm install -g @angular/cli

COPY ./ /app/

RUN ng build --prod

# Stage 1, based on Nginx, to have only the compiled app, ready for production with Nginx
FROM nginx:1.15
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html

EXPOSE 80

COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
