import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["order", "system", "promotion", "admin"],
            default: "system",
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isAdmin: { // For admin notifications
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true,
    }
);

export default mongoose.model("Notification", notificationSchema);
