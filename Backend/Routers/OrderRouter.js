import express from "express";
import {
  placeOrder,
  verifyPayment,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  cancelOrder
} from "../Controller/OrderCtrl.js";

import {
  requestCancelOrder,
  requestReturnOrder,
  adminApproveCancel,
  adminRejectCancel,
  adminApproveReturn,
  adminRejectReturn,
  adminCompleteRefund,
  getAdminDashboardStats,
  getOrdersWithFilters
} from "../Controller/CancelReturnCtrl.js";

const router = express.Router();

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

// ================= ADMIN ROUTES =================
router.get("/", AuthMiddleware, isAdmin, getAllOrders);
router.get("/filtered", AuthMiddleware, isAdmin, getOrdersWithFilters);
router.get("/dashboard-stats", AuthMiddleware, isAdmin, getAdminDashboardStats);
router.put("/update-status", AuthMiddleware, isAdmin, updateOrderStatus);

// Admin Cancel/Return Actions
router.put("/admin/approve-cancel", AuthMiddleware, isAdmin, adminApproveCancel);
router.put("/admin/reject-cancel", AuthMiddleware, isAdmin, adminRejectCancel);
router.put("/admin/approve-return", AuthMiddleware, isAdmin, adminApproveReturn);
router.put("/admin/reject-return", AuthMiddleware, isAdmin, adminRejectReturn);
router.put("/admin/complete-refund", AuthMiddleware, isAdmin, adminCompleteRefund);

// ================= USER ROUTES =================
router.post("/", AuthMiddleware, placeOrder);
router.post("/verify-payment", AuthMiddleware, verifyPayment);
router.get("/user", AuthMiddleware, getUserOrders);
router.get("/:id", getOrderById);

// User Cancel/Return Requests
router.put("/request-cancel", AuthMiddleware, requestCancelOrder);
router.put("/request-return", AuthMiddleware, requestReturnOrder);
router.put("/cancel-order", AuthMiddleware, cancelOrder); // Legacy - keep for backward compatibility

export default router;

