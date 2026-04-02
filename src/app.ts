import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import recordRoutes from "./routes/record.routes";
import dashboardRoutes from "./routes/dashboard.routes";

/**
 * Creates and configures the Express application.
 * Registers all middleware, routes, and the global error handler.
 */
const app = express();

// ─── Global Middleware ────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "Vantage Finance API",
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    error: "Route not found",
    code: 404,
  });
});

// ─── Global Error Handler (must be last) ──────────────────────────────
app.use(errorHandler);

export default app;
