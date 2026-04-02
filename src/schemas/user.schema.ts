import { z } from "zod";
import { Role } from "@prisma/client";

/**
 * Schema for POST /api/users request body.
 * Validates user creation data including role assignment.
 */
export const createUserSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .trim()
    .toLowerCase(),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password must not exceed 128 characters"),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name cannot be empty")
    .max(100, "Name must not exceed 100 characters")
    .trim(),
  role: z.nativeEnum(Role, {
    required_error: "Role is required",
    invalid_type_error: "Role must be one of: VIEWER, ANALYST, ADMIN",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
