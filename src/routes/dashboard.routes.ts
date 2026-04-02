import { Router, Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";

const router = Router();

// All dashboard routes require ANALYST or ADMIN role
const dashboardGuard = checkRole([Role.ANALYST, Role.ADMIN]);

// GET /api/dashboard/summary — Total Income, Expense, Net Balance
router.get("/summary", authenticate, dashboardGuard, dashboardController.getSummary);

// GET /api/dashboard/categories — Spending breakdown by category
router.get("/categories", authenticate, dashboardGuard, dashboardController.getCategoryBreakdown);

// GET /api/dashboard/trends — Monthly data points for charts
router.get("/trends", authenticate, dashboardGuard, dashboardController.getTrends);

export default router;
