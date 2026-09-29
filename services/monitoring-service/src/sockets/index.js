// Realtime transport for Mobile Notifications.
// Stands in for FCM/APNs push delivery: any client (web dashboard, a
// future mobile app) connects, joins a room for the patient(s) it cares
// about, and receives `notification:new` events as soon as the rule
// engine fires. See notification.service.js for the emit side.

export function initSockets(io) {
  io.on("connection", (socket) => {
    // Every connected client gets the global feed (mirrors the header bell).
    socket.join("notifications");

    socket.on("subscribe:patient", (patientId) => {
      if (typeof patientId === "string" && patientId.length > 0) {
        socket.join(`patient:${patientId}`);
      }
    });

    socket.on("unsubscribe:patient", (patientId) => {
      if (typeof patientId === "string" && patientId.length > 0) {
        socket.leave(`patient:${patientId}`);
      }
    });

    socket.on("notification:ack", async (notificationId) => {
      try {
        const { updateStatus } = await import("../services/notification.service.js");
        await updateStatus(notificationId, "DELIVERED");
      } catch (err) {
        console.error("Failed to mark notification delivered:", err.message);
      }
    });

    socket.on("disconnect", () => {
      // no-op — room membership is cleaned up automatically by socket.io
    });
  });
}
