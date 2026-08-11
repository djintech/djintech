-- CreateEnum
CREATE TYPE "LikePostStatus" AS ENUM ('NONE', 'LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "postLikes" (
    "id" SERIAL NOT NULL,
    "status" "LikePostStatus" NOT NULL DEFAULT 'NONE',
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "postLikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "postLikes_postId_idx" ON "postLikes"("postId");

-- CreateIndex
CREATE INDEX "postLikes_userId_idx" ON "postLikes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "postLikes_postId_userId_key" ON "postLikes"("postId", "userId");

-- AddForeignKey
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postLikes" ADD CONSTRAINT "postLikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
