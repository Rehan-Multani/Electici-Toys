import Notification from "../Models/NotificationModel.js";

/* ================= GET USER NOTIFICATIONS ================= */
export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id, isAdmin: false })
            .sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= GET ADMIN NOTIFICATIONS ================= */
export const getAdminNotifications = async (req, res) => {
    try {
        // Fetch notifications meant for admin
        const notifications = await Notification.find({ isAdmin: true })
            .sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= MARK AS READ ================= */
export const markAsRead = async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
        res.json({ success: true, message: "Marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= DELETE NOTIFICATION ================= */
export const deleteNotification = async (req, res) => {
    try {
        await Notification.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/* ================= HELPER: CREATE & EMIT ================= */
export const createNotificationHelper = async (data, io) => {
    // data: { userId, title, message, type, isAdmin }
    try {
        const notif = await Notification.create(data);

        if (io) {
            if (data.isAdmin) {
                io.emit("admin-notification", notif);
            } else if (data.userId) {
                io.to(data.userId.toString()).emit("notification", notif);
            }
        }
        return notif;
    } catch (error) {
        console.error("Create Notification Error:", error);
    }
};
