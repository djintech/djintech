-- AlterTable
ALTER TABLE "users" ADD COLUMN     "banDate" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;
