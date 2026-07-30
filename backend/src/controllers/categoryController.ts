import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Category } from "../models/Category";
import { Product } from "../models/Product";

/** GET /api/categories */
export const getCategories = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });
  return ApiResponse.ok(res, "Categories fetched.", categories);
});

/** POST /api/categories — admin only */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.create(req.body);
  return ApiResponse.created(res, "Category created.", category);
});

/** PUT /api/categories/:id — admin only */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("Category not found.");
  return ApiResponse.ok(res, "Category updated.", category);
});

/** DELETE /api/categories/:id — admin only */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const inUse = await Product.exists({ category: req.params.id, isActive: true });
  if (inUse) {
    throw ApiError.conflict("Cannot delete a category that still has active products.");
  }
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) throw ApiError.notFound("Category not found.");
  return ApiResponse.ok(res, "Category deleted.", null);
});
