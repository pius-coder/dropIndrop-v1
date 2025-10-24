/*
  Warnings:

  - Added the required column `createdBy` to the `whatsapp_groups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "whatsapp_groups" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "lastActivity" TIMESTAMP(6);

-- AddForeignKey
ALTER TABLE "whatsapp_groups" ADD CONSTRAINT "whatsapp_groups_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
