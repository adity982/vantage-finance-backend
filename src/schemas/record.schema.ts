import { z } from "zod";
import { RecordType } from "@prisma/client";

/**
 * Schema for POST /api/records request body.
 * Validates financial record creation data.
 */
export const createRecordSchema = z.object({
  amount: z
    .number({ required_error: "Amount is required" })
    .positive("Amount must be a positive number"),
  type: z.nativeEnum(RecordType, {
    required_error: "Type is required",
    invalid_type_error: "Type must be INCOME or EXPENSE",
  }),
  category: z
    .string({ required_error: "Category is required" })
    .min(1, "Category cannot be empty")
    .max(50, "Category must not exceed 50 characters")
    .trim(),
  date: z
    .string({ required_error: "Date is required" })
    .datetime("Date must be a valid ISO 8601 datetime string"),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .trim()
    .default(""),
});

/**
 * Schema for PATCH /api/records/:id request body.
 * All fields are optional to allow partial updates.
 */
export const updateRecordSchema = z.object({
  amount: z.number().positive("Amount must be a positive number").optional(),
  type: z
    .nativeEnum(RecordType, {
      invalid_type_error: "Type must be INCOME or EXPENSE",
    })
    .optional(),
  category: z
    .string()
    .min(1, "Category cannot be empty")
    .max(50, "Category must not exceed 50 characters")
    .trim()
    .optional(),
  date: z
    .string()
    .datetime("Date must be a valid ISO 8601 datetime string")
    .optional(),
  notes: z
    .string()
    .max(500, "Notes must not exceed 500 characters")
    .trim()
    .optional(),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
