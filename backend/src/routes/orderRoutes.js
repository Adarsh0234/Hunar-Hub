import express from "express";
import { createOrder, getMyOrders, getOrderDetails, getBusinessOrders, getBusinessOrderDetails, updateOrderStatus, cancelOrder } from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:orderId", authMiddleware, getOrderDetails);
router.get("/business/orders", authMiddleware, getBusinessOrders);
router.get(
    "/business/orders/:orderId",
    authMiddleware,
    getBusinessOrderDetails
);
router.patch(
    "/business/orders/:orderId/status",
    authMiddleware,
    updateOrderStatus
);
router.patch("/:orderId/cancel", authMiddleware, cancelOrder);




export default router;