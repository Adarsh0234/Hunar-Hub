import express from "express";
import multer from "multer";
import { createProduct, getProducts, getProductsByCategory, getBusinessProducts, updateProduct, deleteProduct, getMyProducts, getProductImage } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 }
});

const router = express.Router();

router.post("/", authMiddleware, upload.single("image"), createProduct);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.get("/business/:businessId", getBusinessProducts);
router.get("/:productId/image", getProductImage);
router.patch(
    "/:productId",
    authMiddleware,
    upload.single("image"),
    updateProduct
);
router.delete("/:productId", authMiddleware, deleteProduct);
router.get("/my-products", authMiddleware, getMyProducts);

export default router;