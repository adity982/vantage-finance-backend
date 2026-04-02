import * as argon2 from "argon2";
import { prisma } from "../utils/prisma";
import { signToken } from "../utils/jwt";
import { ApiError } from "../utils/apiError";
import { Status } from "@prisma/client";

/**
 * Authenticates a user by email and password.
 * Verifies the password hash using Argon2 and returns a signed JWT.
 *
 * @param email - User's email address
 * @param password - User's plaintext password
 * @returns Object containing the JWT token and user info (excluding password)
 * @throws ApiError 401 if credentials are invalid or user is inactive
 */
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: { id: string; email: string; name: string; role: string } }> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  if (user.status === Status.INACTIVE) {
    throw ApiError.unauthorized("Account is inactive. Contact an administrator.");
  }

  const isPasswordValid = await argon2.verify(user.password, password);

  if (!isPasswordValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Never return the password in API responses (Brand Guideline §5)
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
}
