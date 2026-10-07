import express from "express";
import { createProduct, getProducts, getProductsByCategory, getBusinessProducts, updateProduct, deleteProduct, getMyProducts } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/business/:businessId", getBusinessProducts);
router.patch("/:productId", authMiddleware, updateProduct);
router.delete("/:productId", authMiddleware, deleteProduct);
router.get("/my-products", authMiddleware, getMyProducts);

export default router;