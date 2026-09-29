import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  patchNotificationStatus,
} from "../controllers/notifications.controller.js";

const router = Router();

router.get("/", getNotifications);
router.get("/unread-count/:patientId", getUnreadCount);
router.patch("/:id", patchNotificationStatus);

export default router;
