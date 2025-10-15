/**
 * Test Database Connection
 * 
 * Quick script to verify Prisma client works
 */

import { prisma, checkDatabaseConnection } from "../lib/db";

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test connection
    const connected = await checkDatabaseConnection();
    
    if (connected) {
      console.log("✅ Database connection successful!\n");
      
      // Test query
      console.log("📊 Testing query...");
      const adminCount = await prisma.admin.count();
      const categoryCount = await prisma.category.count();
      const articleCount = await prisma.article.count();
      
      console.log(`   Admins: ${adminCount}`);
      console.log(`   Categories: ${categoryCount}`);
      console.log(`   Articles: ${articleCount}`);
      
      console.log("\n✅ All tests passed!");
    } else {
      console.log("❌ Database connection failed!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
