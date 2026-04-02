import jwt, { SignOptions } from "jsonwebtoken";
import { JwtPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "24h";

/**
 * Signs a JWT token containing the user's id, email, and role.
 * @param payload - User data to encode in the token
 * @returns Signed JWT string
 */
export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as string & SignOptions["expiresIn"],
  };
  return jwt.sign({ ...payload }, JWT_SECRET, options);
}

/**
 * Verifies and decodes a JWT token.
 * @param token - The JWT string to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}
