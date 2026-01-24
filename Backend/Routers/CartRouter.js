import express from "express";
import {
    addToCart,
    removeFromCart,
    clearCart,
    getCart,
} from "../Controller/CartCtrl.js";

import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Add to cart
router.post("/", AuthMiddleware, addToCart);

// Remove from cart
router.delete("/", AuthMiddleware, removeFromCart);

// Clear cart
router.delete("/clear", AuthMiddleware, clearCart);

// Get cart for a user
router.get("/", AuthMiddleware, getCart);

export default router;
