/**
 * Prisma Seed Script
 *
 * Seeds database with initial data for development
 *
 * Run: pnpm db:seed
 */

import { PrismaClient } from "@prisma/client";
import { hash } from "crypto";

const prisma = new PrismaClient();

// Helper to hash password (simple for demo - use bcrypt in production)
function hashPassword(password: string): string {
  return hash("sha256", password, "hex");
}

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data (development only!)
  console.log("🧹 Clearing existing data...");
  try {
    await prisma.dropHistory.deleteMany();
    await prisma.dropGroup.deleteMany();
    await prisma.dropArticle.deleteMany();
    await prisma.drop.deleteMany();
    await prisma.order.deleteMany();
    await prisma.article.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.whatsAppGroup.deleteMany();
    await prisma.messageTemplate.deleteMany();
    await prisma.admin.deleteMany();
    await prisma.category.deleteMany();
    console.log("✅ Data cleared");
  } catch (error) {
    console.log("⚠️  Some tables don't exist yet, continuing...");
  }

  // 1. Create Super Admin
  console.log("👤 Creating admin users...");
  const superAdmin = await prisma.admin.create({
    data: {
      email: "admin@dropindrop.cm",
      password:
        process.env.NODE_ENV === "developpement"
          ? "Admin123!"
          : hashPassword("Admin123"), // TODO: Hash in production!
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
      permissions: ["ALL"],
    },
  });

  const manager = await prisma.admin.create({
    data: {
      email: "manager@dropindrop.cm",
      password: hashPassword("Manager123!"),
      name: "Delivery Manager",
      role: "DELIVERY_MANAGER",
      isActive: true,
    },
  });

  console.log(`✓ Created ${superAdmin.name} (${superAdmin.email})`);
  console.log(`✓ Created ${manager.name} (${manager.email})`);

  // 2. Create Categories
  console.log("\n📁 Creating categories...");
  const electronique = await prisma.category.create({
    data: {
      name: "Électronique",
      slug: "electronique",
      icon: "smartphone",
      order: 0,
    },
  });

  const mode = await prisma.category.create({
    data: {
      name: "Mode",
      slug: "mode",
      icon: "shirt",
      order: 1,
    },
  });

  const maison = await prisma.category.create({
    data: {
      name: "Maison & Jardin",
      slug: "maison-jardin",
      icon: "home",
      order: 2,
    },
  });

  console.log(`✓ Created ${electronique.name}`);
  console.log(`✓ Created ${mode.name}`);
  console.log(`✓ Created ${maison.name}`);

  // 3. Create Subcategories
  console.log("\n📂 Creating subcategories...");
  const smartphones = await prisma.subcategory.create({
    data: {
      name: "Smartphones",
      slug: "smartphones",
      categoryId: electronique.id,
      order: 0,
    },
  });

  const laptops = await prisma.subcategory.create({
    data: {
      name: "Ordinateurs",
      slug: "ordinateurs",
      categoryId: electronique.id,
      order: 1,
    },
  });

  const vetHomme = await prisma.subcategory.create({
    data: {
      name: "Vêtements Homme",
      slug: "vetements-homme",
      categoryId: mode.id,
      order: 0,
    },
  });

  console.log(`✓ Created ${smartphones.name}`);
  console.log(`✓ Created ${laptops.name}`);
  console.log(`✓ Created ${vetHomme.name}`);

  // 4. Create Articles
  console.log("\n📦 Creating articles...");
  const iphone15 = await prisma.article.create({
    data: {
      code: "ART-20240101-0001",
      name: "iPhone 15 Pro Max",
      description: "Le dernier iPhone avec puce A17 Pro",
      price: 850000,
      stock: 15,
      minStock: 5,
      categoryId: electronique.id,
      subcategoryId: smartphones.id,
      images: [
        "https://images.unsplash.com/photo-1696446702883-92807f81a838?w=400",
      ],
      videos: [],
      uniqueSlug: "iphone-15-pro-max-" + Date.now(),
      status: "AVAILABLE",
    },
  });

  const macbook = await prisma.article.create({
    data: {
      code: "ART-20240101-0002",
      name: "MacBook Pro 14 M3",
      description: "MacBook Pro avec puce M3, 16GB RAM",
      price: 1200000,
      stock: 8,
      minStock: 3,
      categoryId: electronique.id,
      subcategoryId: laptops.id,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
      ],
      videos: [],
      uniqueSlug: "macbook-pro-14-m3-" + Date.now(),
      status: "AVAILABLE",
    },
  });

  const chemise = await prisma.article.create({
    data: {
      code: "ART-20240101-0003",
      name: "Chemise Homme Élégante",
      description: "Chemise en coton, parfaite pour bureau",
      price: 15000,
      stock: 30,
      minStock: 10,
      categoryId: mode.id,
      subcategoryId: vetHomme.id,
      images: [
        "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400",
      ],
      videos: [],
      uniqueSlug: "chemise-homme-elegante-" + Date.now(),
      status: "AVAILABLE",
    },
  });

  console.log(`✓ Created ${iphone15.name} - ${iphone15.price} FCFA`);
  console.log(`✓ Created ${macbook.name} - ${macbook.price} FCFA`);
  console.log(`✓ Created ${chemise.name} - ${chemise.price} FCFA`);

  // 5. Create Customers
  console.log("\n👥 Creating customers...");
  const customer1 = await prisma.customer.create({
    data: {
      name: "Jean Mballa",
      phone: "+237672345678",
      email: "jean@example.com",
      totalOrders: 0,
      totalSpent: 0,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Marie Ngo",
      phone: "+237692345678",
      totalOrders: 0,
      totalSpent: 0,
    },
  });

  console.log(`✓ Created ${customer1.name} (${customer1.phone})`);
  console.log(`✓ Created ${customer2.name} (${customer2.phone})`);

  // 6. Create WhatsApp Groups
  console.log("\n💬 Creating WhatsApp groups...");
  const groupVIP = await prisma.whatsAppGroup.create({
    data: {
      wahaGroupId: "120363XXX@g.us",
      name: "Clients VIP",
      memberCount: 50,
      isActive: true,
    },
  });

  const groupGeneral = await prisma.whatsAppGroup.create({
    data: {
      wahaGroupId: "120363YYY@g.us",
      name: "Clients Généraux",
      memberCount: 150,
      isActive: true,
    },
  });

  console.log(`✓ Created ${groupVIP.name} (${groupVIP.memberCount} membres)`);
  console.log(
    `✓ Created ${groupGeneral.name} (${groupGeneral.memberCount} membres)`,
  );

  // 7. Create Message Template
  console.log("\n📝 Creating message template...");
  const template = await prisma.messageTemplate.create({
    data: {
      name: "Template Promotion",
      content:
        "🎉 *Nouvelle Promotion!*\n\n{{article_name}}\n💰 Prix: {{price}} FCFA\n📦 Stock: {{stock}}\n\n👉 Commandez maintenant!",
      isDefault: true,
    },
  });

  console.log(`✓ Created ${template.name}`);

  // 8. Create Site Settings
  console.log("\n⚙️ Creating site settings...");
  const settings = await prisma.siteSettings.create({
    data: {
      whatsappGroupLink: "https://chat.whatsapp.com/XXXXX",
      wahaApiUrl: process.env.WAHA_API_URL || "http://localhost:3001",
      wahaApiKey: process.env.WAHA_API_KEY || "your-api-key",
      wahaPhoneNumber: "+237600000000",
      storeName: "Drop-In-Drop Cameroun",
      storeAddress: "Douala, Akwa",
      storeHours: "Lun-Sam: 8h-18h",
      supportPhone: "+237600000000",
      pawapayApiKey: process.env.PAWAPAY_API_KEY || "your-pawapay-key",
      pawapayMode: "test",
      enableMtnMomo: true,
      enableOrangeMoney: true,
      homeTitle: "Bienvenue sur Drop-In-Drop",
      homeSubtitle: "Les meilleures offres du Cameroun",
      ticketExpiryDays: 7,
      updatedBy: superAdmin.id,
    },
  });

  console.log(`✓ Created site settings`);

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - ${2} admins`);
  console.log(`   - ${3} categories`);
  console.log(`   - ${3} subcategories`);
  console.log(`   - ${3} articles`);
  console.log(`   - ${2} customers`);
  console.log(`   - ${2} WhatsApp groups`);
  console.log(`   - ${1} message template`);
  console.log("\n🔐 Admin Credentials:");
  console.log(`   Email: admin@dropindrop.cm`);
  console.log(`   Password: Admin123!`);
  console.log(`   \n   Email: manager@dropindrop.cm`);
  console.log(`   Password: Manager123!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
