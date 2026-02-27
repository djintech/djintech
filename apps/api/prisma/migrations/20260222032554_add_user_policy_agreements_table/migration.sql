-- CreateTable
CREATE TABLE "userPolicyAgreements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "policyId" INTEGER NOT NULL,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "userPolicyAgreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "userPolicyAgreements_userId_policyId_key" ON "userPolicyAgreements"("userId", "policyId");

-- AddForeignKey
ALTER TABLE "userPolicyAgreements" ADD CONSTRAINT "userPolicyAgreements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userPolicyAgreements" ADD CONSTRAINT "userPolicyAgreements_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
