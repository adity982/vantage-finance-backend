import { Router } from "express";
import { Role } from "@prisma/client";
import * as userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema } from "../schemas/user.schema";

const router = Router();

// POST /api/users — Create new user (ADMIN ONLY)
router.post(
  "/",
  authenticate,
  checkRole([Role.ADMIN]),
  validate(createUserSchema),
  userController.createUser
);

export default router;
