import multer from "multer";

const storage = multer.memoryStorage();

export const uploadLogo = multer({
    storage,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});