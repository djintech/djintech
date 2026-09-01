-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'RECEIVED', 'READ');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'VOICE');

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "messageText" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "messages_ownerId_idx" ON "messages"("ownerId");

-- CreateIndex
CREATE INDEX "messages_receiverId_idx" ON "messages"("receiverId");

-- CreateIndex
CREATE INDEX "messages_ownerId_receiverId_idx" ON "messages"("ownerId", "receiverId");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
