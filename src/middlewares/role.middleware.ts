import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ApiError } from "../utils/apiError";
import { AuthenticatedRequest } from "../types";

/**
 * Role-Based Access Control (RBAC) middleware factory.
 * Returns a middleware that checks if the authenticated user's role
 * is included in the list of allowed roles.
 *
 * @param allowedRoles - Array of roles permitted to access the route
 * @returns Express middleware function
 *
 * @example
 * // Only ADMIN can access this route
 * router.post("/users", authenticate, checkRole([Role.ADMIN]), controller);
 *
 * // ANALYST and ADMIN can access this route
 * router.get("/dashboard", authenticate, checkRole([Role.ANALYST, Role.ADMIN]), controller);
 */
export function checkRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const authenticatedReq = req as AuthenticatedRequest;

      if (!authenticatedReq.user) {
        throw ApiError.unauthorized("Authentication required");
      }

      if (!allowedRoles.includes(authenticatedReq.user.role as Role)) {
        throw ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(", ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
