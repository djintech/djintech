/*
  Warnings:

  - You are about to drop the `Policies` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Policies";

-- CreateTable
CREATE TABLE "policies" (
    "id" SERIAL NOT NULL,
    "type" "PolicyType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "policies_pkey" PRIMARY KEY ("id")
);
