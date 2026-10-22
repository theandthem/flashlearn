# syntax=docker/dockerfile:1

# --- Build stage: produce the static production bundle ---
FROM node:22-alpine AS build
WORKDIR /app

# Install deps from the lockfile first (cached unless the lockfile changes).
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage: serve the static files with nginx ---
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
