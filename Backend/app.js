import { Router } from "express";

import AuthRouter from "./Routers/AuthRouter.js";
import ProductRouter from "./Routers/ProductRouter.js";
import ContentRouter from "./Routers/ContentRouter.js";
import CategoryRouter from "./Routers/CategoryRouter.js";
import WishlistRouter from "./Routers/WishlistRouter.js";
import CartRouter from "./Routers/CartRouter.js";
import ShippingAddressRouter from "./Routers/ShippingAddressRouter.js";
import OrderRouter from "./Routers/OrderRouter.js";
import DashboardReportRouter from "./Routers/Dashbaord-ReportRouter.js";
import ShippingRouter from "./Routers/ShippingRouter.js";
import ContactRouter from "./Routers/ContactRouter.js";

import NotificationRouter from "./Routers/NotificationRouter.js";

const router = Router();

router.use("/api/v1/auth", AuthRouter);
router.use("/api/v1/product", ProductRouter);
router.use("/api/v1/content", ContentRouter);
router.use("/api/v1/category", CategoryRouter);
router.use("/api/v1/wishlist", WishlistRouter);
router.use("/api/v1/cart", CartRouter);
router.use("/api/v1/shipping-address", ShippingAddressRouter);
router.use("/api/v1/order", OrderRouter);
router.use("/api/v1/shipping", ShippingRouter);
router.use("/api/v1/contact", ContactRouter);
router.use("/api/v1/noification", NotificationRouter); // Typo intentional? No, stick to clean 'notifications'
router.use("/api/v1/notifications", NotificationRouter);
router.use("/api/v1", DashboardReportRouter);

export default router;
