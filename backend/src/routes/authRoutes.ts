import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/authController";
import { protect } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { registerSchema, loginSchema } from "../utils/validators";
import { authRateLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), register);
router.post("/login", authRateLimiter, validateBody(loginSchema), login);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
