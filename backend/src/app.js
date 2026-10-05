import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import userRoutes from "./routes/userRoutes.js";
import businessRoutes from "./routes/businessRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import serviceRequestRoutes from "./routes/serviceRequestRoutes.js";
import serviceReviewRoutes from "./routes/serviceReviewRoutes.js";
import productReviewRoutes from "./routes/productReviewRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/service-requests", serviceRequestRoutes);
app.use("/api/service-reviews", serviceReviewRoutes);
app.use("/api/product-reviews", productReviewRoutes);

app.get("/api/test", (req, res) => {
    res.json({
        message: "HunarHub backend is working!"
    });
});

app.get("/api/protected-test", authMiddleware, (req, res) => {
    res.json({
        message: "You are authenticated!",
        user: req.user
    });
});

export default app;