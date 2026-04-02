import { Request, Response, NextFunction } from "express";
import * as recordService from "../services/record.service";
import { AuthenticatedRequest, RecordFilters } from "../types";
import { CreateRecordInput, UpdateRecordInput } from "../schemas/record.schema";

/**
 * Handles GET /api/records.
 * Accessible by all authenticated users.
 * Supports query filters: startDate, endDate, category, type.
 */
export async function getRecords(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate, category, type } = req.query;

    const filters: RecordFilters = {};

    if (startDate && typeof startDate === "string") {
      filters.startDate = new Date(startDate);
    }
    if (endDate && typeof endDate === "string") {
      filters.endDate = new Date(endDate);
    }
    if (category && typeof category === "string") {
      filters.category = category;
    }
    if (type && typeof type === "string" && (type === "INCOME" || type === "EXPENSE")) {
      filters.type = type;
    }

    const records = await recordService.getRecords(filters);

    res.status(200).json({
      message: "Records retrieved successfully",
      data: records,
      count: records.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles POST /api/records.
 * ADMIN only — creates a new finance record.
 */
export async function createRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateRecordInput;
    const userId = (req as AuthenticatedRequest).user.userId;

    const record = await recordService.createRecord(data, userId);

    res.status(201).json({
      message: "Record created successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles PATCH /api/records/:id.
 * ADMIN only — updates an existing finance record.
 */
export async function updateRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;
    const data = req.body as UpdateRecordInput;

    const record = await recordService.updateRecord(id, data);

    res.status(200).json({
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Handles DELETE /api/records/:id.
 * ADMIN only — deletes a finance record.
 */
export async function deleteRecord(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;

    await recordService.deleteRecord(id);

    res.status(200).json({
      message: "Record deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}
