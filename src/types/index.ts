import { Role } from "@prisma/client";
import { Request } from "express";

/**
 * JWT token payload structure.
 * Encoded in every issued token for downstream middleware use.
 */
export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

/**
 * Extended Express Request with authenticated user data.
 * Populated by the auth middleware after JWT verification.
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Filters applicable to finance record queries.
 */
export interface RecordFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
  type?: "INCOME" | "EXPENSE";
}

/**
 * Dashboard summary response shape.
 */
export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

/**
 * Category breakdown item for dashboard analytics.
 */
export interface CategoryBreakdown {
  category: string;
  total: number;
  type: string;
}

/**
 * Monthly trend data point for chart rendering.
 */
export interface TrendDataPoint {
  month: string;
  income: number;
  expense: number;
  net: number;
}
