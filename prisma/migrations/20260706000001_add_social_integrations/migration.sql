-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('instagram', 'youtube', 'tiktok');

-- CreateTable
CREATE TABLE "ConnectedAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "externalAccountId" TEXT NOT NULL,
    "accountName" TEXT,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConnectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "generationId" TEXT,
    "connectedAccountId" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "externalUrl" TEXT,
    "title" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPerformanceSnapshot" (
    "id" TEXT NOT NULL,
    "externalPostId" TEXT NOT NULL,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "saves" INTEGER,
    "reach" INTEGER,
    "engagementRate" DOUBLE PRECISION,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostPerformanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedAccount_userId_platform_externalAccountId_key" ON "ConnectedAccount"("userId", "platform", "externalAccountId");

-- CreateIndex
CREATE INDEX "ConnectedAccount_userId_idx" ON "ConnectedAccount"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalPost_connectedAccountId_externalPostId_key" ON "ExternalPost"("connectedAccountId", "externalPostId");

-- CreateIndex
CREATE INDEX "ExternalPost_userId_idx" ON "ExternalPost"("userId");

-- CreateIndex
CREATE INDEX "ExternalPost_generationId_idx" ON "ExternalPost"("generationId");

-- CreateIndex
CREATE INDEX "PostPerformanceSnapshot_externalPostId_capturedAt_idx" ON "PostPerformanceSnapshot"("externalPostId", "capturedAt");

-- AddForeignKey
ALTER TABLE "ConnectedAccount" ADD CONSTRAINT "ConnectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPost" ADD CONSTRAINT "ExternalPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPost" ADD CONSTRAINT "ExternalPost_generationId_fkey" FOREIGN KEY ("generationId") REFERENCES "Generation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalPost" ADD CONSTRAINT "ExternalPost_connectedAccountId_fkey" FOREIGN KEY ("connectedAccountId") REFERENCES "ConnectedAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPerformanceSnapshot" ADD CONSTRAINT "PostPerformanceSnapshot_externalPostId_fkey" FOREIGN KEY ("externalPostId") REFERENCES "ExternalPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
