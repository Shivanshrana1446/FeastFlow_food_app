FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

FROM base AS dependencies
RUN npm ci --omit=dev

FROM base AS build
COPY . .

FROM node:20-alpine AS production
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=dependencies /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app ./
RUN mkdir -p logs
EXPOSE 5000
USER node
CMD ["node", "src/server.js"]
