import { PrismaClient, Role, Status } from "@prisma/client";
import * as argon2 from "argon2";

const prisma = new PrismaClient();

/**
 * Seeds the database with an initial ADMIN user.
 * This allows first-time setup without manual database manipulation.
 */
async function main(): Promise<void> {
  const adminEmail = "admin@vantage.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("⚡ Admin user already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await argon2.hash("Admin123!");

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: "Vantage Admin",
      role: Role.ADMIN,
      status: Status.ACTIVE,
    },
  });

  console.log(`✅ Admin user created: ${admin.email} (ID: ${admin.id})`);
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
