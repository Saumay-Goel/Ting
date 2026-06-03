/*
  Warnings:

  - A unique constraint covering the columns `[awsAccountId]` on the table `AwsConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AwsConnection" ADD COLUMN     "awsAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AwsConnection_awsAccountId_key" ON "AwsConnection"("awsAccountId");
