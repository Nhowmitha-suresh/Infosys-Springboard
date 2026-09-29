import express from "express";
import cors from "cors";
import morgan from "morgan";

import rulesRoutes from "./routes/rules.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import monitoringRoutes from "./routes/monitoring.routes.js";

// This service is now an internal microservice of the merged Medisphere
// platform (same role as ml-service/), reached through the platform's
// one React frontend and nginx (see ../frontend/nginx.conf -> /monitoring/
// and /socket.io/). It no longer serves its own standalone frontend build
// -- the platform already has one authenticated frontend, and duplicating
// a second UI here would just be two apps wearing one project's name.
export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

  app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "medisphere-monitoring-service" });
  });

  app.use("/api/rules", rulesRoutes);
  app.use("/api/notifications", notificationsRoutes);
  app.use("/api/monitoring", monitoringRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
  });

  // Centralized error handler — every route/controller forwards errors
  // here via next(err) (or asyncHandler).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error(err);
    const status = err.status || 500;
    res.status(status).json({ error: err.message || "Internal server error" });
  });

  return app;
}
