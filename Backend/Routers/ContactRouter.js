import { Router } from "express";
import { submitContactForm } from "../Controller/ContactCtrl.js";

const router = Router();

router.post("/submit", submitContactForm);

export default router;
