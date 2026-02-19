-- CreateEnum
CREATE TYPE "PolicyType" AS ENUM ('tos', 'privacy');

-- CreateTable
CREATE TABLE "Policies" (
    "id" SERIAL NOT NULL,
    "type" "PolicyType" NOT NULL,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policies_pkey" PRIMARY KEY ("id")
);
