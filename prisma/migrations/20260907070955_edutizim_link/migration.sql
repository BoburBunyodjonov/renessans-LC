-- AlterTable
ALTER TABLE "SiteSetting" ADD COLUMN     "edutizim" JSONB;

-- AlterTable
ALTER TABLE "TestAttempt" ADD COLUMN     "edutizimError" TEXT,
ADD COLUMN     "edutizimOrderId" TEXT,
ADD COLUMN     "edutizimSentAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TestLevelBand" ADD COLUMN     "edutizimCourseId" TEXT,
ADD COLUMN     "edutizimSubCourseId" TEXT;
