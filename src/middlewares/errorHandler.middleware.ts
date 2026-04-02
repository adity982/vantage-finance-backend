import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";

/**
 * Global error-handling middleware.
 * Catches all errors thrown in the request pipeline and returns
 * a standardized JSON response: { error: string, code: number }.
 *
 * Must be registered AFTER all route handlers in the Express app.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log stack trace in development for debugging
  if (process.env.NODE_ENV !== "production") {
    console.error(`[Error] ${err.message}`);
    if (err.stack) {
      console.error(err.stack);
    }
  }

  if (err instanceof ApiError) {
    res.status(err.code).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Unexpected errors — never leak internal details to the client
  res.status(500).json({
    error: "Internal server error",
    code: 500,
  });
}
