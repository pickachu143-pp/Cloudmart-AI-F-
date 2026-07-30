import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/User";
import { TokenPayload } from "../utils/generateToken";

// Augment Express's Request type with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: "customer" | "admin"; email: string; name: string };
    }
  }
}

/**
 * Verifies the JWT from either the Authorization header (Bearer token)
 * or the httpOnly cookie, then attaches the authenticated user to req.user.
 */
export const protect = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw ApiError.unauthorized("Not authenticated. Please log in.");
  }

  let decoded: TokenPayload;
  try {
    decoded = jwt.verify(token, env.jwt.secret) as TokenPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token.");
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("User no longer exists or is deactivated.");
  }

  req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
  next();
});

/**
 * Like `protect`, but never throws — if no/invalid token is present the
 * request simply continues with req.user left undefined. Used on routes
 * (like recommendations) that behave differently for guests vs. logged-in
 * users but shouldn't require login.
 */
export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as TokenPayload;
    const user = await User.findById(decoded.id);
    if (user && user.isActive) {
      req.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    }
  } catch {
    // Invalid token on an optional route — just proceed unauthenticated.
  }
  next();
});

/** Restricts a route to one or more roles. Use after `protect`. */
export const restrictTo =
  (...roles: Array<"customer" | "admin">) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action.");
    }
    next();
  };
