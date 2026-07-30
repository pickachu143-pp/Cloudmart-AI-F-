import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

/**
 * Central error-handling middleware. Every thrown/forwarded error in the
 * app funnels through here, so API error responses are always the same
 * predictable shape.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = env.isProduction ? "Internal server error" : err.message;
  }

  // Mongoose duplicate key error
  if (isMongoDuplicateKeyError(err)) {
    statusCode = 409;
    message = "A record with these details already exists.";
  }

  // Mongoose validation error
  if (err instanceof Error && err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed.";
    details = (err as any).errors;
  }

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}: ${(err as Error)?.stack ?? err}`);
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.isProduction ? {} : { stack: (err as Error)?.stack }),
  });
}

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as any).code === 11000;
}
