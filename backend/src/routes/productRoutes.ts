import { Router } from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  updateInventory,
} from "../controllers/productController";
import { getSimilarProducts } from "../controllers/recommendationController";
import { protect, restrictTo } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { productSchema } from "../utils/validators";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/similar", getSimilarProducts);

// Admin-only product management
router.post("/", protect, restrictTo("admin"), validateBody(productSchema), createProduct);
router.put("/:id", protect, restrictTo("admin"), updateProduct);
router.delete("/:id", protect, restrictTo("admin"), deleteProduct);
router.patch("/:id/inventory", protect, restrictTo("admin"), updateInventory);

export default router;
