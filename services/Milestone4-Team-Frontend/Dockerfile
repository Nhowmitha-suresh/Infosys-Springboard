# Multi-stage build: compile the Vite/React app, then serve the static
# output with nginx. For local development, `npm run dev` (see README)
# is faster and gives hot-reload — this Dockerfile is for a
# production-style run via docker-compose.
# Multi-stage build: compile the Vite/React app, then serve the static
# output with nginx. For local development, `npm run dev` (see README)
# is faster and gives hot-reload — this Dockerfile is for a
# production-style run via docker-compose.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Single-host deployment: default these to same-origin paths so the
# browser only ever talks to ONE URL (wherever nginx below is served
# from) -- nginx proxies /api -> backend, /ml -> ml-service, and
# /monitoring + /socket.io -> monitoring-service (see nginx.conf).
# Override at build time with --build-arg if you deploy frontend/backend/
# ml-service/monitoring-service on genuinely different hosts instead.
ARG VITE_API_BASE_URL=/api
ARG VITE_ML_API_URL=/ml
ARG VITE_MONITORING_API_URL=/monitoring
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ML_API_URL=$VITE_ML_API_URL
ENV VITE_MONITORING_API_URL=$VITE_MONITORING_API_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
