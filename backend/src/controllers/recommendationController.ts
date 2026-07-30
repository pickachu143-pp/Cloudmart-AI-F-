import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { Product } from "../models/Product";
import { getRecentUserEvents } from "../services/cloudantService";
import { getRecommendations, buildActivityProfile } from "../services/watsonService";

/**
 * GET /api/recommendations
 * Personalized, AI-driven product recommendations (IBM Watson NLU).
 * Falls back to a rule-based "top rated" list for anonymous users or
 * when Watson / Cloudant aren't configured.
 */
export const getPersonalRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const catalog = await Product.find({ isActive: true }).populate("category", "name slug");

  if (!req.user) {
    const topRated = [...catalog].sort((a, b) => b.ratingAverage - a.ratingAverage).slice(0, 8);
    return ApiResponse.ok(res, "Recommendations fetched (general).", topRated, { personalized: false });
  }

  const recentEvents = await getRecentUserEvents(req.user.id, 20);
  const viewedProductIds = recentEvents.filter((e) => e.productId).map((e) => e.productId!) as string[];

  const viewedProducts = catalog.filter((p) => viewedProductIds.includes(p.id));
  const profileText = buildActivityProfile(
    viewedProducts.length > 0 ? viewedProducts : catalog.slice(0, 5) // cold start fallback
  );

  const recommendations = await getRecommendations(profileText, catalog, 8);

  return ApiResponse.ok(res, "Recommendations fetched.", recommendations, {
    personalized: viewedProducts.length > 0,
  });
});

/** GET /api/products/:id/similar — "customers also viewed" style, same category */
export const getSimilarProducts = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return ApiResponse.ok(res, "No similar products found.", []);
  }

  const similar = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    isActive: true,
  })
    .sort({ ratingAverage: -1 })
    .limit(6);

  return ApiResponse.ok(res, "Similar products fetched.", similar);
});
