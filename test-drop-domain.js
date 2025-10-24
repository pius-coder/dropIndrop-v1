// Simple test to reproduce the drop validation error
const { PrismaClient } = require("@prisma/client");

async function testDropDomainFlow() {
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("🔍 Testing drop domain flow...");

    // First, let's see what users exist
    console.log("\n👥 Getting all users...");
    const users = await prisma.user.findMany({
      select: { id: true, username: true, role: true },
      take: 5,
    });
    console.log("Users:", users);

    if (users.length === 0) {
      console.log("❌ No users found. Please create a user first.");
      return;
    }

    const testUserId = users[0].id;
    console.log(`\n🧪 Using test user ID: ${testUserId}`);

    // Test the exact query that the repository uses
    console.log("\n📋 Testing repository-style query...");

    const where = {
      createdBy: testUserId, // This is what the repository uses
    };

    console.log("Where clause:", where);

    const total = await prisma.drop.count({ where });
    console.log("Total drops for user:", total);

    const prismaDrops = await prisma.drop.findMany({
      where,
      include: {
        products: {
          include: { product: true },
          orderBy: { sortOrder: "asc" },
        },
        groups: {
          include: { group: true },
        },
      },
      orderBy: { scheduledDate: "desc" },
      take: 20,
    });

    console.log("Prisma drops found:", prismaDrops.length);

    if (prismaDrops.length > 0) {
      console.log("First drop structure:", {
        id: prismaDrops[0].id,
        name: prismaDrops[0].name,
        createdBy: prismaDrops[0].createdBy,
        status: prismaDrops[0].status,
        productsCount: prismaDrops[0].products?.length || 0,
        groupsCount: prismaDrops[0].groups?.length || 0,
        hasScheduledDate: !!prismaDrops[0].scheduledDate,
      });

      // Test the mapping logic
      console.log("\n🔄 Testing domain mapping...");

      const firstDrop = prismaDrops[0];
      const products = firstDrop.products.map((dp) => ({
        productId: dp.productId,
        sortOrder: dp.sortOrder,
      }));

      const groups = firstDrop.groups.map((dg) => ({
        groupId: dg.groupId,
      }));

      console.log("Mapped products:", products.length);
      console.log("Mapped groups:", groups.length);

      // Test creating DropListResult structure
      const result = {
        drops: [], // Would be mapped drops
        total,
        page: 1,
        limit: 20,
        totalPages: Math.ceil(total / 20),
      };

      console.log("DropListResult structure:", {
        hasDrops: !!result.drops,
        dropsType: Array.isArray(result.drops) ? "array" : typeof result.drops,
        total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } else {
      console.log("❌ No drops found for user");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDropDomainFlow();
