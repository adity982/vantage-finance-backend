import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { LoginInput } from "../schemas/auth.schema";

/**
 * Handles POST /api/auth/login.
 * Authenticates a user and returns a JWT token.
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput;
    const result = await authService.login(email, password);

    res.status(200).json({
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}
