/*
  Warnings:

  - You are about to drop the column `resultsRevealed` on the `HackathonSettings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResultStage" AS ENUM ('HIDDEN', 'IDEA_REVEALED', 'FINAL_REVEALED');

-- AlterTable
ALTER TABLE "HackathonSettings" DROP COLUMN "resultsRevealed",
ADD COLUMN     "resultStage" "ResultStage" NOT NULL DEFAULT 'HIDDEN';
