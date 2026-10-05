import express from "express";
import {
    createProductReview,
    getProductReviews
} from "../controllers/productReviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProductReview);
router.get("/product/:productId", getProductReviews);

export default router;