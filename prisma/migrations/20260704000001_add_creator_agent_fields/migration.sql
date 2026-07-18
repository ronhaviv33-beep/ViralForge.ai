-- AlterTable
ALTER TABLE "BrandProfile" ADD COLUMN "niche" TEXT,
ADD COLUMN "goals" TEXT,
ADD COLUMN "postingStyle" TEXT,
ADD COLUMN "preferredPhrases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "bannedPhrases" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "examplePosts" TEXT;
