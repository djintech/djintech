INSERT INTO "profiles" ("userId", "createdAt", "updatedAt")
SELECT u."id", NOW(), NOW()
FROM "users" u
LEFT JOIN "profiles" p ON p."userId" = u."id"
WHERE u."deletedAt" IS NULL
  AND p."id" IS NULL;