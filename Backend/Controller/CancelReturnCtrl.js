import Order from "../Models/OrderModel.js";
import Product from "../Models/ProductModel.js";
import { createNotificationHelper } from "./NotificationCtrl.js";
import { sendEmail } from "../Helpers/emailHelper.js";

// ================= HELPER FUNCTIONS =================

// Restore stock when cancel/return is approved
const restoreStock = async (products) => {
    for (const item of products) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { quantity: item.quantity }
        });
    }
};

// Check if order is within return window (7 days from delivery)
const isWithinReturnWindow = (deliveredAt) => {
    if (!deliveredAt) return false;
    const deliveryDate = new Date(deliveredAt);
    const now = new Date();
    const daysDiff = Math.floor((now - deliveryDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
};

// ================= USER: REQUEST CANCEL =================
export const requestCancelOrder = async (req, res) => {
    try {
        const { orderId, cancelReason, refundDetails } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Verify order belongs to user
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Check if cancel is allowed (only pending/processing)
        const allowedStatuses = ["pending", "processing"];
        if (!allowedStatuses.includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel order with status: ${order.orderStatus}. Cancel is only allowed for Pending or Processing orders.`
            });
        }

        // Check if already cancelled or return requested
        if (order.cancelRequestedAt || order.orderStatus === "cancelled") {
            return res.status(400).json({ success: false, message: "Cancel request already submitted" });
        }

        // Check payment method for refund requirement
        const isOnlinePayment = ["RAZORPAY", "CARD", "ONLINE"].includes(order.paymentMethod?.toUpperCase());

        // Update order with cancel request
        order.cancelReason = cancelReason;
        order.cancelRequestedAt = new Date();

        if (isOnlinePayment && order.paymentStatus === "Paid") {
            // Online payment - needs refund
            order.refundStatus = "Pending";
            order.refundAmount = order.grandTotal;
            if (refundDetails) {
                order.refundDetails = refundDetails;
            }
        }

        await order.save();

        // Notify Admin
        createNotificationHelper({
            title: "Cancel Request Received",
            message: `Order ${order.orderId} cancel requested by user. Reason: ${cancelReason}`,
            type: "order",
            isAdmin: true
        }, req.io);

        res.json({
            success: true,
            message: "Cancel request submitted successfully. Admin will review your request.",
            order
        });

    } catch (error) {
        console.error("Request Cancel Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= USER: REQUEST RETURN =================
export const requestReturnOrder = async (req, res) => {
    try {
        const { orderId, returnReason, refundDetails } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Verify order belongs to user
        if (order.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        // Check if return is allowed (only delivered)
        if (order.orderStatus !== "delivered") {
            return res.status(400).json({
                success: false,
                message: "Return is only allowed for Delivered orders"
            });
        }

        // Check 7 day window
        const deliveredAt = order.statusTimestamps?.delivered;
        if (!isWithinReturnWindow(deliveredAt)) {
            return res.status(400).json({
                success: false,
                message: "Return window expired. Returns are only accepted within 7 days of delivery."
            });
        }

        // Validate return reason
        const validReasons = ["Wrong Product Delivered", "Defective / Damaged Product"];
        if (!validReasons.includes(returnReason)) {
            return res.status(400).json({
                success: false,
                message: "Invalid return reason. Allowed: Wrong Product Delivered, Defective / Damaged Product"
            });
        }

        // Check if already return requested
        if (order.returnRequestedAt) {
            return res.status(400).json({ success: false, message: "Return request already submitted" });
        }

        // Update order with return request
        order.returnReason = returnReason;
        order.returnRequestedAt = new Date();
        order.refundStatus = "Pending";
        order.refundAmount = order.grandTotal;

        if (refundDetails) {
            order.refundDetails = refundDetails;
        }

        await order.save();

        // Notify Admin
        createNotificationHelper({
            title: "Return Request Received",
            message: `Order ${order.orderId} return requested. Reason: ${returnReason}`,
            type: "order",
            isAdmin: true
        }, req.io);

        res.json({
            success: true,
            message: "Return request submitted successfully. Admin will review your request.",
            order
        });

    } catch (error) {
        console.error("Request Return Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ADMIN: APPROVE CANCEL =================
export const adminApproveCancel = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.cancelRequestedAt) {
            return res.status(400).json({ success: false, message: "No cancel request found for this order" });
        }

        if (order.cancelApprovedByAdmin !== null) {
            return res.status(400).json({ success: false, message: "Cancel request already processed" });
        }

        // Approve cancel
        order.cancelApprovedByAdmin = true;
        order.cancelProcessedAt = new Date();
        order.orderStatus = "cancelled";
        order.statusTimestamps.cancelled = new Date();

        // Restore stock if not already restored
        if (!order.stockRestored) {
            await restoreStock(order.products);
            order.stockRestored = true;
        }

        // Update refund status if online payment
        const isOnlinePayment = ["RAZORPAY", "CARD", "ONLINE"].includes(order.paymentMethod?.toUpperCase());
        if (isOnlinePayment && order.paymentStatus === "Paid") {
            order.refundStatus = "Processing";
        }

        await order.save();

        // Notify User
        createNotificationHelper({
            userId: order.userId,
            title: "Cancel Request Approved",
            message: `Your cancel request for order ${order.orderId} has been approved.`,
            type: "order"
        }, req.io);

        // Email notification
        if (order.shippingAddress?.email) {
            sendEmail(
                order.shippingAddress.email,
                "Order Cancelled - Electrycity Toys",
                `<h1>Order Cancelled</h1><p>Your order <b>${order.orderId}</b> has been cancelled as requested.</p>`
            );
        }

        res.json({ success: true, message: "Cancel approved successfully", order });

    } catch (error) {
        console.error("Admin Approve Cancel Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ADMIN: REJECT CANCEL =================
export const adminRejectCancel = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.cancelRequestedAt) {
            return res.status(400).json({ success: false, message: "No cancel request found" });
        }

        if (order.cancelApprovedByAdmin !== null) {
            return res.status(400).json({ success: false, message: "Cancel request already processed" });
        }

        // Reject cancel
        order.cancelApprovedByAdmin = false;
        order.cancelAdminResponse = reason || "Request rejected by admin";
        order.cancelProcessedAt = new Date();
        order.refundStatus = "Rejected";

        await order.save();

        // Notify User
        createNotificationHelper({
            userId: order.userId,
            title: "Cancel Request Rejected",
            message: `Your cancel request for order ${order.orderId} has been rejected. Reason: ${reason || 'N/A'}`,
            type: "order"
        }, req.io);

        res.json({ success: true, message: "Cancel rejected", order });

    } catch (error) {
        console.error("Admin Reject Cancel Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ADMIN: APPROVE RETURN =================
export const adminApproveReturn = async (req, res) => {
    try {
        const { orderId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.returnRequestedAt) {
            return res.status(400).json({ success: false, message: "No return request found" });
        }

        if (order.returnApprovedByAdmin !== null) {
            return res.status(400).json({ success: false, message: "Return request already processed" });
        }

        // Approve return
        order.returnApprovedByAdmin = true;
        order.returnProcessedAt = new Date();
        order.orderStatus = "cancelled"; // Mark as cancelled for revenue calculation
        order.statusTimestamps.cancelled = new Date();

        // Restore stock
        if (!order.stockRestored) {
            await restoreStock(order.products);
            order.stockRestored = true;
        }

        // Update refund status
        order.refundStatus = "Processing";

        await order.save();

        // Notify User
        createNotificationHelper({
            userId: order.userId,
            title: "Return Request Approved",
            message: `Your return request for order ${order.orderId} has been approved. Refund will be processed soon.`,
            type: "order"
        }, req.io);

        // Email
        if (order.shippingAddress?.email) {
            sendEmail(
                order.shippingAddress.email,
                "Return Approved - Electrycity Toys",
                `<h1>Return Approved</h1><p>Your return for order <b>${order.orderId}</b> has been approved. Refund will be processed soon.</p>`
            );
        }

        res.json({ success: true, message: "Return approved successfully", order });

    } catch (error) {
        console.error("Admin Approve Return Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ADMIN: REJECT RETURN =================
export const adminRejectReturn = async (req, res) => {
    try {
        const { orderId, reason } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (!order.returnRequestedAt) {
            return res.status(400).json({ success: false, message: "No return request found" });
        }

        if (order.returnApprovedByAdmin !== null) {
            return res.status(400).json({ success: false, message: "Return request already processed" });
        }

        // Reject return
        order.returnApprovedByAdmin = false;
        order.returnAdminResponse = reason || "Request rejected by admin";
        order.returnProcessedAt = new Date();
        order.refundStatus = "Rejected";

        await order.save();

        // Notify User
        createNotificationHelper({
            userId: order.userId,
            title: "Return Request Rejected",
            message: `Your return request for order ${order.orderId} has been rejected. Reason: ${reason || 'N/A'}`,
            type: "order"
        }, req.io);

        res.json({ success: true, message: "Return rejected", order });

    } catch (error) {
        console.error("Admin Reject Return Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ADMIN: COMPLETE REFUND =================
export const adminCompleteRefund = async (req, res) => {
    try {
        const { orderId, refundTransactionId } = req.body;

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (order.refundStatus !== "Processing") {
            return res.status(400).json({ success: false, message: "Order not eligible for refund completion" });
        }

        // Complete refund
        order.refundStatus = "Completed";
        order.refundProcessedAt = new Date();
        order.refundTransactionId = refundTransactionId;

        await order.save();

        // Notify User
        createNotificationHelper({
            userId: order.userId,
            title: "Refund Completed",
            message: `Refund of ₹${order.refundAmount} for order ${order.orderId} has been processed.`,
            type: "order"
        }, req.io);

        // Email
        if (order.shippingAddress?.email) {
            sendEmail(
                order.shippingAddress.email,
                "Refund Processed - Electrycity Toys",
                `<h1>Refund Completed</h1><p>Your refund of ₹${order.refundAmount} for order <b>${order.orderId}</b> has been processed.</p>`
            );
        }

        res.json({ success: true, message: "Refund marked as completed", order });

    } catch (error) {
        console.error("Admin Complete Refund Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= ADMIN: GET DASHBOARD STATS =================
export const getAdminDashboardStats = async (req, res) => {
    try {
        // Get all orders
        const orders = await Order.find();

        // Revenue: Only from delivered orders that are not cancelled/return-approved
        const revenueOrders = orders.filter(order =>
            order.orderStatus === "delivered" &&
            !order.cancelApprovedByAdmin &&
            !order.returnApprovedByAdmin
        );
        const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

        // Pending cancel requests
        const pendingCancelRequests = orders.filter(order =>
            order.cancelRequestedAt && order.cancelApprovedByAdmin === null
        ).length;

        // Pending return requests
        const pendingReturnRequests = orders.filter(order =>
            order.returnRequestedAt && order.returnApprovedByAdmin === null
        ).length;

        // Pending refunds
        const pendingRefunds = orders.filter(order =>
            order.refundStatus === "Processing"
        ).length;

        // Order status counts
        const statusCounts = {
            pending: orders.filter(o => o.orderStatus === "pending").length,
            processing: orders.filter(o => o.orderStatus === "processing").length,
            shipped: orders.filter(o => o.orderStatus === "shipped").length,
            delivered: orders.filter(o => o.orderStatus === "delivered").length,
            cancelled: orders.filter(o => o.orderStatus === "cancelled").length
        };

        res.json({
            success: true,
            stats: {
                totalRevenue,
                totalOrders: orders.length,
                pendingCancelRequests,
                pendingReturnRequests,
                pendingRefunds,
                statusCounts
            }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ================= GET ORDERS WITH FILTERS =================
export const getOrdersWithFilters = async (req, res) => {
    try {
        const { filter } = req.query;

        let query = {};

        switch (filter) {
            case "cancel-requests":
                query = { cancelRequestedAt: { $ne: null }, cancelApprovedByAdmin: null };
                break;
            case "return-requests":
                query = { returnRequestedAt: { $ne: null }, returnApprovedByAdmin: null };
                break;
            case "pending-refunds":
                query = { refundStatus: "Processing" };
                break;
            default:
                // All orders
                break;
        }

        const orders = await Order.find(query)
            .populate("userId")
            .populate("products.productId")
            .populate("shippingAddressId")
            .sort({ createdAt: -1 });

        res.json({ success: true, total: orders.length, orders });

    } catch (error) {
        console.error("Get Filtered Orders Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
