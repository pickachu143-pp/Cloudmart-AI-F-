import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/ApiResponse";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/User";
import { issueTokenCookie } from "../utils/generateToken";

/** POST /api/auth/register */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists.");
  }

  const user = await User.create({ name, email, password });
  const token = issueTokenCookie(res, { id: user.id, role: user.role });

  return ApiResponse.created(res, "Account created successfully.", {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

/** POST /api/auth/login */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password.");
  }
  if (!user.isActive) {
    throw ApiError.forbidden("This account has been deactivated.");
  }

  const token = issueTokenCookie(res, { id: user.id, role: user.role });

  return ApiResponse.ok(res, "Logged in successfully.", {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  });
});

/** POST /api/auth/logout */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("token");
  return ApiResponse.ok(res, "Logged out successfully.");
});

/** GET /api/auth/me */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.notFound("User not found.");
  return ApiResponse.ok(res, "Current user fetched.", { user });
});
