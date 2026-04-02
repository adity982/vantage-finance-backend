import { Request, Response, NextFunction } from "express";
import * as userService from "../services/user.service";
import { CreateUserInput } from "../schemas/user.schema";

/**
 * Handles POST /api/users.
 * Creates a new user (ADMIN only, enforced at route level).
 * Returns 201 Created with the new user data (excluding password).
 */
export async function createUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = req.body as CreateUserInput;
    const user = await userService.createUser(data);

    res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
}
