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

const router = express.Router();

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

// Admin
router.get("/", AuthMiddleware, isAdmin, getAllOrders);
router.put("/update-status", AuthMiddleware, isAdmin, updateOrderStatus);

// User
router.post("/", AuthMiddleware, placeOrder);
router.post("/verify-payment", AuthMiddleware, verifyPayment);
router.get("/user", AuthMiddleware, getUserOrders);
router.get("/:id", getOrderById);
router.put("/cancel-order", AuthMiddleware, cancelOrder);


export default router;
