import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { Order } from "../models/Order";
import { Category } from "../models/Category";

/** GET /api/admin/dashboard — aggregate stats for the admin dashboard */
export const getDashboardStats = asyncHandler(async (_req: Request, res: Response) => {
  const [userCount, productCount, categoryCount, orderCount, revenueAgg, lowStockCount, recentOrders] =
    await Promise.all([
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$grandTotal" } } },
      ]),
      Product.countDocuments({ isActive: true, stock: { $lte: 5 } }),
      Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name email"),
    ]);

  const ordersByStatus = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

  return ApiResponse.ok(res, "Dashboard stats fetched.", {
    userCount,
    productCount,
    categoryCount,
    orderCount,
    totalRevenue: revenueAgg[0]?.total ?? 0,
    lowStockCount,
    ordersByStatus: ordersByStatus.reduce((acc, item) => ({ ...acc, [item._id]: item.count }), {}),
    recentOrders,
  });
});

/** GET /api/admin/users — admin only, list customers */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, parseInt((req.query.page as string) ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) ?? "20", 10)));

  const [users, total] = await Promise.all([
    User.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);

  return ApiResponse.ok(res, "Users fetched.", users, { page, limit, total, totalPages: Math.ceil(total / limit) });
});

/** PATCH /api/admin/users/:id/status — admin only, activate/deactivate a user */
export const setUserActiveStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body as { isActive: boolean };
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  return ApiResponse.ok(res, "User status updated.", user);
});
