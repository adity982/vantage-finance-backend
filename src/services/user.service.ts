import * as argon2 from "argon2";
import { prisma } from "../utils/prisma";
import { ApiError } from "../utils/apiError";
import { CreateUserInput } from "../schemas/user.schema";

/**
 * Creates a new user with a hashed password.
 * Only callable by ADMIN users (enforced at the route level via RBAC middleware).
 *
 * @param data - Validated user creation input (email, password, name, role)
 * @returns Created user object (excluding password)
 * @throws ApiError 400 if email is already registered
 */
export async function createUser(data: CreateUserInput): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  createdAt: Date;
}> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw ApiError.badRequest("A user with this email already exists");
  }

  const hashedPassword = await argon2.hash(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      role: data.role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return user;
}
