import express from "express";
import {
    createServiceReview,
    getServiceReviews
} from "../controllers/serviceReviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createServiceReview);
router.get("/service/:serviceId", getServiceReviews);


export default router;