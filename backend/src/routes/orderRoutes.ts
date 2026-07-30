import { Router } from "express";
import { checkout, getMyOrders, getOrderById, trackOrder } from "../controllers/orderController";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { checkoutSchema } from "../utils/validators";

const router = Router();

router.use(protect);

router.post("/checkout", validateBody(checkoutSchema), checkout);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.get("/:id/track", trackOrder);

export default router;
