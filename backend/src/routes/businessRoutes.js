import express from "express";
import { 
    getBusinessProfile, 
    updateBusinessProfile, 
    getBusinessCategories, 
    getBusinessLogo, 
    uploadBusinessLogo 
} from "../controllers/businessController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadLogo } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/profile", authMiddleware, getBusinessProfile);
router.put(
    "/profile",
    authMiddleware,
    uploadLogo.single("logo"),
    updateBusinessProfile
);
router.patch(
    "/logo",
    authMiddleware,
    uploadLogo.single("logo"),
    uploadBusinessLogo
);
router.get("/categories", getBusinessCategories);
router.get(
    "/logo",
    authMiddleware,
    getBusinessLogo
);

export default router;