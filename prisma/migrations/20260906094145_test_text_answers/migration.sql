-- CreateEnum
CREATE TYPE "TestAnswerType" AS ENUM ('CHOICE', 'TEXT');

-- AlterTable
ALTER TABLE "TestQuestion" ADD COLUMN     "acceptedAnswers" TEXT[],
ADD COLUMN     "answerType" "TestAnswerType" NOT NULL DEFAULT 'CHOICE';
