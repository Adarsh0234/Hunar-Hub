import express from "express";
import {
    createServiceRequest,
    getMyServiceRequests,
    getBusinessServiceRequests,
    updateServiceRequestStatus,
    cancelServiceRequest,
    completeServiceRequest
} from "../controllers/serviceRequestController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createServiceRequest);
router.get("/my-requests", authMiddleware, getMyServiceRequests);
router.get(
    "/business/requests",
    authMiddleware,
    getBusinessServiceRequests
);
router.patch(
    "/business/requests/:requestId/status",
    authMiddleware,
    updateServiceRequestStatus
);
router.patch(
    "/:requestId/cancel",
    authMiddleware,
    cancelServiceRequest
);
router.patch(
    "/business/requests/:requestId/complete",
    authMiddleware,
    completeServiceRequest
);


export default router;