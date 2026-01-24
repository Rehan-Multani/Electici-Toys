import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from "../Controller/WishlistCtrl.js";

import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Add to wishlist
router.post("/", AuthMiddleware, addToWishlist);

// Remove from wishlist
router.delete("/", AuthMiddleware, removeFromWishlist);

// Get wishlist for a user
router.get("/", AuthMiddleware, getWishlist);

export default router;
