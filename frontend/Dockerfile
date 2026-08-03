FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines env vars at build time (not runtime), so the API URL the
# browser will call must be baked in here. Override with
# `--build-arg VITE_API_URL=https://api.example.com/api/v1` for a non-local
# deployment; the default matches the docker-compose backend's published port.
ARG VITE_API_URL=http://localhost:5000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginxinc/nginx-unprivileged:1.27-alpine AS production
COPY --from=build /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# nginx-unprivileged already runs as a non-root user and drops the need for
# root to bind a privileged port — matches the backend's `USER node`.
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
