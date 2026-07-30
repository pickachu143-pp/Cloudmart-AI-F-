import { Router } from "express";
import { getCart, addItem, updateItemQuantity, removeItem, clearCart } from "../controllers/cartController";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { cartItemSchema } from "../utils/validators";

const router = Router();

router.use(protect); // every cart route requires an authenticated user

router.get("/", getCart);
router.post("/items", validateBody(cartItemSchema), addItem);
router.patch("/items/:productId", updateItemQuantity);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

export default router;
