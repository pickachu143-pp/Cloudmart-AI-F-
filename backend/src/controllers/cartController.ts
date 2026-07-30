import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Cart } from "../models/Cart";
import { Product } from "../models/Product";

async function getOrCreateCart(userId: string) {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
}

/** GET /api/cart */
export const getCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  await cart.populate("items.product", "name price imageUrl stock isActive");
  return ApiResponse.ok(res, "Cart fetched.", cart);
});

/** POST /api/cart/items */
export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { productId, quantity } = req.body as { productId: string; quantity: number };

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound("Product not found.");
  if (product.stock < quantity) throw ApiError.badRequest(`Only ${product.stock} units available.`);

  const cart = await getOrCreateCart(req.user!.id);
  const existing = cart.items.find((i) => i.product.toString() === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: product._id, quantity, priceAtAdd: product.price });
  }

  await cart.save();
  await cart.populate("items.product", "name price imageUrl stock isActive");
  return ApiResponse.ok(res, "Item added to cart.", cart);
});

/** PATCH /api/cart/items/:productId */
export const updateItemQuantity = asyncHandler(async (req: Request, res: Response) => {
  const { quantity } = req.body as { quantity: number };
  if (typeof quantity !== "number" || quantity < 1) {
    throw ApiError.badRequest("quantity must be a positive number.");
  }

  const cart = await getOrCreateCart(req.user!.id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) throw ApiError.notFound("Item not found in cart.");

  item.quantity = quantity;
  await cart.save();
  await cart.populate("items.product", "name price imageUrl stock isActive");
  return ApiResponse.ok(res, "Cart item updated.", cart);
});

/** DELETE /api/cart/items/:productId */
export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  await cart.populate("items.product", "name price imageUrl stock isActive");
  return ApiResponse.ok(res, "Item removed from cart.", cart);
});

/** DELETE /api/cart */
export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const cart = await getOrCreateCart(req.user!.id);
  cart.items = [];
  await cart.save();
  return ApiResponse.ok(res, "Cart cleared.", cart);
});
