import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";

/**
 * Handles GET /api/dashboard/summary.
 * Returns total income, total expense, and net balance.
 * Accessible by ANALYST and ADMIN roles.
 */
export async function getSummary(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const summary = await dashboardService.getSummary();

    res.status(200).json({
      message: "Dashboard summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles GET /api/dashboard/categories.
 * Returns breakdown of spending/income per category.
 * Accessible by ANALYST and ADMIN roles.
 */
export async function getCategoryBreakdown(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const breakdown = await dashboardService.getCategoryBreakdown();

    res.status(200).json({
      message: "Category breakdown retrieved successfully",
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles GET /api/dashboard/trends.
 * Returns monthly data points for chart rendering.
 * Accessible by ANALYST and ADMIN roles.
 */
export async function getTrends(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const trends = await dashboardService.getTrends();

    res.status(200).json({
      message: "Trend data retrieved successfully",
      data: trends,
    });
  } catch (error) {
    next(error);
  }
}
