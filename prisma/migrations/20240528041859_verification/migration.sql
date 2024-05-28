-- CreateTable
CREATE TABLE "AuthVerificationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "digits" INTEGER NOT NULL,
    "algorithm" TEXT NOT NULL,
    "charSet" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthVerificationCode_type_target_key" ON "AuthVerificationCode"("type", "target");
