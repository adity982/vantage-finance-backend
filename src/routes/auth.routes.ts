import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

// POST /api/auth/login — Authenticate user and return JWT
router.post("/login", validate(loginSchema), authController.login);

export default router;
