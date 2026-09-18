-- CreateEnum
CREATE TYPE "MessageMediaType" AS ENUM ('IMAGE', 'VOICE');

-- CreateTable
CREATE TABLE "messageMedia" (
    "id" SERIAL NOT NULL,
    "messageId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "fileType" "MessageMediaType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messageMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messageMedia_messageId_key" ON "messageMedia"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "messageMedia_key_key" ON "messageMedia"("key");

-- AddForeignKey
ALTER TABLE "messageMedia" ADD CONSTRAINT "messageMedia_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
