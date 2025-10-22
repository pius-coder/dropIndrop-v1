-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('STOPPED', 'STARTING', 'SCAN_QR_CODE', 'WORKING', 'FAILED');

-- CreateEnum
CREATE TYPE "ArticleStatus" AS ENUM ('DISPONIBLE', 'VENDU', 'ARCHIVE');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('EN_ATTENTE', 'PAYE', 'RETIRE', 'ANNULE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('EN_ATTENTE', 'COMPLETE', 'ECHEC');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MTN_MOMO_CM', 'ORANGE_MONEY_CM');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER', 'LOCATION', 'CONTACT', 'VOICE', 'BUTTON', 'TEMPLATE');

-- CreateEnum
CREATE TYPE "MessageStatusType" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED', 'PENDING');

-- CreateEnum
CREATE TYPE "ActivityAction" AS ENUM ('ARTICLE_CREATED', 'ARTICLE_UPDATED', 'ARTICLE_DELETED', 'ARTICLE_PUBLISHED', 'ORDER_CREATED', 'PAYMENT_RECEIVED', 'ORDER_VALIDATED', 'ORDER_CANCELLED', 'WITHDRAWAL_VALIDATED', 'USER_REGISTERED', 'OTP_SENT', 'WHATSAPP_CONNECTED', 'WHATSAPP_DISCONNECTED', 'DROP_CREATED', 'DROP_UPDATED', 'DROP_DELETED');

-- CreateEnum
CREATE TYPE "GroupMappingType" AS ENUM ('NEW_ARTICLES', 'CATEGORY_ARTICLES', 'DROP_NOTIFICATIONS', 'ORDER_NOTIFICATIONS', 'PAYMENT_NOTIFICATIONS', 'GENERAL_ANNOUNCEMENTS');

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "apiKey" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "numeroWhatsapp" TEXT NOT NULL,
    "otp" TEXT,
    "otpExpiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "nombreAchats" INTEGER NOT NULL DEFAULT 0,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppSession" (
    "id" SERIAL NOT NULL,
    "sessionName" TEXT NOT NULL DEFAULT 'default',
    "status" "SessionStatus" NOT NULL,
    "sessionConfig" JSONB NOT NULL,
    "qrCode" TEXT,
    "sessionData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" INTEGER NOT NULL,

    CONSTRAINT "WhatsAppSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "chatId" TEXT NOT NULL,
    "name" TEXT,
    "isGroup" BOOLEAN NOT NULL DEFAULT false,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "lastMessageAt" TIMESTAMP(3),
    "unreadCount" INTEGER NOT NULL DEFAULT 0,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "contactName" TEXT,
    "contactNumber" TEXT,
    "contactProfilePicture" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" INTEGER NOT NULL,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "messageId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "from" TEXT,
    "to" TEXT,
    "fromMe" BOOLEAN NOT NULL DEFAULT false,
    "body" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "hasMedia" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrl" TEXT,
    "mediaType" TEXT,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "status" "MessageStatusType" NOT NULL DEFAULT 'PENDING',
    "replyTo" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "chatIdRef" INTEGER NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageMedia" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "mediaType" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "localPath" TEXT,
    "remoteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MessageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageStatus" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "status" "MessageStatusType" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "errorMessage" TEXT,

    CONSTRAINT "MessageStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "codeArticle" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT,
    "prix" INTEGER NOT NULL,
    "taille" TEXT,
    "couleur" TEXT,
    "marque" TEXT,
    "quantiteStock" INTEGER NOT NULL DEFAULT 1,
    "statut" "ArticleStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "lienUnique" TEXT NOT NULL,
    "vues" INTEGER NOT NULL DEFAULT 0,
    "ventes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryId" TEXT,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleImage" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL DEFAULT 0,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commande" (
    "id" TEXT NOT NULL,
    "numeroCommande" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "montantTotal" INTEGER NOT NULL,
    "statutPaiement" "OrderStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "statutRetrait" "OrderStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "codeTicket" TEXT NOT NULL,
    "ticketExpireLe" TIMESTAMP(3),
    "notesClient" TEXT,
    "payeLe" TIMESTAMP(3),
    "retireLe" TIMESTAMP(3),
    "retirePar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commande_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paiement" (
    "id" TEXT NOT NULL,
    "commandeId" TEXT NOT NULL,
    "transactionId" TEXT,
    "statut" "PaymentStatus" NOT NULL DEFAULT 'EN_ATTENTE',
    "method" "PaymentMethod" NOT NULL,
    "montant" INTEGER NOT NULL,
    "phoneNumber" TEXT,
    "rawPayload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paiement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" TEXT NOT NULL,
    "nomBoutique" TEXT NOT NULL DEFAULT 'Drop In Drop',
    "adresseBoutique" TEXT NOT NULL DEFAULT 'Akwa, Douala - Face Total Bonanjo',
    "telephoneBoutique" TEXT NOT NULL DEFAULT '+237 XXX XXX XXX',
    "horairesBoutique" TEXT NOT NULL DEFAULT 'Lun-Sam: 9h-18h',
    "dureeValiditeTicket" INTEGER NOT NULL DEFAULT 7,
    "montantMinimumCommande" INTEGER NOT NULL DEFAULT 5000,
    "moyensPaiement" JSONB NOT NULL DEFAULT '["MTN_MOMO_CM", "ORANGE_MONEY_CM"]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "statut" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Drop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DropArticle" (
    "id" TEXT NOT NULL,
    "dropId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,

    CONSTRAINT "DropArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppGroup" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "owner" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMapping" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "type" "GroupMappingType" NOT NULL,
    "categoryId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "action" "ActivityAction" NOT NULL,
    "adminId" INTEGER,
    "clientId" TEXT,
    "articleId" TEXT,
    "commandeId" TEXT,
    "description" TEXT NOT NULL,
    "details" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "groupMappingId" TEXT,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_apiKey_key" ON "Admin"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "Client_numeroWhatsapp_key" ON "Client"("numeroWhatsapp");

-- CreateIndex
CREATE INDEX "Client_numeroWhatsapp_idx" ON "Client"("numeroWhatsapp");

-- CreateIndex
CREATE INDEX "Client_otpExpiresAt_idx" ON "Client"("otpExpiresAt");

-- CreateIndex
CREATE INDEX "WhatsAppSession_adminId_idx" ON "WhatsAppSession"("adminId");

-- CreateIndex
CREATE INDEX "WhatsAppSession_status_idx" ON "WhatsAppSession"("status");

-- CreateIndex
CREATE INDEX "WhatsAppSession_adminId_status_idx" ON "WhatsAppSession"("adminId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppSession_sessionName_adminId_key" ON "WhatsAppSession"("sessionName", "adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_chatId_key" ON "Chat"("chatId");

-- CreateIndex
CREATE INDEX "Chat_sessionId_idx" ON "Chat"("sessionId");

-- CreateIndex
CREATE INDEX "Chat_chatId_idx" ON "Chat"("chatId");

-- CreateIndex
CREATE INDEX "Chat_sessionId_chatId_idx" ON "Chat"("sessionId", "chatId");

-- CreateIndex
CREATE INDEX "Chat_lastMessageAt_idx" ON "Chat"("lastMessageAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_messageId_key" ON "Message"("messageId");

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_from_idx" ON "Message"("from");

-- CreateIndex
CREATE INDEX "Message_timestamp_idx" ON "Message"("timestamp");

-- CreateIndex
CREATE INDEX "Message_messageType_idx" ON "Message"("messageType");

-- CreateIndex
CREATE INDEX "Message_status_idx" ON "Message"("status");

-- CreateIndex
CREATE INDEX "Message_chatId_timestamp_idx" ON "Message"("chatId", "timestamp");

-- CreateIndex
CREATE INDEX "MessageMedia_messageId_idx" ON "MessageMedia"("messageId");

-- CreateIndex
CREATE INDEX "MessageMedia_mediaType_idx" ON "MessageMedia"("mediaType");

-- CreateIndex
CREATE INDEX "MessageStatus_messageId_idx" ON "MessageStatus"("messageId");

-- CreateIndex
CREATE INDEX "MessageStatus_status_idx" ON "MessageStatus"("status");

-- CreateIndex
CREATE INDEX "MessageStatus_timestamp_idx" ON "MessageStatus"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "MessageStatus_messageId_status_timestamp_key" ON "MessageStatus"("messageId", "status", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Article_codeArticle_unique" ON "Article"("codeArticle");

-- CreateIndex
CREATE UNIQUE INDEX "Article_lienUnique_key" ON "Article"("lienUnique");

-- CreateIndex
CREATE INDEX "Article_statut_idx" ON "Article"("statut");

-- CreateIndex
CREATE INDEX "Article_categoryId_idx" ON "Article"("categoryId");

-- CreateIndex
CREATE INDEX "Article_createdAt_idx" ON "Article"("createdAt");

-- CreateIndex
CREATE INDEX "Article_prix_idx" ON "Article"("prix");

-- CreateIndex
CREATE UNIQUE INDEX "Article_codeArticle_key" ON "Article"("codeArticle");

-- CreateIndex
CREATE INDEX "ArticleImage_articleId_idx" ON "ArticleImage"("articleId");

-- CreateIndex
CREATE INDEX "ArticleImage_ordre_idx" ON "ArticleImage"("ordre");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_numeroCommande_unique" ON "Commande"("numeroCommande");

-- CreateIndex
CREATE UNIQUE INDEX "Commande_codeTicket_unique" ON "Commande"("codeTicket");

-- CreateIndex
CREATE INDEX "Commande_articleId_idx" ON "Commande"("articleId");

-- CreateIndex
CREATE INDEX "Commande_clientId_idx" ON "Commande"("clientId");

-- CreateIndex
CREATE INDEX "Commande_statutPaiement_idx" ON "Commande"("statutPaiement");

-- CreateIndex
CREATE INDEX "Commande_statutRetrait_idx" ON "Commande"("statutRetrait");

-- CreateIndex
CREATE INDEX "Commande_codeTicket_idx" ON "Commande"("codeTicket");

-- CreateIndex
CREATE INDEX "Commande_createdAt_idx" ON "Commande"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Paiement_commandeId_key" ON "Paiement"("commandeId");

-- CreateIndex
CREATE INDEX "Paiement_commandeId_idx" ON "Paiement"("commandeId");

-- CreateIndex
CREATE INDEX "Paiement_statut_idx" ON "Paiement"("statut");

-- CreateIndex
CREATE INDEX "Paiement_transactionId_idx" ON "Paiement"("transactionId");

-- CreateIndex
CREATE INDEX "Notification_recipient_idx" ON "Notification"("recipient");

-- CreateIndex
CREATE INDEX "Notification_statut_idx" ON "Notification"("statut");

-- CreateIndex
CREATE INDEX "Notification_sentAt_idx" ON "Notification"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Drop_adminId_idx" ON "Drop"("adminId");

-- CreateIndex
CREATE INDEX "Drop_createdAt_idx" ON "Drop"("createdAt");

-- CreateIndex
CREATE INDEX "DropArticle_dropId_idx" ON "DropArticle"("dropId");

-- CreateIndex
CREATE INDEX "DropArticle_articleId_idx" ON "DropArticle"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "DropArticle_dropId_articleId_key" ON "DropArticle"("dropId", "articleId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppGroup_groupId_key" ON "WhatsAppGroup"("groupId");

-- CreateIndex
CREATE INDEX "WhatsAppGroup_groupId_idx" ON "WhatsAppGroup"("groupId");

-- CreateIndex
CREATE INDEX "WhatsAppGroup_isActive_idx" ON "WhatsAppGroup"("isActive");

-- CreateIndex
CREATE INDEX "GroupMapping_groupId_idx" ON "GroupMapping"("groupId");

-- CreateIndex
CREATE INDEX "GroupMapping_type_idx" ON "GroupMapping"("type");

-- CreateIndex
CREATE INDEX "GroupMapping_categoryId_idx" ON "GroupMapping"("categoryId");

-- CreateIndex
CREATE INDEX "GroupMapping_isActive_idx" ON "GroupMapping"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "GroupMapping_groupId_type_categoryId_key" ON "GroupMapping"("groupId", "type", "categoryId");

-- CreateIndex
CREATE INDEX "Activity_action_idx" ON "Activity"("action");

-- CreateIndex
CREATE INDEX "Activity_adminId_idx" ON "Activity"("adminId");

-- CreateIndex
CREATE INDEX "Activity_clientId_idx" ON "Activity"("clientId");

-- CreateIndex
CREATE INDEX "Activity_articleId_idx" ON "Activity"("articleId");

-- CreateIndex
CREATE INDEX "Activity_commandeId_idx" ON "Activity"("commandeId");

-- CreateIndex
CREATE INDEX "Activity_groupMappingId_idx" ON "Activity"("groupMappingId");

-- CreateIndex
CREATE INDEX "Activity_timestamp_idx" ON "Activity"("timestamp");

-- AddForeignKey
ALTER TABLE "WhatsAppSession" ADD CONSTRAINT "WhatsAppSession_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WhatsAppSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatIdRef_fkey" FOREIGN KEY ("chatIdRef") REFERENCES "Chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageMedia" ADD CONSTRAINT "MessageMedia_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageStatus" ADD CONSTRAINT "MessageStatus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Article" ADD CONSTRAINT "Article_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleImage" ADD CONSTRAINT "ArticleImage_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commande" ADD CONSTRAINT "Commande_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paiement" ADD CONSTRAINT "Paiement_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drop" ADD CONSTRAINT "Drop_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropArticle" ADD CONSTRAINT "DropArticle_dropId_fkey" FOREIGN KEY ("dropId") REFERENCES "Drop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DropArticle" ADD CONSTRAINT "DropArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMapping" ADD CONSTRAINT "GroupMapping_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "WhatsAppGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMapping" ADD CONSTRAINT "GroupMapping_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_commandeId_fkey" FOREIGN KEY ("commandeId") REFERENCES "Commande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_groupMappingId_fkey" FOREIGN KEY ("groupMappingId") REFERENCES "GroupMapping"("id") ON DELETE SET NULL ON UPDATE CASCADE;
