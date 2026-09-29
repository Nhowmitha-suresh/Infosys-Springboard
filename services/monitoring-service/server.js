import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";

import { createApp } from "./src/app.js";
import { initSockets } from "./src/sockets/index.js";
import { attachIo } from "./src/services/notification.service.js";

dotenv.config();

const PORT = process.env.PORT || 4000;

const app = createApp();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

initSockets(io);
attachIo(io); // lets notification.service.js emit without a circular import

httpServer.listen(PORT, () => {
  console.log(`Medisphere monitoring-service (Milestone 3: rule engine + notifications) listening on http://localhost:${PORT}`);
  console.log(`Socket.IO realtime notifications ready on the same port (path /socket.io/).`);
});
