import express from "express";
import { addToCart, getMyCart, updateCartItem, removeCartItem, clearCart } from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getMyCart);
router.patch("/:cartItemId", authMiddleware, updateCartItem);
router.delete("/:cartItemId", authMiddleware, removeCartItem);
router.delete("/", authMiddleware, clearCart);
export default router;