import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express route handler so any rejected promise / thrown
 * error is forwarded to next(), reaching the global error middleware
 * instead of crashing the process or hanging the request.
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
