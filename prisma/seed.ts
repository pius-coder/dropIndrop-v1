import { PrismaClient, PaymentProvider } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Check if default configuration exists
  const existingConfig = await prisma.configuration.findUnique({
    where: { id: "default" },
  });

  if (existingConfig) {
    console.log("✅ Default configuration already exists");
    return;
  }

  // Create default configuration
  const defaultConfig = {
    id: "default",
    siteName: "DropInDrop",
    siteDescription: "WhatsApp E-commerce Platform",
    contactEmail: "admin@dropindrop.com",
    supportPhone: "+237600000000",
    businessAddress: "Cameroon",
    timezone: "Africa/Douala",
    currency: "XAF",
    language: "en",
    whatsappApiUrl: "http://localhost:8000",
    whatsappApiKey: "admin",
    whatsappSessionName: "default",
    whatsappBusinessNumber: "+237600000000",
    whatsappWelcomeMessage: "Welcome to DropInDrop! How can we help you today?",
    whatsappAutoReplyEnabled: false,
    whatsappBusinessHoursEnabled: false,
    whatsappBusinessHours: JSON.stringify({
      enabled: false,
      timezone: "Africa/Douala",
      monday: { enabled: true, open: "08:00", close: "18:00" },
      tuesday: { enabled: true, open: "08:00", close: "18:00" },
      wednesday: { enabled: true, open: "08:00", close: "18:00" },
      thursday: { enabled: true, open: "08:00", close: "18:00" },
      friday: { enabled: true, open: "08:00", close: "18:00" },
      saturday: { enabled: false, open: "09:00", close: "15:00" },
      sunday: { enabled: false, open: "09:00", close: "15:00" },
    }),
    paymentProvider: PaymentProvider.MOCK,
    paymentEnabled: true,
    paymentTestMode: true,
    paymentSupportedCurrencies: ["XAF", "USD", "EUR"],
    paymentMinAmount: 100,
    paymentMaxAmount: 1000000,
    emailNotifications: true,
    smsNotifications: false,
    whatsappNotifications: true,
    orderUpdates: true,
    deliveryUpdates: true,
    promotionalMessages: false,
    isSetupComplete: false,
    setupCompletedAt: null,
  };

  await prisma.configuration.create({
    data: defaultConfig,
  });

  console.log("✅ Default configuration created successfully");
  console.log("📧 Contact Email: admin@dropindrop.com");
  console.log("🔑 Default Setup: Configure WhatsApp and payment settings");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
