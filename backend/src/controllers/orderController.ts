import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { Order, OrderStatus } from "../models/Order";
import { createOrderFromCart } from "../services/orderService";
import { logEvent } from "../services/cloudantService";

/** POST /api/orders/checkout */
export const checkout = asyncHandler(async (req: Request, res: Response) => {
  const { shippingAddress, paymentMethod } = req.body;
  const order = await createOrderFromCart(req.user!.id, shippingAddress, paymentMethod);

  await Promise.all(
    order.items.map((item) =>
      logEvent({ type: "product_purchase", userId: req.user!.id, productId: item.product.toString() })
    )
  );

  return ApiResponse.created(res, "Order placed successfully.", order);
});

/** GET /api/orders — current user's order history */
export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await Order.find({ user: req.user!.id }).sort({ createdAt: -1 });
  return ApiResponse.ok(res, "Orders fetched.", orders);
});

/** GET /api/orders/:id — single order (owner or admin) */
export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found.");

  const isOwner = order.user.toString() === req.user!.id;
  if (!isOwner && req.user!.role !== "admin") {
    throw ApiError.forbidden("You do not have access to this order.");
  }

  return ApiResponse.ok(res, "Order fetched.", order);
});

/** GET /api/orders/:id/track — lightweight tracking view (status + history) */
export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id).select("orderNumber status statusHistory user createdAt");
  if (!order) throw ApiError.notFound("Order not found.");

  const isOwner = order.user.toString() === req.user!.id;
  if (!isOwner && req.user!.role !== "admin") {
    throw ApiError.forbidden("You do not have access to this order.");
  }

  return ApiResponse.ok(res, "Tracking info fetched.", {
    orderNumber: order.orderNumber,
    status: order.status,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
  });
});

/** GET /api/admin/orders — admin only, all orders */
export const getAllOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? "20", 10)));
  const statusFilter = req.query.status as OrderStatus | undefined;

  const filter = statusFilter ? { status: statusFilter } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return ApiResponse.ok(res, "All orders fetched.", orders, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

/** PATCH /api/admin/orders/:id/status — admin only */
export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const { status, note } = req.body as { status: OrderStatus; note?: string };
  const validStatuses: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!validStatuses.includes(status)) {
    throw ApiError.badRequest(`status must be one of: ${validStatuses.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound("Order not found.");

  order.status = status;
  order.statusHistory.push({ status, note, timestamp: new Date() });
  await order.save();

  return ApiResponse.ok(res, "Order status updated.", order);
});
