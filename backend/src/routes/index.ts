import { Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";
import categoryRoutes from "./categoryRoutes";
import cartRoutes from "./cartRoutes";
import orderRoutes from "./orderRoutes";
import recommendationRoutes from "./recommendationRoutes";
import adminRoutes from "./adminRoutes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ success: true, message: "CloudMart AI API is healthy.", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/recommendations", recommendationRoutes);
router.use("/admin", adminRoutes);

export default router;
