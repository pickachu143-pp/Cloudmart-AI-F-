import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Product } from "../models/Product";
import { logEvent } from "../services/cloudantService";

/** GET /api/products — public catalog listing with search, filter, pagination */
export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt((req.query.limit as string) ?? "12", 10)));
  const { category, search, minPrice, maxPrice, sort } = req.query;

  const filter: Record<string, unknown> = { isActive: true };
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {
      ...(minPrice ? { $gte: Number(minPrice) } : {}),
      ...(maxPrice ? { $lte: Number(maxPrice) } : {}),
    };
  }
  if (search) {
    filter.$text = { $search: String(search) };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    newest: { createdAt: -1 },
    rating: { ratingAverage: -1 },
  };
  const sortOption = sortMap[sort as string] ?? { createdAt: -1 };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  if (search) {
    await logEvent({ type: "search", userId: req.user?.id ?? "anonymous", query: String(search) });
  }

  return ApiResponse.ok(res, "Products fetched.", products, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/** GET /api/products/:id */
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate("category", "name slug");
  if (!product) throw ApiError.notFound("Product not found.");

  await logEvent({
    type: "product_view",
    userId: req.user?.id ?? "anonymous",
    productId: product.id,
  });

  return ApiResponse.ok(res, "Product fetched.", product);
});

/** POST /api/products — admin only */
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.create(req.body);
  return ApiResponse.created(res, "Product created.", product);
});

/** PUT /api/products/:id — admin only */
export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("Product not found.");
  return ApiResponse.ok(res, "Product updated.", product);
});

/** DELETE /api/products/:id — admin only (soft delete) */
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) throw ApiError.notFound("Product not found.");
  return ApiResponse.ok(res, "Product deleted.", null);
});

/** PATCH /api/products/:id/inventory — admin only, adjusts stock */
export const updateInventory = asyncHandler(async (req: Request, res: Response) => {
  const { stock } = req.body as { stock: number };
  if (typeof stock !== "number" || stock < 0) {
    throw ApiError.badRequest("stock must be a non-negative number.");
  }
  const product = await Product.findByIdAndUpdate(req.params.id, { stock }, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound("Product not found.");
  return ApiResponse.ok(res, "Inventory updated.", product);
});
