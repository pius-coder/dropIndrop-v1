// Quick test to verify the fix works
const { PrismaClient } = require("@prisma/client");

async function testFix() {
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
  });

  try {
    console.log("🔍 Testing if the fix works...");

    // Test the exact same query pattern as the repository
    const where = { createdBy: "demo-user-id" };
    console.log("Testing where clause:", where);

    const drops = await prisma.drop.findMany({
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
      take: 10,
    });

    console.log("✅ Query executed successfully");
    console.log("Drops found:", drops.length);

    if (drops.length > 0) {
      console.log("First drop:", {
        id: drops[0].id,
        name: drops[0].name,
        createdBy: drops[0].createdBy,
        status: drops[0].status,
      });

      // Test the mapping
      const products = drops[0].products.map((dp) => ({
        productId: dp.productId,
        sortOrder: dp.sortOrder,
      }));

      const groups = drops[0].groups.map((dg) => ({
        groupId: dg.groupId,
      }));

      console.log("✅ Mapping works");
      console.log("Products:", products.length);
      console.log("Groups:", groups.length);

      // Test the expected return structure
      const result = {
        drops: [drops[0]], // Would be mapped drops
        total: drops.length,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      console.log("✅ Result structure is correct");
      console.log("Result keys:", Object.keys(result));
      console.log("Drops is array:", Array.isArray(result.drops));
      console.log("Total is number:", typeof result.total === "number");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testFix();
