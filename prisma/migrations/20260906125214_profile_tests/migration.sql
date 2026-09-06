-- CreateEnum
CREATE TYPE "TestResultMode" AS ENUM ('SCORE', 'PROFILE');

-- AlterTable
ALTER TABLE "TestCategory" ADD COLUMN     "resultMode" "TestResultMode" NOT NULL DEFAULT 'SCORE';

-- AlterTable
ALTER TABLE "TestLevelBand" ADD COLUMN     "profileKey" TEXT;

-- AlterTable
ALTER TABLE "TestOption" ADD COLUMN     "profileKey" TEXT;
