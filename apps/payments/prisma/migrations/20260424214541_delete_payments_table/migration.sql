/*
  Warnings:

  - You are about to drop the `payments` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentType` to the `subscriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_subscriptionId_fkey";

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "paymentType" "PaymentType" NOT NULL,
ALTER COLUMN "expireAt" DROP NOT NULL;

-- DropTable
DROP TABLE "payments";

-- DropEnum
DROP TYPE "PaymentStatus";
