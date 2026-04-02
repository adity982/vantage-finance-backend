import dotenv from "dotenv";

// Load environment variables before anything else
dotenv.config();

import app from "./app";
import { prisma } from "./utils/prisma";

const PORT = process.env.PORT || 3000;

/**
 * Starts the Vantage Finance API server.
 * Connects to PostgreSQL via Prisma and begins listening on the configured port.
 */
async function bootstrap(): Promise<void> {
  try {
    // Verify database connectivity
    await prisma.$connect();
    console.log("✅ Connected to PostgreSQL database");

    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════════╗
  ║     🏦  Vantage Finance API                  ║
  ║     📡  Running on http://localhost:${PORT}     ║
  ║     🔐  RBAC-enabled with JWT Auth           ║
  ╚══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
