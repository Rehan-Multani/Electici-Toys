import express from "express";
import {
    getShippingSettings,
    updateShippingSettings,
    getShippingSlabs,
    createShippingSlab,
    updateShippingSlab,
    deleteShippingSlab,
    calculateShipping,
    getCheckoutShippingInfo
} from "../Controller/ShippingCtrl.js";

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

// Public routes
router.get("/checkout-info", getCheckoutShippingInfo);
router.post("/calculate", calculateShipping);

// Admin routes - Settings
router.get("/settings", AuthMiddleware, isAdmin, getShippingSettings);
router.put("/settings", AuthMiddleware, isAdmin, updateShippingSettings);

// Admin routes - Slabs
router.get("/slabs", AuthMiddleware, isAdmin, getShippingSlabs);
router.post("/slabs", AuthMiddleware, isAdmin, createShippingSlab);
router.put("/slabs/:id", AuthMiddleware, isAdmin, updateShippingSlab);
router.delete("/slabs/:id", AuthMiddleware, isAdmin, deleteShippingSlab);

export default router;
