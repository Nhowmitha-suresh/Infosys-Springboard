import { listNotifications, updateStatus, unreadCount } from "../services/notification.service.js";

export async function getNotifications(req, res, next) {
  try {
    const { patientId, status, limit, offset } = req.query;
    const rows = await listNotifications({
      patientId,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    });
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function getUnreadCount(req, res, next) {
  try {
    const count = await unreadCount(req.params.patientId);
    res.json({ patientId: req.params.patientId, count });
  } catch (err) {
    next(err);
  }
}

export async function patchNotificationStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: "status is required" });

    const updated = await updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: "Notification not found" });
    res.json(updated);
  } catch (err) {
    if (err.message?.startsWith("Invalid notification status")) {
      return res.status(400).json({ error: err.message });
    }
    next(err);
  }
}
