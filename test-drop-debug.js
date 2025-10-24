const { PrismaClient } = require("@prisma/client");

async function testDropQuery() {
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("🔍 Testing drop queries...");

    // Test 1: Count drops
    console.log("\n📊 Test 1: Count all drops");
    const totalCount = await prisma.drop.count();
    console.log("Total drops in DB:", totalCount);

    // Test 2: List drops with user filter
    console.log("\n📋 Test 2: List drops with createdBy filter");
    const drops = await prisma.drop.findMany({
      where: {
        createdBy: "test-user-id", // This should match an existing user ID
      },
      include: {
        products: {
          include: { product: true },
          orderBy: { sortOrder: "asc" },
        },
        groups: {
          include: { group: true },
        },
      },
      take: 10,
    });

    console.log("Drops found:", drops.length);
    console.log(
      "Sample drop structure:",
      drops[0]
        ? {
            id: drops[0].id,
            name: drops[0].name,
            createdBy: drops[0].createdBy,
            productsCount: drops[0].products?.length || 0,
            groupsCount: drops[0].groups?.length || 0,
          }
        : "No drops found"
    );

    // Test 3: Check if user exists
    console.log("\n👤 Test 3: Check if test user exists");
    const user = await prisma.user.findFirst({
      where: { id: "test-user-id" },
    });
    console.log("User exists:", !!user);

    if (user) {
      console.log("User details:", {
        id: user.id,
        username: user.username,
        role: user.role,
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDropQuery();
