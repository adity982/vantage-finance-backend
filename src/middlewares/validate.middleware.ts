import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiError } from "../utils/apiError";

/**
 * Zod validation middleware factory.
 * Validates `req.body` against the provided Zod schema.
 * Returns 422 with formatted error details on validation failure.
 *
 * @param schema - The Zod schema to validate against
 * @returns Express middleware function
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        const formattedErrors = formatZodErrors(result.error);
        throw new ApiError(
          `Validation failed: ${formattedErrors}`,
          422
        );
      }

      // Replace body with parsed (and potentially transformed) data
      req.body = result.data;
      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Formats Zod validation errors into a human-readable string.
 */
function formatZodErrors(error: ZodError): string {
  return error.errors
    .map((err) => {
      const path = err.path.join(".");
      return path ? `${path}: ${err.message}` : err.message;
    })
    .join("; ");
}
