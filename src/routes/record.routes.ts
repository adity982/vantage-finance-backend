import { Router } from "express";
import { Role } from "@prisma/client";
import * as recordController from "../controllers/record.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { checkRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createRecordSchema, updateRecordSchema } from "../schemas/record.schema";

const router = Router();

// GET /api/records — Accessible by all authenticated users (with optional filters)
router.get("/", authenticate, recordController.getRecords);

// POST /api/records — Create record (ADMIN ONLY)
router.post(
  "/",
  authenticate,
  checkRole([Role.ADMIN]),
  validate(createRecordSchema),
  recordController.createRecord
);

// PATCH /api/records/:id — Update record (ADMIN ONLY)
router.patch(
  "/:id",
  authenticate,
  checkRole([Role.ADMIN]),
  validate(updateRecordSchema),
  recordController.updateRecord
);

// DELETE /api/records/:id — Delete record (ADMIN ONLY)
router.delete(
  "/:id",
  authenticate,
  checkRole([Role.ADMIN]),
  recordController.deleteRecord
);

export default router;
