import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ApiError } from "../utils/ApiError";

/**
 * Generic request-body validator. Pass any Zod schema and this middleware
 * validates req.body against it, replacing req.body with the parsed
 * (type-coerced) result on success, or forwarding a 400 ApiError on failure.
 */
export const validateBody =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(ApiError.badRequest("Validation failed", details));
    }
    req.body = result.data;
    next();
  };
