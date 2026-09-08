-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Feedback" DROP COLUMN "strengths",
ADD COLUMN     "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "issues",
ADD COLUMN     "issues" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "suggestions",
ADD COLUMN     "suggestions" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Learner" ADD COLUMN "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "requirements",
ADD COLUMN     "requirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "difficulty",
ADD COLUMN     "difficulty" "Difficulty" NOT NULL;

-- CreateIndex
CREATE INDEX "Attempt_learnerId_problemId_idx" ON "Attempt"("learnerId", "problemId");

-- CreateIndex
CREATE INDEX "Attempt_problemId_idx" ON "Attempt"("problemId");

-- CreateIndex
CREATE UNIQUE INDEX "Learner_email_key" ON "Learner"("email");
