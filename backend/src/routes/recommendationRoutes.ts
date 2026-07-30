import { Router } from "express";
import { getPersonalRecommendations } from "../controllers/recommendationController";
import { optionalAuth } from "../middleware/auth";

const router = Router();

// Publicly accessible; personalization kicks in automatically if a
// valid JWT cookie/header is present, via optionalAuth.
router.get("/", optionalAuth, getPersonalRecommendations);

export default router;
