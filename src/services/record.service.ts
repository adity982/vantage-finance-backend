import { Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/apiError";
import { CreateRecordInput, UpdateRecordInput } from "../schemas/record.schema";
import { RecordFilters } from "../types";

/**
 * Retrieves finance records with optional filtering.
 * Supports filtering by date range, category, and record type.
 *
 * @param filters - Optional filters (startDate, endDate, category, type)
 * @returns Array of matching finance records with creator info
 */
export async function getRecords(filters: RecordFilters) {
  const where: Prisma.FinanceRecordWhereInput = {};

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.date.lte = filters.endDate;
    }
  }

  if (filters.category) {
    where.category = {
      equals: filters.category,
      mode: "insensitive",
    };
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const records = await prisma.financeRecord.findMany({
    where,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  return records;
}

/**
 * Creates a new finance record linked to the authenticated user.
 *
 * @param data - Validated record creation input
 * @param userId - ID of the authenticated user creating the record
 * @returns The newly created finance record
 */
export async function createRecord(data: CreateRecordInput, userId: string) {
  const record = await prisma.financeRecord.create({
    data: {
      amount: new Prisma.Decimal(data.amount),
      type: data.type,
      category: data.category,
      date: new Date(data.date),
      notes: data.notes,
      createdById: userId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return record;
}

/**
 * Updates an existing finance record by ID.
 *
 * @param id - UUID of the record to update
 * @param data - Validated partial record data
 * @returns The updated finance record
 * @throws ApiError 404 if record not found
 */
export async function updateRecord(id: string, data: UpdateRecordInput) {
  const existing = await prisma.financeRecord.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Finance record with ID '${id}' not found`);
  }

  const updateData: Prisma.FinanceRecordUpdateInput = {};

  if (data.amount !== undefined) {
    updateData.amount = new Prisma.Decimal(data.amount);
  }
  if (data.type !== undefined) {
    updateData.type = data.type;
  }
  if (data.category !== undefined) {
    updateData.category = data.category;
  }
  if (data.date !== undefined) {
    updateData.date = new Date(data.date);
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  const record = await prisma.financeRecord.update({
    where: { id },
    data: updateData,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return record;
}

/**
 * Deletes a finance record by ID.
 *
 * @param id - UUID of the record to delete
 * @throws ApiError 404 if record not found
 */
export async function deleteRecord(id: string): Promise<void> {
  const existing = await prisma.financeRecord.findUnique({
    where: { id },
  });

  if (!existing) {
    throw ApiError.notFound(`Finance record with ID '${id}' not found`);
  }

  await prisma.financeRecord.delete({
    where: { id },
  });
}
