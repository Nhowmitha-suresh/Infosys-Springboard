// Mobile Notifications (server-side)
// -------------------------------------------------------------------------
// Persists one `notifications` row per fired rule and pushes it in real
// time over Socket.IO (a stand-in for FCM/APNs push in this prototype —
// see README "Wiring in a real push provider"). Frontend clients join a
// room per patient (`patient:<id>`) plus a global `notifications` room so
// the notification bell can show everything.

import { query } from "../db.js";
import { severityTitle } from "./ruleEngine.service.js";

let io = null;

export function attachIo(socketIoInstance) {
  io = socketIoInstance;
}

/**
 * Inserts a notification row for a fired alert and emits it in real time.
 * Returns the persisted notification row (snake_case, as stored).
 */
export async function createNotification(alert) {
  const title = severityTitle(alert.severity);
  const body = `${alert.patientName} \u00b7 ${alert.message}`;

  const { rows } = await query(
    `INSERT INTO notifications
       (patient_id, rule_id, prediction_id, notification_type, title, message, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING')
     RETURNING *`,
    [
      alert.patientId,
      alert.ruleId,
      alert.predictionId,
      alert.severity, // notification_type mirrors alert severity (critical/warning/info)
      title,
      body,
    ]
  );

  const notification = rows[0];
  await pushNotification(notification, alert);
  return notification;
}

/**
 * Emits the notification over Socket.IO and marks it SENT. Marked FAILED
 * if there is no realtime transport attached (e.g. sockets not initialized).
 */
async function pushNotification(notification, alert) {
  const payload = {
    id: notification.notification_id,
    patientId: notification.patient_id,
    ruleId: notification.rule_id,
    predictionId: notification.prediction_id,
    notificationType: notification.notification_type,
    title: notification.title,
    message: notification.message,
    status: notification.status,
    createdAt: notification.created_at,
    alert: alert
      ? {
          ruleName: alert.ruleName,
          category: alert.category,
          severity: alert.severity,
          analysis: alert.analysis,
          confidence: alert.confidence,
          autoActions: alert.autoActions,
          vitals: alert.vitals,
        }
      : undefined,
  };

  if (!io) {
    await updateStatus(notification.notification_id, "FAILED");
    return;
  }

  io.to(`patient:${notification.patient_id}`).emit("notification:new", payload);
  io.to("notifications").emit("notification:new", payload);

  await updateStatus(notification.notification_id, "SENT");
}

export async function updateStatus(notificationId, status) {
  const validStatuses = ["PENDING", "SENT", "DELIVERED", "READ", "FAILED"];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid notification status: ${status}`);
  }

  const timestampColumn =
    status === "READ" ? ", read_at = CURRENT_TIMESTAMP" : status === "SENT" ? ", sent_at = CURRENT_TIMESTAMP" : "";

  const { rows } = await query(
    `UPDATE notifications
        SET status = $2 ${timestampColumn}
      WHERE notification_id = $1
      RETURNING *`,
    [notificationId, status]
  );
  return rows[0];
}

export async function listNotifications({ patientId, status, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];

  if (patientId) {
    params.push(patientId);
    conditions.push(`patient_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  params.push(limit);
  params.push(offset);

  const { rows } = await query(
    `SELECT * FROM patient_notifications
       ${where}
     ORDER BY created_at DESC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );
  return rows;
}

export async function unreadCount(patientId) {
  const { rows } = await query(
    `SELECT COUNT(*)::int AS count
       FROM notifications
      WHERE patient_id = $1 AND status <> 'READ'`,
    [patientId]
  );
  return rows[0].count;
}
