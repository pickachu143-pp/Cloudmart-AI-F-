import { Response } from "express";

/**
 * Uniform success envelope so every endpoint in the API returns the same
 * shape: { success, message, data, meta? }.
 */
export class ApiResponse {
  static send(
    res: Response,
    statusCode: number,
    message: string,
    data: unknown = null,
    meta?: Record<string, unknown>
  ) {
    return res.status(statusCode).json({
      success: statusCode < 400,
      message,
      data,
      ...(meta ? { meta } : {}),
    });
  }

  static ok(res: Response, message = "Success", data: unknown = null, meta?: Record<string, unknown>) {
    return ApiResponse.send(res, 200, message, data, meta);
  }

  static created(res: Response, message = "Created", data: unknown = null) {
    return ApiResponse.send(res, 201, message, data);
  }
}
