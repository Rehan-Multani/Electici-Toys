import express from "express";
import { getContent, updateContent } from "../Controller/ContentCtrl.js";
import { AuthMiddleware, isAdmin } from "../Middlewares/AuthMiddleware.js";

const router = express.Router();

router.get("/:page", getContent);
router.post("/:page", AuthMiddleware, isAdmin, updateContent);

export default router;
