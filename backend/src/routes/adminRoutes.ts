import { Router } from "express";
import { protect, restrictTo } from "../middleware/auth";
import { getDashboardStats, getAllUsers, setUserActiveStatus } from "../controllers/adminController";
import { getAllOrders, updateOrderStatus } from "../controllers/orderController";

const router = Router();

router.use(protect, restrictTo("admin"));

router.get("/dashboard", getDashboardStats);

router.get("/users", getAllUsers);
router.patch("/users/:id/status", setUserActiveStatus);

router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
