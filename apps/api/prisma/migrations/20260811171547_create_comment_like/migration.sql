-- CreateEnum
CREATE TYPE "LikeCommentStatus" AS ENUM ('NONE', 'LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "commentLikes" (
    "id" SERIAL NOT NULL,
    "status" "LikeCommentStatus" NOT NULL DEFAULT 'NONE',
    "commentId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentLikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commentLikes_commentId_idx" ON "commentLikes"("commentId");

-- CreateIndex
CREATE INDEX "commentLikes_userId_idx" ON "commentLikes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "commentLikes_commentId_userId_key" ON "commentLikes"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentLikes" ADD CONSTRAINT "commentLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
