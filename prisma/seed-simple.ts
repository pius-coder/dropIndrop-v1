/**
 * Simple Seed Script
 * 
 * Creates minimal test data matching actual schema
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting simple seed...");

  // Create single admin for testing
  console.log("👤 Creating admin...");
  const admin = await prisma.admin.create({
    data: {
      email: "admin@dropindrop.cm",
      password: "Admin123!", // TODO: Hash with bcrypt
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log(`✅ Created admin: ${admin.email}`);

  console.log("\n✅ Seed complete!");
}

main()
  .catch((error) => {
    console.error("❌ Error seeding:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
