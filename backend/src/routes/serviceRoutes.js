import express from "express";
import { createService, getServices, getBusinessServices, updateService, deleteService, getMyServices } from "../controllers/serviceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createService);
router.get("/", getServices);
router.get("/business/:businessId", getBusinessServices);
router.patch("/:serviceId", authMiddleware, updateService);
router.delete("/:serviceId", authMiddleware, deleteService);
router.get("/my-services", authMiddleware, getMyServices);

export default router;