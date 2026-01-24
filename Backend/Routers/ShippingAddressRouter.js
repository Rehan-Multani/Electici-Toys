import express from "express";
import {
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses
} from "../Controller/ShippingAddressCtrl.js";

const router = express.Router();

import { AuthMiddleware } from "../Middlewares/AuthMiddleware.js";
// Add address
router.post("/", AuthMiddleware, addAddress);

// Update address
router.put("/:id", AuthMiddleware, updateAddress);

// Delete address
router.delete("/:id", AuthMiddleware, deleteAddress);

// Get all addresses for user
router.get("/", AuthMiddleware, getAddresses);

export default router;
