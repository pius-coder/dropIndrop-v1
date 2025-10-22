-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER', 'CLIENT');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'MTN_MOMO', 'ORANGE_MONEY', 'MOCK');

-- CreateEnum
CREATE TYPE "DropStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'DELIVERED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255),
    "phoneNumber" VARCHAR(20) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "sku" VARCHAR(50),
    "categoryId" TEXT NOT NULL,
    "images" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drops" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200),
    "scheduledDate" TIMESTAMP(6) NOT NULL,
    "status" "DropStatus" NOT NULL DEFAULT 'DRAFT',
    "sentAt" TIMESTAMP(6),
    "messageId" VARCHAR(100),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "drops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_groups" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "chatId" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "memberCount" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "whatsapp_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "orderNumber" VARCHAR(20) NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "paymentIntentId" VARCHAR(100),
    "paidAt" TIMESTAMP(6),
    "deliveredAt" TIMESTAMP(6),
    "deliveredBy" TEXT,
    "notes" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "qrCodeData" TEXT NOT NULL,
    "uniqueCode" VARCHAR(10) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "usedAt" TIMESTAMP(6),
    "usedBy" TEXT,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "siteName" VARCHAR(200) NOT NULL,
    "siteDescription" VARCHAR(500) NOT NULL,
    "contactEmail" VARCHAR(255) NOT NULL,
    "supportPhone" VARCHAR(20) NOT NULL,
    "businessAddress" VARCHAR(255) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Africa/Douala',
    "currency" VARCHAR(3) NOT NULL,
    "language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "whatsappApiUrl" VARCHAR(255) NOT NULL,
    "whatsappApiKey" VARCHAR(255) NOT NULL,
    "whatsappSessionName" VARCHAR(100) NOT NULL,
    "whatsappBusinessNumber" VARCHAR(20) NOT NULL,
    "whatsappWelcomeMessage" VARCHAR(500) NOT NULL,
    "whatsappAutoReplyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappBusinessHoursEnabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsappBusinessHours" JSONB NOT NULL,
    "paymentProvider" "PaymentProvider" NOT NULL DEFAULT 'MOCK',
    "paymentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "paymentTestMode" BOOLEAN NOT NULL DEFAULT true,
    "paymentSupportedCurrencies" TEXT[],
    "paymentMinAmount" DECIMAL(10,2) NOT NULL,
    "paymentMaxAmount" DECIMAL(10,2) NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "smsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "whatsappNotifications" BOOLEAN NOT NULL DEFAULT true,
    "orderUpdates" BOOLEAN NOT NULL DEFAULT true,
    "deliveryUpdates" BOOLEAN NOT NULL DEFAULT true,
    "promotionalMessages" BOOLEAN NOT NULL DEFAULT false,
    "isSetupComplete" BOOLEAN NOT NULL DEFAULT false,
    "setupCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drop_products" (
    "dropId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "drop_products_pkey" PRIMARY KEY ("dropId","productId")
);

-- CreateTable
CREATE TABLE "drop_groups" (
    "dropId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "drop_groups_pkey" PRIMARY KEY ("dropId","groupId")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "otpCode" VARCHAR(10) NOT NULL,
    "expiresAt" TIMESTAMP(6) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_whatsapp_groups" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,

    CONSTRAINT "user_whatsapp_groups_pkey" PRIMARY KEY ("userId","groupId")
);

-- CreateTable
CREATE TABLE "_DropOrders" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DropOrders_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_phoneNumber_key" ON "users"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_groups_chatId_key" ON "whatsapp_groups"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_orderId_key" ON "tickets"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_uniqueCode_key" ON "tickets"("uniqueCode");

-- CreateIndex
CREATE INDEX "_DropOrders_B_index" ON "_DropOrders"("B");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drops" ADD CONSTRAINT "drops_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_deliveredBy_fkey" FOREIGN KEY ("deliveredBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_usedBy_fkey" FOREIGN KEY ("usedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_products" ADD CONSTRAINT "drop_products_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "drops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_products" ADD CONSTRAINT "drop_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_groups" ADD CONSTRAINT "drop_groups_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "drops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drop_groups" ADD CONSTRAINT "drop_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "whatsapp_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_whatsapp_groups" ADD CONSTRAINT "user_whatsapp_groups_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_whatsapp_groups" ADD CONSTRAINT "user_whatsapp_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "whatsapp_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DropOrders" ADD CONSTRAINT "_DropOrders_A_fkey" FOREIGN KEY ("A") REFERENCES "drops"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DropOrders" ADD CONSTRAINT "_DropOrders_B_fkey" FOREIGN KEY ("B") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
