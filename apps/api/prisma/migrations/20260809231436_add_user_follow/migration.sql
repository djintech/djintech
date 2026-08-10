-- CreateTable
CREATE TABLE "userFollows" (
    "id" SERIAL NOT NULL,
    "followerId" INTEGER NOT NULL,
    "followingId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userFollows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "userFollows_followerId_idx" ON "userFollows"("followerId");

-- CreateIndex
CREATE INDEX "userFollows_followingId_idx" ON "userFollows"("followingId");

-- CreateIndex
CREATE UNIQUE INDEX "userFollows_followerId_followingId_key" ON "userFollows"("followerId", "followingId");

-- AddForeignKey
ALTER TABLE "userFollows" ADD CONSTRAINT "userFollows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userFollows" ADD CONSTRAINT "userFollows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
