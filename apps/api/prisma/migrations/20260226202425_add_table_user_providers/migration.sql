/*
  Warnings:

  - You are about to drop the column `isConfirmed` on the `emailConfirmations` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('google', 'github');

-- AlterTable
ALTER TABLE "emailConfirmations" DROP COLUMN "isConfirmed";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- CreateTable
CREATE TABLE "userProviders" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "ProviderType" NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userProviders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userProviders_userId_idx" ON "userProviders"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "userProviders_provider_providerId_key" ON "userProviders"("provider", "providerId");

-- AddForeignKey
ALTER TABLE "userProviders" ADD CONSTRAINT "userProviders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
