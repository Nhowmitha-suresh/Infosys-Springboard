# Milestone 3 microservice: Clinical Rule Engine + Mobile Notifications
# (Node/Express + Socket.IO). Same role in the stack as ml-service/ --
# an internal API reached through the platform's one frontend/nginx.
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY . .
EXPOSE 4000
CMD ["node", "server.js"]
