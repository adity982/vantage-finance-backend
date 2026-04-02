import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";

/**
 * Authentication middleware.
 * Extracts and verifies the JWT from the Authorization header.
 * Attaches the decoded user payload to `req.user` for downstream use.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Missing or malformed authorization header");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw ApiError.unauthorized("Token not provided");
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      throw ApiError.unauthorized("Invalid or expired token");
    }

    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (error) {
    next(error);
  }
}
