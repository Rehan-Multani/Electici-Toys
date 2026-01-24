import express from "express";
import {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    createProductReview
} from "../Controller/ProductCtrl.js";

const router = express.Router();
import upload from "../Cloudinary/Upload.js";

import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

router.post("/", AuthMiddleware, isAdmin, upload.array("images"), createProduct);          // Create
router.get("/", getAllProducts);           // Read All
router.get("/:id", getProductById);        // Read One
router.put("/:id", AuthMiddleware, isAdmin, upload.array("images"), updateProduct);         // Update
router.delete("/:id", AuthMiddleware, isAdmin, deleteProduct);      // Delete (Soft)
router.post("/:id/reviews", createProductReview); // Add Review

export default router;
