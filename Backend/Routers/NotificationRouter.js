import express from "express";
import {
    getUserNotifications,
    getAdminNotifications,
    markAsRead,
    deleteNotification
} from "../Controller/NotificationCtrl.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/", AuthMiddleware, getUserNotifications);
router.get("/admin", AuthMiddleware, isAdmin, getAdminNotifications);
router.put("/:id/read", AuthMiddleware, markAsRead);
router.delete("/:id", AuthMiddleware, deleteNotification);

export default router;
