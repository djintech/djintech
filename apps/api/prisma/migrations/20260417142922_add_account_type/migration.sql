-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('Personal', 'Business');

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "accountType" "AccountType" NOT NULL DEFAULT 'Personal';
