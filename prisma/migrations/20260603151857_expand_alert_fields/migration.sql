/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `Alert` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('NONE', 'SUGGESTED', 'AWAITING', 'EXECUTED', 'FAILED');

-- AlterTable
ALTER TABLE "Alert" DROP COLUMN "diagnosis",
ADD COLUMN     "agentAction" JSONB,
ADD COLUMN     "agentResult" TEXT,
ADD COLUMN     "agentStatus" "AgentStatus" NOT NULL DEFAULT 'NONE',
ADD COLUMN     "awsAccountId" TEXT,
ADD COLUMN     "cause" TEXT,
ADD COLUMN     "fixWorked" BOOLEAN,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "severity" TEXT,
ADD COLUMN     "steps" JSONB,
ADD COLUMN     "summary" TEXT;
